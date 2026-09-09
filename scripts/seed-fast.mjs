import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const url = "postgresql://neondb_owner:npg_AmT8lHjG1qpM@ep-still-dust-aegs2y7p.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function seed() {
  console.log("⚡ Running fast seed on Neon DB...");

  // 1. Org & Branch
  const org = await prisma.organization.upsert({
    where: { id: "seed-org-001" },
    update: { name: "Gupta Mobile Centre" },
    create: { id: "seed-org-001", name: "Gupta Mobile Centre", timezone: "Asia/Kolkata", currency: "INR" },
  });

  const branch = await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: org.id, code: "HO" } },
    update: {},
    create: { id: "seed-branch-001", organizationId: org.id, name: "Head Office - Gurgaon", code: "HO", isActive: true },
  });
  console.log("✅ Org & Branch ready");

  // 2. Roles
  const roles = [
    { id: "role-admin", name: "Admin", description: "Full system access" },
    { id: "role-manager", name: "Manager", description: "Operational control" },
    { id: "role-staff", name: "Staff", description: "POS and basic operations" },
    { id: "role-technician", name: "Technician", description: "Repair jobs" },
    { id: "role-accountant", name: "Accountant", description: "Finance and reporting" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({ where: { id: r.id }, update: {}, create: r });
  }

  // 3. Permissions - batch
  const allPermKeys = [
    "dashboard.view", "products.view","products.create","products.update","products.archive",
    "inventory.view","inventory.receive","inventory.adjust","inventory.count",
    "purchases.view","purchases.create","purchases.approve","suppliers.manage",
    "sales.create","sales.view_all","sales.view_own","sales.cancel",
    "discounts.apply","discounts.approve","returns.create","returns.approve",
    "customers.manage","finance.view","finance.expenses.create","finance.expenses.approve",
    "payroll.view","payroll.manage","employees.view","employees.manage",
    "roles.manage","reports.view","audit.view","settings.manage",
  ];
  await prisma.permission.createMany({
    data: allPermKeys.map(key => ({ key })),
    skipDuplicates: true,
  });

  const allPerms = await prisma.permission.findMany();
  await prisma.rolePermission.createMany({
    data: allPerms.map(p => ({ roleId: "role-admin", permissionId: p.id })),
    skipDuplicates: true,
  });
  console.log("✅ Roles & Permissions ready");

  // 4. Users & Employees
  const adminHash = await bcrypt.hash("Admin@123", 10);
  const mgrHash = await bcrypt.hash("Manager@123", 10);
  const staffHash = await bcrypt.hash("Staff@123", 10);
  const techHash = await bcrypt.hash("Tech@123", 10);

  const usersData = [
    { id: "seed-user-admin", email: "admin@guptamobile.com", phone: "9876543210", hash: adminHash, roleId: "role-admin", code: "EMP001", name: "Sujal Kumar", salary: 65000, comm: 2.0 },
    { id: "seed-user-manager", email: "manager@guptamobile.com", phone: "9833445566", hash: mgrHash, roleId: "role-manager", code: "EMP002", name: "Neha Rani", salary: 35000, comm: 1.0 },
    { id: "seed-user-staff", email: "staff@guptamobile.com", phone: "9811223344", hash: staffHash, roleId: "role-staff", code: "EMP003", name: "Rohan Sharma", salary: 22000, comm: 1.5 },
    { id: "seed-user-tech", email: "tech@guptamobile.com", phone: "9822334455", hash: techHash, roleId: "role-technician", code: "EMP004", name: "Amit Verma", salary: 28000, comm: 5.0 },
  ];

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { id: u.id },
      update: { passwordHash: u.hash, status: "ACTIVE" },
      create: { id: u.id, organizationId: org.id, email: u.email, phone: u.phone, passwordHash: u.hash, status: "ACTIVE" },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: u.roleId } },
      update: {},
      create: { userId: user.id, roleId: u.roleId },
    });

    const emp = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (emp) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { name: u.name, baseSalary: u.salary, commissionRate: u.comm },
      });
    } else {
      await prisma.employee.create({
        data: {
          organizationId: org.id,
          branchId: branch.id,
          userId: user.id,
          employeeCode: u.code,
          name: u.name,
          phone: u.phone,
          joiningDate: new Date(),
          status: "ACTIVE",
          baseSalary: u.salary,
          commissionRate: u.comm,
        },
      });
    }
  }
  console.log("✅ Users & Employees seeded (Admin, Manager, Staff, Tech)");

  // 5. Categories batch
  await prisma.category.createMany({
    data: [
      { id: "cat-smartphones", organizationId: org.id, name: "Smartphones" },
      { id: "cat-chargers", organizationId: org.id, name: "Chargers" },
      { id: "cat-screenguards", organizationId: org.id, name: "Screen Guards" },
      { id: "cat-accessories", organizationId: org.id, name: "Accessories" },
      { id: "cat-spareparts", organizationId: org.id, name: "Spare Parts" },
      { id: "cat-cables", organizationId: org.id, name: "Cables" },
    ],
    skipDuplicates: true,
  });

  // 6. Brands batch
  await prisma.brand.createMany({
    data: [
      { id: "brand-apple", organizationId: org.id, name: "Apple" },
      { id: "brand-samsung", organizationId: org.id, name: "Samsung" },
      { id: "brand-oneplus", organizationId: org.id, name: "OnePlus" },
      { id: "brand-boat", organizationId: org.id, name: "Boat" },
      { id: "brand-generic", organizationId: org.id, name: "Generic" },
    ],
    skipDuplicates: true,
  });

  // 7. Suppliers batch
  await prisma.supplier.createMany({
    data: [
      { id: "sup-1", organizationId: org.id, name: "Delhi Mobile Accessories Hub", phone: "9811002233", gstin: "07AAAAA0000A1Z5" },
      { id: "sup-2", organizationId: org.id, name: "Mumbai Smartphone Distributors", phone: "9822114455", gstin: "27BBBBB1111B1Z2" },
      { id: "sup-3", organizationId: org.id, name: "Supreme LCD & Spare Hub", phone: "9833225566", gstin: "07CCCCC2222C1Z9" },
    ],
    skipDuplicates: true,
  });

  // 8. Customers batch
  await prisma.customer.createMany({
    data: [
      { id: "cust-1", organizationId: org.id, name: "Rahul Verma", phone: "9812345678", email: "rahul.verma@gmail.com" },
      { id: "cust-2", organizationId: org.id, name: "Pooja Singh", phone: "9876501234", email: "pooja.s@outlook.com" },
      { id: "cust-3", organizationId: org.id, name: "Amit Patel", phone: "9711223344", email: "amit.sharma@yahoo.com" },
      { id: "cust-4", organizationId: org.id, name: "Vikas Gupta", phone: "9988776655", email: "vikas.g@gmail.com" },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Categories, Brands, Suppliers, Customers ready");

  // 9. Products & Variants
  const sampleProducts = [
    { id: "prod-1", categoryId: "cat-smartphones", brandId: "brand-apple", name: "iPhone 15 Pro (128GB Blue Titanium)", sku: "IP15P-128-BLU", barcode: "890123450001", purchasePrice: 105000, sellingPrice: 124900, mrp: 134900, stock: 8, minStock: 2 },
    { id: "prod-2", categoryId: "cat-smartphones", brandId: "brand-samsung", name: "Samsung Galaxy S24 Ultra (256GB Titanium Gray)", sku: "SM-S24U-256", barcode: "890123450002", purchasePrice: 98000, sellingPrice: 119999, mrp: 129999, stock: 5, minStock: 2 },
    { id: "prod-3", categoryId: "cat-chargers", brandId: "brand-apple", name: "Apple 20W USB-C Power Adapter", sku: "APL-20W-ADP", barcode: "890123450004", purchasePrice: 1200, sellingPrice: 1899, mrp: 1900, stock: 45, minStock: 10 },
    { id: "prod-4", categoryId: "cat-screenguards", brandId: "brand-generic", name: "iPhone 15 Premium 9D Tempered Glass", sku: "TG-IP15-9D", barcode: "890123450006", purchasePrice: 40, sellingPrice: 299, mrp: 499, stock: 150, minStock: 25 },
    { id: "prod-5", categoryId: "cat-accessories", brandId: "brand-boat", name: "boAt Airdopes 141 ANC TWS Earbuds", sku: "BOAT-AD141-BLK", barcode: "890123450007", purchasePrice: 900, sellingPrice: 1499, mrp: 2990, stock: 24, minStock: 5 },
  ];

  for (const p of sampleProducts) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { name: p.name },
      create: { id: p.id, organizationId: org.id, categoryId: p.categoryId, brandId: p.brandId, name: p.name, status: "ACTIVE" },
    });

    const varId = `var-${p.id}`;
    await prisma.productVariant.upsert({
      where: { id: varId },
      update: { purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice, mrp: p.mrp },
      create: { id: varId, productId: p.id, sku: p.sku, barcode: p.barcode, name: p.name, purchasePrice: p.purchasePrice, sellingPrice: p.sellingPrice, mrp: p.mrp, taxRate: 18, trackingMode: "NONE", minStock: p.minStock },
    });

    await prisma.stockBalance.upsert({
      where: { branchId_variantId: { branchId: branch.id, variantId: varId } },
      update: { quantity: p.stock },
      create: { branchId: branch.id, variantId: varId, quantity: p.stock, reserved: 0 },
    });
  }
  console.log("✅ Products & Stock Balances ready");

  console.log("\n🎉 NEON DB FULL SEED FINISHED SUCCESSFULLY!");
  await prisma.$disconnect();
}

seed().catch(e => { console.error("❌ Seed error:", e); process.exit(1); });
