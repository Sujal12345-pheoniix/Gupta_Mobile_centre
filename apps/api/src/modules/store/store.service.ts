import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { Prisma, ProductStatus, TrackingMode, StockMovementType, SaleStatus, PaymentMethod, AttendanceStatus, EmployeeStatus } from '@prisma/client';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to ensure an Organization and Branch exist in PostgreSQL
   */
  private async getOrCreateOrgAndBranch() {
    let org = await this.prisma.organization.findFirst();
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          name: 'Gupta Mobile Centre',
          currency: 'INR',
        },
      });
    }

    let branch = await this.prisma.branch.findFirst({
      where: { organizationId: org.id },
    });
    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          organizationId: org.id,
          name: 'Head Office - Gurgaon',
          code: 'GGN-01',
        },
      });
    }

    return { org, branch };
  }

  /**
   * GET ALL STORE DATA from real PostgreSQL database
   */
  async getStoreData() {
    const { org, branch } = await this.getOrCreateOrgAndBranch();

    // 1. Fetch Products with Variants, Category, Brand, and StockBalances
    const productsDb = await this.prisma.product.findMany({
      where: { organizationId: org.id },
      include: {
        category: true,
        brand: true,
        variants: {
          include: {
            stockBalances: {
              where: { branchId: branch.id },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const products = productsDb.map((p) => {
      const v = p.variants[0];
      const stock = v?.stockBalances[0] ? Number(v.stockBalances[0].quantity) : 0;
      return {
        id: p.id,
        variantId: v?.id,
        name: p.name,
        category: p.category?.name || 'Smartphones',
        brand: p.brand?.name || 'Generic',
        sku: v?.sku || '',
        barcode: v?.barcode || '',
        purchasePrice: v ? Number(v.purchasePrice) : 0,
        sellingPrice: v ? Number(v.sellingPrice) : 0,
        mrp: v ? Number(v.mrp) : 0,
        stock,
        minStock: v ? Number(v.minStock) : 5,
        taxRate: v ? Number(v.taxRate) : 18,
        trackingMode: v?.trackingMode || 'NONE',
        status: p.status,
      };
    });

    // 2. Fetch Customers
    const customersDb = await this.prisma.customer.findMany({
      where: { organizationId: org.id },
      include: {
        sales: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const customers = customersDb.map((c) => {
      const totalPurchases = c.sales.reduce((sum, s) => sum + Number(s.total), 0);
      return {
        id: c.id,
        name: c.name,
        phone: c.phone || '',
        email: c.email || '',
        address: typeof c.address === 'string' ? c.address : (c.address as any)?.address || '',
        totalPurchases,
        outstandingBalance: 0,
        lastVisit: c.createdAt.toISOString().split('T')[0],
      };
    });

    // 3. Fetch Employees with today's attendance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employeesDb = await this.prisma.employee.findMany({
      where: { organizationId: org.id },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
        attendance: {
          where: {
            date: { gte: today },
          },
        },
      },
      orderBy: { joiningDate: 'asc' },
    });

    const employees = employeesDb.map((e) => {
      const roleName = e.user?.roles[0]?.role?.name || 'Staff';
      const att = e.attendance[0]?.status || 'PRESENT';
      return {
        id: e.id,
        code: e.employeeCode,
        name: e.name,
        role: roleName,
        phone: e.phone || '',
        baseSalary: Number(e.baseSalary),
        commissionRate: Number(e.commissionRate),
        totalSalesMonth: 0,
        status: e.status,
        todayAttendance: att,
      };
    });

    // 4. Fetch Stock Movements
    const movementsDb = await this.prisma.stockMovement.findMany({
      where: { branchId: branch.id },
      include: {
        variant: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const stockMovements = movementsDb.map((sm) => ({
      id: sm.id,
      date: sm.createdAt.toLocaleString('en-IN'),
      sku: sm.variant.sku,
      productName: sm.variant.product.name,
      type: sm.type,
      quantity: Number(sm.quantity),
      reason: sm.reason || '',
      actor: (sm.metadata as any)?.actor || 'Staff',
    }));

    // 5. Fetch Sales
    const salesDb = await this.prisma.sale.findMany({
      where: { branchId: branch.id },
      include: {
        customer: true,
        staff: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const sales = salesDb.map((s) => ({
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      date: s.createdAt.toLocaleString('en-IN'),
      customerName: s.customer?.name || 'Walk-in Customer',
      customerPhone: s.customer?.phone || '',
      itemsCount: s.items.reduce((sum, item) => sum + Number(item.quantity), 0),
      subtotal: Number(s.subtotal),
      discount: Number(s.discountAmount),
      tax: Number(s.taxAmount),
      total: Number(s.total),
      paidAmount: Number(s.paidAmount),
      paymentMethod: (s.payments[0]?.method || 'CASH') as any,
      status: s.status,
      staffName: s.staff?.email?.split('@')[0] || 'Staff',
    }));

    return {
      products,
      customers,
      employees,
      stockMovements,
      sales,
    };
  }

  /**
   * CREATE PRODUCT in Neon PostgreSQL
   */
  async createProduct(dto: {
    name: string;
    category?: string;
    brand?: string;
    sku: string;
    barcode?: string;
    purchasePrice: number;
    sellingPrice: number;
    mrp?: number;
    stock?: number;
    minStock?: number;
    taxRate?: number;
    trackingMode?: string;
  }) {
    const { org, branch } = await this.getOrCreateOrgAndBranch();

    // 1. Find or create Category
    let category = null;
    if (dto.category) {
      category = await this.prisma.category.upsert({
        where: { organizationId_name: { organizationId: org.id, name: dto.category } },
        update: {},
        create: { organizationId: org.id, name: dto.category },
      });
    }

    // 2. Find or create Brand
    let brand = null;
    if (dto.brand) {
      brand = await this.prisma.brand.upsert({
        where: { organizationId_name: { organizationId: org.id, name: dto.brand } },
        update: {},
        create: { organizationId: org.id, name: dto.brand },
      });
    }

    // 3. Create Product and Variant in transaction
    const initialStock = Number(dto.stock) || 0;
    const sku = dto.sku || `SKU-${Date.now()}`;

    const product = await this.prisma.product.create({
      data: {
        organizationId: org.id,
        categoryId: category?.id,
        brandId: brand?.id,
        name: dto.name,
        status: ProductStatus.ACTIVE,
        variants: {
          create: {
            sku,
            barcode: dto.barcode || undefined,
            purchasePrice: new Prisma.Decimal(dto.purchasePrice || 0),
            sellingPrice: new Prisma.Decimal(dto.sellingPrice || 0),
            mrp: new Prisma.Decimal(dto.mrp || dto.sellingPrice || 0),
            minStock: new Prisma.Decimal(dto.minStock || 5),
            taxRate: new Prisma.Decimal(dto.taxRate || 18),
            trackingMode: (dto.trackingMode as TrackingMode) || TrackingMode.NONE,
            stockBalances: {
              create: {
                branchId: branch.id,
                quantity: new Prisma.Decimal(initialStock),
              },
            },
          },
        },
      },
      include: {
        variants: {
          include: {
            stockBalances: true,
          },
        },
      },
    });

    // Record stock movement if stock > 0
    if (initialStock > 0 && product.variants[0]) {
      await this.prisma.stockMovement.create({
        data: {
          branchId: branch.id,
          variantId: product.variants[0].id,
          type: StockMovementType.PURCHASE_RECEIPT,
          quantity: new Prisma.Decimal(initialStock),
          unitCost: new Prisma.Decimal(dto.purchasePrice || 0),
          reason: 'Initial stock entry',
          createdById: 'system',
          metadata: { actor: 'Admin/Manager' },
        },
      });
    }

    this.logger.log(`✓ Product created in PostgreSQL: ${product.name} (SKU: ${sku})`);
    return product;
  }

  /**
   * UPDATE PRODUCT in Neon PostgreSQL
   */
  async updateProduct(id: string, dto: any) {
    const { org, branch } = await this.getOrCreateOrgAndBranch();

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!product) throw new Error('Product not found');

    const variant = product.variants[0];

    // Update Product fields
    await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        status: dto.status || undefined,
      },
    });

    // Update Variant fields if provided
    if (variant) {
      await this.prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          sku: dto.sku || undefined,
          barcode: dto.barcode || undefined,
          purchasePrice: dto.purchasePrice !== undefined ? new Prisma.Decimal(dto.purchasePrice) : undefined,
          sellingPrice: dto.sellingPrice !== undefined ? new Prisma.Decimal(dto.sellingPrice) : undefined,
          mrp: dto.mrp !== undefined ? new Prisma.Decimal(dto.mrp) : undefined,
          minStock: dto.minStock !== undefined ? new Prisma.Decimal(dto.minStock) : undefined,
          taxRate: dto.taxRate !== undefined ? new Prisma.Decimal(dto.taxRate) : undefined,
        },
      });

      // Update StockBalance if provided
      if (dto.stock !== undefined) {
        await this.prisma.stockBalance.upsert({
          where: { branchId_variantId: { branchId: branch.id, variantId: variant.id } },
          update: { quantity: new Prisma.Decimal(dto.stock) },
          create: { branchId: branch.id, variantId: variant.id, quantity: new Prisma.Decimal(dto.stock) },
        });
      }
    }

    return { success: true };
  }

  /**
   * DELETE PRODUCT in Neon PostgreSQL
   */
  async deleteProduct(id: string) {
    // Delete stock movements, balances, variants and product
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) return { success: false, message: 'Product not found' };

    for (const v of product.variants) {
      await this.prisma.stockMovement.deleteMany({ where: { variantId: v.id } });
      await this.prisma.stockBalance.deleteMany({ where: { variantId: v.id } });
      await this.prisma.saleItem.deleteMany({ where: { variantId: v.id } });
    }

    await this.prisma.productVariant.deleteMany({ where: { productId: id } });
    await this.prisma.product.delete({ where: { id } });

    this.logger.log(`✓ Product deleted from PostgreSQL: ${id}`);
    return { success: true };
  }

  /**
   * ADJUST INVENTORY in Neon PostgreSQL
   */
  async adjustInventory(dto: {
    sku: string;
    quantity: number;
    type: string;
    reason?: string;
    actor?: string;
  }) {
    const { branch } = await this.getOrCreateOrgAndBranch();

    const variant = await this.prisma.productVariant.findUnique({
      where: { sku: dto.sku },
      include: { stockBalances: { where: { branchId: branch.id } } },
    });

    if (!variant) throw new Error(`Product with SKU "${dto.sku}" not found`);

    const qty = Number(dto.quantity);
    const balance = variant.stockBalances[0];
    const currentQty = balance ? Number(balance.quantity) : 0;
    const newQty = Math.max(0, currentQty + qty);

    await this.prisma.$transaction([
      this.prisma.stockBalance.upsert({
        where: { branchId_variantId: { branchId: branch.id, variantId: variant.id } },
        update: { quantity: new Prisma.Decimal(newQty) },
        create: { branchId: branch.id, variantId: variant.id, quantity: new Prisma.Decimal(newQty) },
      }),
      this.prisma.stockMovement.create({
        data: {
          branchId: branch.id,
          variantId: variant.id,
          type: (dto.type as StockMovementType) || StockMovementType.ADJUSTMENT,
          quantity: new Prisma.Decimal(qty),
          reason: dto.reason || 'Inventory Adjustment',
          createdById: 'staff',
          metadata: { actor: dto.actor || 'Staff' },
        },
      }),
    ]);

    this.logger.log(`✓ Stock adjusted in PostgreSQL: ${dto.sku} by ${qty} -> new stock ${newQty}`);
    return { success: true, newStock: newQty };
  }

  /**
   * CREATE CUSTOMER in Neon PostgreSQL
   */
  async createCustomer(dto: { name: string; phone?: string; email?: string; address?: string }) {
    const { org } = await this.getOrCreateOrgAndBranch();

    const customer = await this.prisma.customer.create({
      data: {
        organizationId: org.id,
        name: dto.name,
        phone: dto.phone || null,
        email: dto.email || null,
        address: dto.address ? { address: dto.address } : Prisma.DbNull,
      },
    });

    this.logger.log(`✓ Customer created in PostgreSQL: ${customer.name}`);
    return customer;
  }

  /**
   * UPDATE CUSTOMER in Neon PostgreSQL
   */
  async updateCustomer(id: string, dto: any) {
    const customer = await this.prisma.customer.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        phone: dto.phone || undefined,
        email: dto.email || undefined,
        address: dto.address ? { address: dto.address } : undefined,
      },
    });
    return customer;
  }

  /**
   * DELETE CUSTOMER in Neon PostgreSQL
   */
  async deleteCustomer(id: string) {
    await this.prisma.customer.delete({ where: { id } });
    return { success: true };
  }

  /**
   * CREATE EMPLOYEE in Neon PostgreSQL
   */
  async createEmployee(dto: {
    code?: string;
    name: string;
    phone?: string;
    role?: string;
    baseSalary?: number;
    commissionRate?: number;
  }) {
    const { org, branch } = await this.getOrCreateOrgAndBranch();

    const code = dto.code || `EMP00${(await this.prisma.employee.count()) + 1}`;

    const employee = await this.prisma.employee.create({
      data: {
        organizationId: org.id,
        branchId: branch.id,
        employeeCode: code,
        name: dto.name,
        phone: dto.phone || null,
        baseSalary: new Prisma.Decimal(dto.baseSalary || 0),
        commissionRate: new Prisma.Decimal(dto.commissionRate || 0),
        joiningDate: new Date(),
        status: EmployeeStatus.ACTIVE,
      },
    });

    this.logger.log(`✓ Employee created in PostgreSQL: ${employee.name} (${code})`);
    return employee;
  }

  /**
   * UPDATE EMPLOYEE in Neon PostgreSQL
   */
  async updateEmployee(id: string, dto: any) {
    const employee = await this.prisma.employee.update({
      where: { id },
      data: {
        name: dto.name || undefined,
        phone: dto.phone || undefined,
        baseSalary: dto.baseSalary !== undefined ? new Prisma.Decimal(dto.baseSalary) : undefined,
        commissionRate: dto.commissionRate !== undefined ? new Prisma.Decimal(dto.commissionRate) : undefined,
        status: dto.status || undefined,
      },
    });
    return employee;
  }

  /**
   * DELETE EMPLOYEE in Neon PostgreSQL
   */
  async deleteEmployee(id: string) {
    await this.prisma.attendance.deleteMany({ where: { employeeId: id } });
    await this.prisma.employee.delete({ where: { id } });
    return { success: true };
  }

  /**
   * MARK ATTENDANCE in Neon PostgreSQL
   */
  async markAttendance(dto: { employeeId: string; status: AttendanceStatus }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: dto.employeeId,
          date: today,
        },
      },
      update: {
        status: dto.status,
      },
      create: {
        employeeId: dto.employeeId,
        date: today,
        status: dto.status,
      },
    });

    return record;
  }

  /**
   * RECORD SALE TRANSACTION in Neon PostgreSQL
   */
  async recordSale(dto: {
    customerName?: string;
    customerPhone?: string;
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    paidAmount?: number;
    paymentMethod: string;
    staffName?: string;
    items: { sku: string; qty: number; unitPrice: number }[];
  }) {
    const { org, branch } = await this.getOrCreateOrgAndBranch();

    // 1. Find or create customer
    let customerId = null;
    if (dto.customerPhone) {
      let customer = await this.prisma.customer.findFirst({
        where: { organizationId: org.id, phone: dto.customerPhone },
      });
      if (!customer && dto.customerName) {
        customer = await this.prisma.customer.create({
          data: {
            organizationId: org.id,
            name: dto.customerName,
            phone: dto.customerPhone,
          },
        });
      }
      customerId = customer?.id;
    }

    // 2. Find staff User
    const staff = await this.prisma.user.findFirst({
      where: { organizationId: org.id },
    });

    const invoiceNumber = `GMC-${Date.now().toString().slice(-6)}`;

    // 3. Create Sale & SaleItems in a Transaction
    const sale = await this.prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          branchId: branch.id,
          customerId,
          staffId: staff?.id || 'admin',
          invoiceNumber,
          status: SaleStatus.COMPLETED,
          subtotal: new Prisma.Decimal(dto.subtotal),
          discountAmount: new Prisma.Decimal(dto.discount || 0),
          taxAmount: new Prisma.Decimal(dto.tax || 0),
          total: new Prisma.Decimal(dto.total),
          paidAmount: new Prisma.Decimal(dto.paidAmount || dto.total),
          payments: {
            create: {
              amount: new Prisma.Decimal(dto.paidAmount || dto.total),
              method: (dto.paymentMethod as PaymentMethod) || PaymentMethod.CASH,
            },
          },
        },
      });

      // Process items and decrement stock
      for (const item of dto.items) {
        const variant = await tx.productVariant.findUnique({
          where: { sku: item.sku },
        });

        if (variant) {
          await tx.saleItem.create({
            data: {
              saleId: createdSale.id,
              variantId: variant.id,
              quantity: new Prisma.Decimal(item.qty),
              unitPrice: new Prisma.Decimal(item.unitPrice),
              unitCost: variant.purchasePrice,
            },
          });

          // Decrement stock balance
          const balance = await tx.stockBalance.findUnique({
            where: { branchId_variantId: { branchId: branch.id, variantId: variant.id } },
          });

          const currentStock = balance ? Number(balance.quantity) : 0;
          await tx.stockBalance.upsert({
            where: { branchId_variantId: { branchId: branch.id, variantId: variant.id } },
            update: { quantity: new Prisma.Decimal(Math.max(0, currentStock - item.qty)) },
            create: { branchId: branch.id, variantId: variant.id, quantity: new Prisma.Decimal(0) },
          });

          // Record stock movement
          await tx.stockMovement.create({
            data: {
              branchId: branch.id,
              variantId: variant.id,
              type: StockMovementType.SALE,
              quantity: new Prisma.Decimal(-item.qty),
              unitCost: variant.purchasePrice,
              reason: `Sale ${invoiceNumber}`,
              createdById: staff?.id || 'staff',
              metadata: { actor: dto.staffName || 'Staff' },
            },
          });
        }
      }

      return createdSale;
    });

    this.logger.log(`✓ Sale recorded in PostgreSQL: Invoice ${invoiceNumber} Total: ₹${dto.total}`);
    return sale;
  }
}
