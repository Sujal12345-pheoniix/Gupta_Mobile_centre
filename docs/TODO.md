# Project Todo List — Gupta Mobile Centre

**Last Updated:** 2026-09-06  
**Current Focus:** Phase 2 - Catalog Module

---

## 🚨 Setup & Prerequisites (Before Any Implementation)

- [ ] Install dependencies: `pnpm install`
- [ ] Copy `.env.example` to `.env`
- [ ] Start Docker Desktop
- [ ] Run `docker compose up -d` (PostgreSQL + Redis)
- [ ] Run `pnpm db:migrate` (create database tables)
- [ ] Run `pnpm db:seed` (seed demo data)
- [ ] Verify health endpoint: `curl http://localhost:3000/api/v1/health`
- [ ] Verify login works: admin@guptamobile.com / Admin@123

---

## Phase 2: Catalog Module 📦

### 2.1 Categories
- [ ] Create `apps/api/src/modules/categories/categories.module.ts`
- [ ] Create `apps/api/src/modules/categories/categories.service.ts`
- [ ] Create `apps/api/src/modules/categories/categories.controller.ts`
- [ ] Create DTOs: `create-category.dto.ts`, `update-category.dto.ts`
- [ ] Implement tree structure (parent/children)
- [ ] Add permissions: `categories.view`, `categories.create`, `categories.update`
- [ ] Add audit logging on create/update
- [ ] Write unit tests
- [ ] Add API endpoint documentation

### 2.2 Brands
- [ ] Create `apps/api/src/modules/brands/brands.module.ts`
- [ ] Create `apps/api/src/modules/brands/brands.service.ts`
- [ ] Create `apps/api/src/modules/brands/brands.controller.ts`
- [ ] Create DTOs: `create-brand.dto.ts`, `update-brand.dto.ts`
- [ ] Add permissions: `brands.view`, `brands.create`, `brands.update`
- [ ] Add audit logging
- [ ] Write unit tests

### 2.3 Products
- [ ] Create `apps/api/src/modules/products/products.module.ts`
- [ ] Create `apps/api/src/modules/products/products.service.ts`
- [ ] Create `apps/api/src/modules/products/products.controller.ts`
- [ ] Create DTOs: `create-product.dto.ts`, `update-product.dto.ts`
- [ ] Link to category and brand
- [ ] Add permissions: `products.view`, `products.create`, `products.update`, `products.archive`
- [ ] Add audit logging
- [ ] Write unit tests

### 2.4 Product Variants
- [ ] Create `apps/api/src/modules/variants/variants.module.ts`
- [ ] Create `apps/api/src/modules/variants/variants.service.ts`
- [ ] Create `apps/api/src/modules/variants/variants.controller.ts`
- [ ] Create DTOs: `create-variant.dto.ts`, `update-variant.dto.ts`
- [ ] SKU generation and uniqueness validation
- [ ] Barcode validation and uniqueness
- [ ] Pricing fields (purchasePrice, sellingPrice, MRP)
- [ ] Tax rate and HSN code
- [ ] Tracking mode (NONE/BATCH/SERIAL)
- [ ] Stock thresholds (reorderLevel, minStock)
- [ ] Warranty days
- [ ] Add permissions: `variants.manage`
- [ ] Add audit logging
- [ ] Write unit tests

### 2.5 Admin Web: Catalog UI
- [ ] Create `apps/admin-web/src/app/categories/` page
- [ ] Create `apps/admin-web/src/app/brands/` page
- [ ] Create `apps/admin-web/src/app/products/` page
- [ ] Create product form with category/brand selector
- [ ] Create variant form with SKU/barcode/price fields
- [ ] Add list views with search and filter
- [ ] Add loading/error/empty states
- [ ] Add API client methods in `apps/admin-web/src/lib/api.ts`

---

## Phase 3: Inventory Module 📋

### 3.1 Stock Balance Service
- [ ] Create `apps/api/src/modules/inventory/inventory.module.ts`
- [ ] Create `apps/api/src/modules/inventory/inventory.service.ts`
- [ ] Get stock balance for branch/variant
- [ ] Get all variants with stock below reorder level
- [ ] Get dead stock (no sales in X days)
- [ ] Validate stock availability for sale

### 3.2 Stock Movement Ledger
- [ ] Create `apps/api/src/modules/inventory/stock-movement.service.ts`
- [ ] Record purchase receipt (+qty)
- [ ] Record sale (-qty)
- [ ] Record customer return (+qty)
- [ ] Record adjustment (±qty with reason)
- [ ] Record damage/loss (-qty)
- [ ] Validate stock before deduction
- [ ] Atomic update of StockBalance cache

### 3.3 Purchase Receiving
- [ ] Create `apps/api/src/modules/purchases/purchases.module.ts`
- [ ] Create `apps/api/src/modules/purchases/purchases.service.ts`
- [ ] Create purchase order (DRAFT)
- [ ] Receive goods against PO
- [ ] Create StockMovement (PURCHASE_RECEIPT)
- [ ] Update StockBalance
- [ ] Add permissions: `inventory.receive`, `purchases.create`, `purchases.approve`

### 3.4 Stock Adjustments
- [ ] Create adjustment endpoint
- [ ] Require reason for adjustment
- [ ] Approval workflow for large adjustments
- [ ] Add audit logging

### 3.5 Admin Web: Inventory UI
- [ ] Create `apps/admin-web/src/app/inventory/` pages
- [ ] Stock levels dashboard
- [ ] Low stock alerts
- [ ] Purchase receiving form
- [ ] Stock adjustment form

---

## Phase 4: POS Module 💰

### 4.1 Sales Service
- [ ] Create `apps/api/src/modules/sales/sales.module.ts`
- [ ] Create `apps/api/src/modules/sales/sales.service.ts`
- [ ] Create sale transaction (atomic)
- [ ] Validate stock availability (SELECT FOR UPDATE)
- [ ] Create Sale record
- [ ] Create SaleItem records
- [ ] Create Payment records
- [ ] Create StockMovement (SALE, -qty)
- [ ] Update StockBalance
- [ ] Generate invoice number
- [ ] Add permissions: `sales.create`, `sales.view_all`, `sales.view_own`, `sales.cancel`

### 4.2 Payment Service
- [ ] Create `apps/api/src/modules/payments/payments.module.ts`
- [ ] Create `apps/api/src/modules/payments/payments.service.ts`
- [ ] Record cash payment
- [ ] Record UPI payment
- [ ] Record card payment
- [ ] Record split payments
- [ ] Validate payment doesn't exceed outstanding

### 4.3 Discount Handling
- [ ] Apply line item discount
- [ ] Apply bill-level discount
- [ ] Check staff discount limit from role
- [ ] Create approval request if over limit

### 4.4 Shift Management
- [ ] Create `apps/api/src/modules/shifts/shifts.module.ts`
- [ ] Open shift with opening cash
- [ ] Close shift with expected vs actual cash
- [ ] Calculate shift totals

### 4.5 Invoice Generation
- [ ] Generate invoice number (format: `INV-YYYYMMDD-XXXX`)
- [ ] Return invoice data with all line items
- [ ] Support invoice reprint

### 4.6 Admin Web: POS UI
- [ ] Create `apps/admin-web/src/app/pos/` page
- [ ] Product search/barcode scan
- [ ] Cart management
- [ ] Payment method selection
- [ ] Invoice display/print

---

## Phase 5: Returns + Customers 🔄

### 5.1 Customers
- [ ] Create `apps/api/src/modules/customers/` module
- [ ] Customer CRUD
- [ ] Link to sales history
- [ ] Loyalty points (future)

### 5.2 Returns
- [ ] Create `apps/api/src/modules/returns/` module
- [ ] Create return request
- [ ] Calculate returnable quantity
- [ ] Inspection workflow
- [ ] Refund processing
- [ ] Stock restoration (CUSTOMER_RETURN)

---

## Phase 6: Suppliers + Quotations 📝

### 6.1 Suppliers
- [ ] Create `apps/api/src/modules/suppliers/` module
- [ ] Supplier CRUD with GSTIN validation

### 6.2 Quotations
- [ ] Create `apps/api/src/modules/quotations/` module
- [ ] Create quotation
- [ ] Send quotation
- [ ] Convert to sale

---

## Phase 7: Finance 📊

### 7.1 Expenses
- [ ] Create `apps/api/src/modules/expenses/` module
- [ ] Expense CRUD with approval workflow

### 7.2 Ledger
- [ ] Create `apps/api/src/modules/ledger/` module
- [ ] Record revenue entries
- [ ] Record COGS entries
- [ ] Generate financial reports

### 7.3 Reporting
- [ ] Sales reports
- [ ] Profit/loss statement
- [ ] Inventory valuation
- [ ] Tax reports

---

## Phase 8: Employees + Payroll 👥

### 8.1 Attendance
- [ ] Create `apps/api/src/modules/attendance/` module
- [ ] Clock in/out
- [ ] Attendance reports

### 8.2 Payroll
- [ ] Create `apps/api/src/modules/payroll/` module
- [ ] Payroll run workflow
- [ ] Lock period after finalization

---

## Testing & Documentation 📋

### Unit Tests (per module)
- [ ] Categories: 5 tests
- [ ] Brands: 5 tests
- [ ] Products: 8 tests
- [ ] Variants: 10 tests
- [ ] Inventory: 10 tests
- [ ] Sales: 15 tests
- [ ] Payments: 8 tests

### Integration Tests
- [ ] Auth flow
- [ ] Sale → Stock deduction flow
- [ ] Purchase → Stock increase flow
- [ ] Return → Stock restoration flow

### E2E Tests (Playwright)
- [ ] Login flow
- [ ] Create product flow
- [ ] POS sale flow
- [ ] Return flow

### Documentation
- [ ] Update API.md with new endpoints
- [ ] Update IMPLEMENTATION_STATUS.md
- [ ] Add API usage examples
- [ ] Update README with setup instructions

---

## Deployment & Hardening 🔒

### Production Readiness
- [ ] Environment variable validation
- [ ] Rate limiting
- [ ] Request logging middleware
- [ ] Error handling standardization
- [ ] Backup/restore procedure
- [ ] Health check for load balancer

### Security
- [ ] Security audit
- [ ] Penetration testing
- [ ] Dependency vulnerability scan
- [ ] Secret rotation procedure

---

## Progress Summary

| Phase | Tasks | Completed | Remaining |
|-------|-------|-----------|-----------|
| Setup | 8 | 0 | 8 |
| Phase 2: Catalog | 28 | 0 | 28 |
| Phase 3: Inventory | 18 | 0 | 18 |
| Phase 4: POS | 22 | 0 | 22 |
| Phase 5: Returns | 10 | 0 | 10 |
| Phase 6: Suppliers | 6 | 0 | 6 |
| Phase 7: Finance | 12 | 0 | 12 |
| Phase 8: Payroll | 8 | 0 | 8 |
| Testing | 15 | 0 | 15 |
| Deployment | 8 | 0 | 8 |
| **Total** | **135** | **0** | **135** |

**Current Velocity:** 0%  
**Target:** Complete Phase 2-4 (First Vertical Slice)
