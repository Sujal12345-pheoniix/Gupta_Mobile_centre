import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");

const url = "postgresql://neondb_owner:npg_AmT8lHjG1qpM@ep-still-dust-aegs2y7p.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require";
const prisma = new PrismaClient({ datasources: { db: { url } } });

async function clearMock() {
  console.log("🧹 Clearing all mock inventory, sales, purchases and customers from Neon DB...");

  await prisma.payment.deleteMany();
  await prisma.return.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockBalance.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();

  console.log("✅ Neon DB cleared of all dummy records!");
  console.log("✅ Users, roles, and branch remain ready for live store use.");
  await prisma.$disconnect();
}

clearMock().catch(e => { console.error("Error clearing DB:", e); process.exit(1); });
