# Product Requirements Document — Gupta Mobile Centre

## 1. Product
Gupta Mobile Centre Management System

## 2. Vision
Transform a manually managed mobile-accessories shop into a digital operating system covering sales, inventory, purchasing, finance, employees and reporting while keeping staff workflows extremely simple.

## 3. Primary users
### Owner/Admin
Full business visibility and configuration.

### Sub-admin/Manager
Operational control with restricted financial/system permissions.

### Staff
Fast POS, product lookup, quotations and permitted returns.

### Accountant (optional)
Finance/payroll/reporting without operational administration.

## 4. Core modules

### Authentication & RBAC
- Login/logout
- Password reset
- Role assignment
- Permission matrix
- Session/device management
- Account activation/deactivation

### Product Catalog
- Categories
- Brands
- Products
- Variants
- SKU
- Barcode
- MRP/selling/purchase price
- Tax/HSN configuration
- Minimum stock/reorder level
- Warranty
- Serial/batch/none tracking

### Inventory
- Current stock
- Stock ledger
- Purchase receipts
- Sales deductions
- Returns
- Damage/loss
- Adjustments
- Stock counts
- Low-stock alerts
- Out-of-stock
- Dead stock
- Stock valuation

### POS/Sales
- Search/scan
- Cart
- Customer selection
- Discounts
- Tax
- Payment
- Split payment
- Invoice
- Receipt printing
- WhatsApp-ready sharing
- Sale cancellation/reversal
- Staff sales history

### Purchases
- Suppliers
- Purchase orders
- Goods receiving
- Purchase invoices
- Supplier payable
- Partial receipts
- Partial payments

### Returns & Exchanges
- Customer return
- Supplier return
- Exchange
- Refund
- Return reasons
- Inspection/approval

### Quotations
- Create/edit/send
- Validity
- Discount
- Convert accepted quote to sale

### Customers
- Profile
- Purchase history
- Returns
- Warranty
- Outstanding balance if credit is enabled

### Finance
- Revenue
- COGS
- Gross profit
- Operating expenses
- Operating profit
- Receivables/payables
- Payment ledger
- Daily cash closing
- Financial exports

### Employees
- Employee profile
- Role
- Attendance
- Leave
- Salary
- Commission
- Advances
- Payroll
- Performance metrics

### Reporting
- Sales
- Product/category
- Staff
- Payment method
- Inventory
- Profit
- Expenses
- Supplier
- Customer
- Payroll

### Audit & Approvals
- Audit trail
- Discount approval
- Stock adjustment approval
- Return approval
- Expense approval
- Payroll approval
- Purchase approval

## 5. Dashboard requirements

### Owner dashboard
- Today's sales
- Gross profit
- Bills
- Items sold
- Stock value
- Low-stock count
- Out-of-stock count
- Dead stock value
- Receivables
- Payables
- Expenses
- Top products
- Staff performance
- Pending approvals

### Staff dashboard
- New sale
- Scan/search
- Sales history
- Quotations
- Returns
- My shift

## 6. Business rules
1. Product stock is derived from stock movements plus a controlled balance/cache.
2. Every sale creates sale items, payment records, stock movements and audit records.
3. Financial transactions are never hard-deleted.
4. Staff discount limits are configurable.
5. Stock adjustment requires reason and may require approval.
6. Employee offboarding deactivates access; history remains.
7. Returns require original sale reference when possible.
8. Serial-tracked items record serial number at receipt and sale.
9. A completed sale cannot be edited directly; use cancellation/reversal/return.
10. Payroll periods are locked after final approval.
11. Branch and tenant IDs must scope every business record.
12. All sensitive operations are audited.

## 7. Non-functional requirements
- Responsive admin UI
- Mobile-first staff UX
- Fast POS search
- Accessible UI
- API p95 target under 500ms for normal CRUD operations under expected load
- Database backup and recovery process
- Observability: structured logs, metrics, error tracking
- Secure secrets handling
- Automated CI
- Automated tests
- No production data in development

## 8. MVP acceptance
The first deployable version must support:
Login -> role permissions -> create product -> receive purchase -> stock increases -> staff scans product -> sale/payment -> stock decreases -> invoice -> dashboard update -> return -> stock reversal -> audit trail.
