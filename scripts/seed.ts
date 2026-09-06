import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { id: 'seed-org-001' },
    update: {},
    create: {
      id: 'seed-org-001',
      name: 'Gupta Mobile Centre',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
  });
  console.log('Created organization:', org.name);

  // Create Branch
  const branch = await prisma.branch.upsert({
    where: { organizationId_code: { organizationId: org.id, code: 'HO' } },
    update: {},
    create: {
      id: 'seed-branch-001',
      organizationId: org.id,
      name: 'Head Office',
      code: 'HO',
      isActive: true,
    },
  });
  console.log('Created branch:', branch.name);

  // Create Roles
  const roles = [
    { id: 'role-admin', name: 'Admin', description: 'Full system access' },
    { id: 'role-subadmin', name: 'Sub-admin', description: 'Operational control' },
    { id: 'role-staff', name: 'Staff', description: 'POS and basic operations' },
    { id: 'role-accountant', name: 'Accountant', description: 'Finance and reporting' },
  ];

  for (const roleData of roles) {
    await prisma.role.upsert({
      where: { id: roleData.id },
      update: {},
      create: roleData,
    });
  }
  console.log('Created roles');

  // Create Permissions
  const permissions = [
    'dashboard.view',
    'products.view', 'products.create', 'products.update', 'products.archive',
    'inventory.view', 'inventory.receive', 'inventory.adjust', 'inventory.count',
    'purchases.view', 'purchases.create', 'purchases.approve',
    'suppliers.manage',
    'sales.create', 'sales.view_all', 'sales.view_own', 'sales.cancel',
    'discounts.apply', 'discounts.approve',
    'returns.create', 'returns.approve',
    'quotations.create', 'quotations.convert',
    'customers.manage',
    'finance.view', 'finance.expenses.create', 'finance.expenses.approve',
    'payroll.view', 'payroll.manage',
    'employees.view', 'employees.manage',
    'roles.manage',
    'reports.view',
    'audit.view',
    'settings.manage',
    'branch.manage',
    'backups.manage',
  ];

  for (const permKey of permissions) {
    await prisma.permission.upsert({
      where: { key: permKey },
      update: {},
      create: { key: permKey },
    });
  }
  console.log('Created permissions');

  // Assign all permissions to Admin role
  const adminRole = await prisma.role.findUnique({ where: { id: 'role-admin' } });
  if (!adminRole) throw new Error('Admin role not found');
  const allPermissions = await prisma.permission.findMany();

  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: perm.id,
      },
    });
  }
  console.log('Assigned permissions to Admin');

  // Create Admin User with proper password hash
  // Password: Admin@123
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { id: 'seed-user-admin' },
    update: { passwordHash },
    create: {
      id: 'seed-user-admin',
      organizationId: org.id,
      email: 'admin@guptamobile.com',
      phone: '9876543210',
      passwordHash,
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: 'role-admin' } },
    update: {},
    create: { userId: adminUser.id, roleId: 'role-admin' },
  });
  console.log('Created admin user (email: admin@guptamobile.com, password: Admin@123)');

  // Create Employee for Admin
  await prisma.employee.upsert({
    where: { id: 'seed-employee-admin' },
    update: {},
    create: {
      id: 'seed-employee-admin',
      organizationId: org.id,
      branchId: branch.id,
      userId: adminUser.id,
      employeeCode: 'EMP001',
      name: 'Admin User',
      phone: '9876543210',
      joiningDate: new Date(),
      status: 'ACTIVE',
      baseSalary: 50000,
      commissionRate: 0,
    },
  });
  console.log('Created admin employee');

  // Create Categories
  const categories = [
    { id: 'cat-mobile', name: 'Mobile Phones' },
    { id: 'cat-accessories', name: 'Accessories' },
    { id: 'cat-covers', name: 'Phone Covers' },
    { id: 'cat-chargers', name: 'Chargers' },
    { id: 'cat-earphones', name: 'Earphones' },
    { id: 'cat-powerbank', name: 'Power Banks' },
    { id: 'cat-spareparts', name: 'Spare Parts' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { organizationId_name: { organizationId: org.id, name: cat.name } },
      update: {},
      create: { id: cat.id, organizationId: org.id, name: cat.name },
    });
  }
  console.log('Created categories');

  // Create Brands
  const brands = [
    { id: 'brand-apple', name: 'Apple' },
    { id: 'brand-samsung', name: 'Samsung' },
    { id: 'brand-xiaomi', name: 'Xiaomi' },
    { id: 'brand-oneplus', name: 'OnePlus' },
    { id: 'brand-vivo', name: 'Vivo' },
    { id: 'brand-oppo', name: 'Oppo' },
    { id: 'brand-realme', name: 'Realme' },
    { id: 'brand-boat', name: 'boAt' },
  ];

  for (const brandData of brands) {
    await prisma.brand.upsert({
      where: { organizationId_name: { organizationId: org.id, name: brandData.name } },
      update: {},
      create: { id: brandData.id, organizationId: org.id, name: brandData.name },
    });
  }
  console.log('Created brands');

  // Create Sample Products
  const products = [
    {
      id: 'prod-iphone-15',
      categoryId: 'cat-mobile',
      brandId: 'brand-apple',
      name: 'iPhone 15',
      description: 'Apple iPhone 15 128GB',
      variants: [{
        id: 'var-iphone-15-black',
        sku: 'IPH15-128-BLK',
        barcode: '194253401792',
        name: 'iPhone 15 Black 128GB',
        purchasePrice: 65000,
        sellingPrice: 79900,
        mrp: 79900,
        taxRate: 18,
        hsnCode: '85171290',
      }],
    },
    {
      id: 'prod-samsung-s24',
      categoryId: 'cat-mobile',
      brandId: 'brand-samsung',
      name: 'Samsung Galaxy S24',
      description: 'Samsung Galaxy S24 256GB',
      variants: [{
        id: 'var-s24-gray',
        sku: 'SAMS24-256-GRY',
        barcode: '887276789012',
        name: 'Galaxy S24 Gray 256GB',
        purchasePrice: 55000,
        sellingPrice: 69999,
        mrp: 74999,
        taxRate: 18,
        hsnCode: '85171290',
      }],
    },
    {
      id: 'prod-boat-earphone',
      categoryId: 'cat-earphones',
      brandId: 'brand-boat',
      name: 'boAt Rockerz 450',
      description: 'Bluetooth Headphone',
      variants: [{
        id: 'var-boat-450',
        sku: 'BOAT-450-BLK',
        barcode: '8906436123456',
        name: 'Rockerz 450 Black',
        purchasePrice: 899,
        sellingPrice: 1499,
        mrp: 2990,
        taxRate: 18,
        hsnCode: '85183020',
      }],
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {},
      create: {
        id: prod.id,
        organizationId: org.id,
        categoryId: prod.categoryId,
        brandId: prod.brandId,
        name: prod.name,
        description: prod.description,
        status: 'ACTIVE',
      },
    });

    for (const variant of prod.variants) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {},
        create: {
          id: variant.id,
          productId: prod.id,
          sku: variant.sku,
          barcode: variant.barcode,
          name: variant.name,
          purchasePrice: variant.purchasePrice,
          sellingPrice: variant.sellingPrice,
          mrp: variant.mrp,
          taxRate: variant.taxRate,
          hsnCode: variant.hsnCode,
          trackingMode: 'NONE',
          reorderLevel: 10,
          minStock: 5,
        },
      });

      // Create initial stock balance
      await prisma.stockBalance.upsert({
        where: { branchId_variantId: { branchId: branch.id, variantId: variant.id } },
        update: {},
        create: {
          branchId: branch.id,
          variantId: variant.id,
          quantity: 0,
          reserved: 0,
        },
      });
    }
  }
  console.log('Created products and variants');

  // Create Sample Supplier
  await prisma.supplier.upsert({
    where: { id: 'seed-supplier-001' },
    update: {},
    create: {
      id: 'seed-supplier-001',
      organizationId: org.id,
      name: 'Tech Distributors Pvt Ltd',
      phone: '9876543211',
      email: 'orders@techdistributors.in',
      gstin: '27AAACT2727Q1ZV',
    },
  });
  console.log('Created sample supplier');

  // Create Sample Customer
  await prisma.customer.upsert({
    where: { id: 'seed-customer-001' },
    update: {},
    create: {
      id: 'seed-customer-001',
      organizationId: org.id,
      name: 'Walk-in Customer',
      phone: '9876543212',
    },
  });
  console.log('Created sample customer');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });