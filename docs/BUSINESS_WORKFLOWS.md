# Business Workflows — Complete Specification

This document provides step-by-step specifications for all core business workflows in Gupta Mobile Centre.

---

## Table of Contents
1. [Authentication](#1-authentication)
2. [User & RBAC Management](#2-user--rbac-management)
3. [Product Catalog](#3-product-catalog)
4. [Inventory Management](#4-inventory-management)
5. [Purchase & Receiving](#5-purchase--receiving)
6. [Point of Sale](#6-point-of-sale)
7. [Payments](#7-payments)
8. [Returns & Exchanges](#8-returns--exchanges)
9. [Quotations](#9-quotations)
10. [Customers & CRM](#10-customers--crm)
11. [Finance & Expenses](#11-finance--expenses)
12. [Employees & Attendance](#12-employees--attendance)
13. [Payroll](#13-payroll)
14. [Approvals](#14-approvals)
15. [Reporting & Dashboards](#15-reporting--dashboards)
16. [Notifications](#16-notifications)
17. [Shift Management](#17-shift-management)
18. [Audit & Compliance](#18-audit--compliance)

---

## 1. Authentication

### 1.1 Login

**Actor:** Staff, Manager, Admin

**Steps:**
1. User enters email/phone and password
2. Client sends `POST /auth/login` with credentials
3. Server validates credentials
4. Server verifies account status is `ACTIVE`
5. Server updates `lastLoginAt` timestamp
6. Server generates access token (15 min) and refresh token (30 days)
7. Server returns tokens and user profile with permissions
8. Client stores tokens and redirects to dashboard

**Error Cases:**
- Invalid credentials → 401 Unauthorized
- Account `LOCKED` → 401 Account locked
- Account `INACTIVE` → 401 Account deactivated
- Too many failed attempts (future: rate limiting) → 429 Too many requests

**Security:**
- Password hashed with bcrypt (10 rounds)
- Tokens are JWT with signature verification
- Refresh token rotation on every use

---

### 1.2 Token Refresh

**Actor:** Client (automatic)

**Steps:**
1. Client detects access token expired (401 response or clock check)
2. Client sends `POST /auth/refresh` with refresh token
3. Server validates refresh token signature and expiry
4. Server loads user and verifies status
5. Server generates new access token
6. Server issues new refresh token (rotation)
7. Client stores new tokens and retries original request

---

### 1.3 Logout

**Actor:** Authenticated user

**Steps:**
1. User clicks "Sign out"
2. Client sends `POST /auth/logout` with access token
3. Server validates token and returns success
4. Client clears stored tokens
5. Client redirects to login page

**Note:** This is client-side logout. Server-side token invalidation (blacklist) is planned.

---

### 1.4 Password Reset

**Actor:** Any user who forgot password

**Steps:**
1. User enters email on forgot-password page
2. Client sends `POST /auth/forgot-password`
3. Server checks if email exists (always returns 200 to prevent email enumeration)
4. Server generates password reset token (stored, time-limited)
5. Server sends email with reset link (future: WhatsApp fallback)
6. User clicks link → navigates to reset page
7. User enters new password
8. Client sends `POST /auth/reset-password` with token + new password
9. Server validates token and expiry
10. Server updates password hash
11. Server invalidates reset token

---

## 2. User & RBAC Management

### 2.1 Create User

**Actor:** Admin, Sub-admin (with permission)

**Permission:** `users.create`

**Steps:**
1. Admin fills user creation form (name, email/phone, role assignment)
2. Admin sets initial password or sends invite
3. Client sends `POST /users`
4. Server validates uniqueness of email/phone
5. Server creates User record with hashed password
6. Server creates Employee record linked to User
7. Server assigns roles via UserRole entries
8. Server logs audit event (CREATE, User)
9. Server sends welcome email (future)

**Validation:**
- Email must be unique within organization
- Phone must be unique within organization
- At least one role must be assigned
- Password must meet complexity requirements (min 8 chars, 1 uppercase, 1 number)

---

### 2.2 Assign Role to User

**Actor:** Admin (with permission)

**Permission:** `roles.manage`

**Steps:**
1. Admin selects user and role from lists
2. Client sends `POST /rbac/users/:userId/roles` with roleId
3. Server validates user and role exist
4. Server checks user doesn't already have this role
5. Server creates UserRole entry
6. Server logs audit event

**Note:** Users can have multiple roles. Effective permissions = union of all role permissions.

---

### 2.3 Deactivate User

**Actor:** Admin

**Permission:** `users.deactivate`

**Steps:**
1. Admin selects user and confirms deactivation
2. Client sends `POST /users/:id/deactivate`
3. Server updates User.status = `INACTIVE`
4. Employee record is preserved (status unchanged for history)
5. User cannot log in with deactivated credentials
6. All existing sessions remain active until natural expiry
7. Server logs audit event

**Note:** User record and all history (sales, attendance, payroll) is preserved. This is a soft deactivation, not a delete.

---

## 3. Product Catalog

### 3.1 Create Category

**Actor:** Admin, Sub-admin

**Permission:** `products.create`

**Steps:**
1. Admin enters category name and optional parent category
2. Client sends `POST /categories`
3. Server validates name uniqueness within organization
4. Server creates Category record
5. Server logs audit event

---

### 3.2 Create Brand

**Actor:** Admin, Sub-admin

**Permission:** `products.create`

**Steps:**
1. Admin enters brand name
2. Client sends `POST /brands`
3. Server validates name uniqueness
4. Server creates Brand record
5. Server logs audit event

---

### 3.3 Create Product

**Actor:** Admin, Sub-admin

**Permission:** `products.create`

**Steps:**
1. Admin fills product form:
   - Name, description
   - Category (required)
   - Brand (optional)
   - Status (ACTIVE by default)
2. Client sends `POST /products`
3. Server validates category and brand belong to organization
4. Server creates Product record
5. Server logs audit event

---

### 3.4 Create Product Variant (SKU)

**Actor:** Admin, Sub-admin

**Permission:** `products.create`

**Steps:**
1. Admin fills variant form:
   - SKU (auto-generated or manual)
   - Barcode (optional, scan-ready)
   - Variant name (e.g., "iPhone 15 Black 128GB")
   - Purchase price
   - Selling price
   - MRP (Maximum Retail Price)
   - Tax rate (%)
   - HSN code
   - Tracking mode (NONE/BATCH/SERIAL)
   - Reorder level
   - Minimum stock
   - Warranty days
2. Client sends `POST /products/:id/variants`
3. Server validates SKU uniqueness
4. Server validates barcode uniqueness (if provided)
5. Server creates ProductVariant record
6. For each active branch, creates StockBalance with qty=0
7. Server logs audit event

---

## 4. Inventory Management

### 4.1 Stock Balance Query

**Actor:** Staff, Manager, Admin

**Permission:** `inventory.view`

**Steps:**
1. User navigates to inventory list
2. Client sends `GET /inventory?branchId=X`
3. Server loads StockBalance records for branch
4. Server joins with ProductVariant for display
5. Server returns list with current quantity, reserved, sellable

**Response includes:**
```json
{
  "variants": [{
    "id": "variant-123",
    "sku": "IPH15-128-BLK",
    "name": "iPhone 15 Black 128GB",
    "quantity": 10,
    "reserved": 2,
    "sellable": 8,
    "reorderLevel": 10,
    "belowReorder": false
  }]
}
```

---

### 4.2 View Stock Ledger

**Actor:** Manager, Admin

**Permission:** `inventory.view`

**Steps:**
1. User selects variant and views ledger
2. Client sends `GET /inventory/:variantId/ledger?branchId=X`
3. Server loads StockMovement records for variant + branch
4. Server returns ordered list with running balance

---

### 4.3 Stock Adjustment

**Actor:** Admin, Sub-admin (with permission)

**Permission:** `inventory.adjust`

**Steps:**
1. User selects variant and enters adjustment:
   - Quantity (positive = addition, negative = removal)
   - Reason (DAMAGE, LOSS, FOUND, CORRECTION, OTHER)
   - Notes
2. Client sends `POST /inventory/adjustments`
3. Server validates:
   - Adjustment doesn't make stock negative (unless DAMAGE/LOSS)
   - Reason is provided
4. Server creates StockMovement with type=ADJUSTMENT
5. Server updates StockBalance.quantity
6. Server logs audit event

**Note:** If discount > threshold, this goes through approval workflow (see Approvals).

---

### 4.4 Stock Count

**Actor:** Staff (count), Manager (review)

**Permission:** `inventory.count`

**Steps:**
1. Manager initiates stock count for a branch
2. System creates StockCount record
3. Staff physically counts items
4. Staff submits counts via `POST /inventory/counts/:id/submit`
5. Manager reviews variances
6. Manager approves or adjusts
7. On approval: system creates ADJUSTMENT movements for variances
8. StockBalance updated

---

## 5. Purchase & Receiving

### 5.1 Create Purchase Order

**Actor:** Admin, Sub-admin

**Permission:** `purchases.create`

**Steps:**
1. User selects supplier
2. User adds line items (variant + quantity + unit cost)
3. System calculates totals
4. Client sends `POST /purchases`
5. Server creates Purchase record (status: DRAFT)
6. Server creates PurchaseItem records
7. Server logs audit event

---

### 5.2 Receive Goods

**Actor:** Manager, Staff (with permission)

**Permission:** `inventory.receive` or `purchases.create`

**Steps:**
1. User selects purchase order
2. User enters received quantities (may differ from ordered)
3. For serial-tracked items: enter serial numbers
4. Client sends `POST /purchases/:id/receive`
5. Server validates purchase is in valid state
6. Server **begins transaction**:
   a. For each received item:
      - Create StockMovement (type=PURCHASE_RECEIPT, qty=+N)
      - Update StockBalance (qty += N)
   b. Update Purchase.status = RECEIVED (or PARTIALLY_RECEIVED)
   c. Create LedgerEntry for inventory asset
   d. Create AuditLog
7. Server **commits transaction**
8. Return updated purchase with received quantities

---

### 5.3 Record Purchase Payment

**Actor:** Admin, Accountant

**Permission:** `purchases.create`

**Steps:**
1. User selects purchase with outstanding balance
2. User enters payment details (amount, method, reference)
3. Client sends `POST /purchases/:id/payments`
4. Server validates payment ≤ outstanding
5. Server creates Payment record (linked to Purchase, not Sale)
6. Server updates Purchase.paidAmount and Purchase.dueAmount
7. Server creates LedgerEntry (credit cash/bank, debit supplier payable)
8. Server logs audit event

---

## 6. Point of Sale

### 6.1 Open Shift

**Actor:** Staff

**Permission:** `sales.create`

**Steps:**
1. Staff enters opening cash amount
2. Client sends `POST /shifts` { openingCash, branchId }
3. Server creates Shift record (status: OPEN)
4. Server returns shift details
5. Staff begins POS session

---

### 6.2 Process Sale (Core Workflow)

**Actor:** Staff

**Permission:** `sales.create`

**Steps:**
1. **Scan/Search Product**
   - Barcode scan → `GET /products/barcode/:barcode`
   - Search → `GET /products?search=X`

2. **Add to Cart**
   - Client-side: add item to cart state
   - Each item: { variantId, quantity, unitPrice, discount }

3. **Select Customer** (optional)
   - Existing: `GET /customers?phone=X`
   - New: `POST /customers`

4. **Apply Discount**
   - Staff enters discount (amount or %)
   - If discount ≤ staff limit: accept
   - If discount > staff limit: require approval (see Approvals)

5. **Process Payment**
   - Select payment method (CASH, UPI, CARD, BANK_TRANSFER, MIXED)
   - For MIXED: enter split amounts

6. **Submit Sale**
   - Client sends `POST /sales` with:
     ```json
     {
       "customerId": "optional",
       "branchId": "required",
       "items": [{
         "variantId": "required",
         "quantity": "required",
         "unitPrice": "required",
         "discount": "optional"
       }],
       "payments": [{
         "method": "CASH",
         "amount": 79900
       }],
       "idempotencyKey": "uuid"
     }
     ```

7. **Server Transaction** (atomic):
   - Validate idempotency key (prevent duplicate)
   - For each item:
     - `SELECT ... FOR UPDATE` StockBalance
     - Validate quantity ≤ sellable stock
     - If insufficient: reject entire sale
   - Compute totals (server-side, not client-provided):
     - subtotal = Σ(qty × unitPrice)
     - discount = Σ discounts
     - tax = calculateTax(subtotal - discount)
     - total = subtotal - discount + tax
   - Generate invoice number (unique, sequential per branch)
   - INSERT Sale
   - INSERT SaleItem[]
   - INSERT Payment[]
   - INSERT StockMovement[] (type=SALE, qty=-N per item)
   - UPDATE StockBalance (qty -= N)
   - INSERT LedgerEntry[] (revenue + COGS)
   - INSERT AuditLog
   - INSERT OutboxEvent (sale.completed)

8. **Return** response:
   ```json
   {
     "sale": {
       "id": "sale-123",
       "invoiceNumber": "INV-HO-00001",
       "status": "COMPLETED",
       "subtotal": 75000,
       "discount": 0,
       "tax": 13500,
       "total": 88500,
       "items": [...],
       "payments": [...]
     }
   }
   ```

9. **Print/Share Invoice**
   - Generate invoice PDF
   - Print locally or email/WhatsApp to customer

---

### 6.3 Cancel Sale

**Actor:** Manager, Admin

**Permission:** `sales.cancel`

**Precondition:** Sale status = COMPLETED

**Steps:**
1. User finds sale and initiates cancellation
2. User enters cancellation reason
3. Client sends `POST /sales/:id/cancel`
4. Server validates:
   - Sale is COMPLETED
   - Not already cancelled
   - Returnable items ≤ items already returned
5. Server **begins transaction**:
   - Update Sale.status = CANCELLED
   - For each sale item:
     - INSERT StockMovement (type=SALE, qty=+N) — reversal
     - UPDATE StockBalance (qty += N)
   - For each payment:
     - Create reversal LedgerEntry
   - INSERT AuditLog
6. Server **commits transaction**
7. Issue refund if already paid

---

### 6.4 Close Shift

**Actor:** Staff

**Steps:**
1. Staff enters actual cash count
2. Client sends `POST /shifts/:id/close` with actualCash
3. Server calculates expectedCash = openingCash + cashSales - cashRefunds
4. Server calculates difference = actualCash - expectedCash
5. Server updates Shift:
   - status = CLOSED
   - actualCash
   - difference
   - closedAt = now
6. If difference ≠ 0: flag for manager review
7. Server logs audit event

---

## 7. Payments

### 7.1 Record Payment on Sale

**Actor:** Staff

**Permission:** `sales.create`

**Steps:**
1. User selects partially paid sale
2. User enters payment details
3. Client sends `POST /sales/:id/payments`
4. Server validates payment ≤ outstanding balance
5. Server creates Payment record
6. Server updates Sale.paidAmount
7. If paidAmount = total, update Sale.status = PAID
8. Server logs audit event

---

### 7.2 Split Payment

**Actor:** Staff

**Steps:**
1. Total ₹885
2. Customer pays ₹500 via UPI
3. Customer pays ₹385 via cash
4. Client sends payments array:
   ```json
   {
     "payments": [
       { "method": "UPI", "amount": 50000 },
       { "method": "CASH", "amount": 38500 }
     ]
   }
   ```
5. Server validates Σ(payments) = total
6. Creates two Payment records
7. Marks sale as PAID

---

## 8. Returns & Exchanges

### 8.1 Process Return

**Actor:** Staff (create), Manager (approve)

**Permission:** `returns.create`

**Precondition:** Original sale exists

**Steps:**
1. **Find Original Sale**
   - Scan invoice barcode or
   - Search by invoice number or phone

2. **Select Returnable Items**
   - System computes returnable quantity:
     - returnable = soldQty - alreadyReturnedQty
   - User selects items and quantities to return
   - User enters reason and condition

3. **Approval** (if required)
   - High-value returns: Manager approval required
   - See Approvals section

4. **Process Return**
   - Client sends `POST /returns`:
     ```json
     {
       "saleId": "sale-123",
       "items": [{
         "variantId": "variant-456",
         "quantity": 1,
         "disposition": "RESTOCK",
         "reason": "DEFECTIVE"
       }],
       "refundMethod": "CASH"
     }
     ```

5. **Server Transaction**:
   - Validate returnable qty ≥ requested qty
   - INSERT Return record
   - INSERT ReturnItem records
   - For each RESTOCK item:
     - INSERT StockMovement (type=CUSTOMER_RETURN, qty=+N)
     - UPDATE StockBalance (qty += N)
   - For DAMAGED items:
     - Move to quarantine location (tracked separately)
   - Calculate refund amount
   - INSERT Payment (type=REFUND) if immediate refund
   - INSERT LedgerEntry for financial reversal
   - INSERT AuditLog
   - INSERT OutboxEvent (return.completed)

6. **Return Response**:
   - Return record with items
   - Refund amount
   - Status: PENDING → APPROVED → REFUNDED

---

### 8.2 Approve Return

**Actor:** Manager

**Permission:** `returns.approve`

**Steps:**
1. Manager reviews return request
2. Inspects physical item (if applicable)
3. Approves or rejects
4. Client sends `POST /returns/:id/approve` or `POST /returns/:id/reject`
5. On approval:
   - Status = APPROVED
   - Process refund (if immediate)
6. On rejection:
   - Status = REJECTED
   - Item returned to customer
7. Server logs audit event

---

## 9. Quotations

### 9.1 Create Quotation

**Actor:** Staff, Manager

**Permission:** `quotations.create`

**Steps:**
1. User creates quotation:
   - Select customer (optional)
   - Add items with quantities and prices
   - Apply discounts
   - Set validity period
2. Client sends `POST /quotations`
3. Server generates quote number (unique)
4. Server calculates totals
5. Server creates Quotation (status: DRAFT)
6. Server logs audit event

---

### 9.2 Send Quotation

**Actor:** Staff

**Permission:** `quotations.create`

**Steps:**
1. User clicks "Send" on quotation
2. Client sends `POST /quotations/:id/send`
3. Server updates status = SENT
4. Server sends email/WhatsApp with quote PDF (via outbox)
5. Server logs audit event

---

### 9.3 Convert Quotation to Sale

**Actor:** Staff, Manager

**Permission:** `quotations.convert`

**Precondition:** Quotation status = ACCEPTED

**Steps:**
1. Customer accepts quotation
2. User clicks "Convert to Sale"
3. Client sends `POST /quotations/:id/convert`
4. Server validates quotation is ACCEPTED
5. Server validates quotation is not already converted
6. Server creates Sale from quotation:
   - Copy items with current prices (not quotation prices)
   - Set customer
   - Generate new invoice number
7. Server updates Quotation.status = CONVERTED
8. Server sets Quotation.convertedToSaleId
9. Server logs audit event

---

## 10. Customers & CRM

### 10.1 Create Customer

**Actor:** Staff

**Permission:** `customers.manage`

**Steps:**
1. User enters customer details:
   - Name (required)
   - Phone (required, unique)
   - Email (optional)
   - Address (optional)
2. Client sends `POST /customers`
3. Server validates phone uniqueness
4. Server creates Customer record
5. Server logs audit event

---

### 10.2 View Customer History

**Actor:** Staff, Manager

**Permission:** `customers.manage` or `sales.view_own`

**Steps:**
1. User searches customer by phone
2. Client sends `GET /customers/:id/purchases`
3. Server loads customer's sales, returns, quotations
4. Server returns timeline view

---

## 11. Finance & Expenses

### 11.1 Create Expense

**Actor:** Accountant, Manager

**Permission:** `finance.expenses.create`

**Steps:**
1. User enters expense:
   - Category (Rent, Utilities, Salary Advance, etc.)
   - Amount
   - Description
   - Date
2. Client sends `POST /expenses`
3. Server creates Expense (status: DRAFT)
4. If amount > threshold: send for approval
5. Server logs audit event

---

### 11.2 Approve Expense

**Actor:** Admin, Manager

**Permission:** `finance.expenses.approve`

**Steps:**
1. Manager reviews pending expense
2. Approves or rejects
3. On approval:
   - Expense.status = APPROVED
   - Create LedgerEntry for payment
4. Server logs audit event

---

## 12. Employees & Attendance

### 12.1 Clock In

**Actor:** Employee

**Steps:**
1. Employee opens app and taps "Clock In"
2. Client sends `POST /attendance/clock-in`
3. Server gets current date (in shop timezone)
4. Server checks for existing attendance today
5. Server creates Attendance record:
   - clockIn = now
   - status = PRESENT (or LATE if after shift start)
6. Server logs audit event

---

### 12.2 Clock Out

**Actor:** Employee

**Steps:**
1. Employee taps "Clock Out"
2. Client sends `POST /attendance/clock-out`
3. Server finds today's attendance record
4. Server updates Attendance:
   - clockOut = now
   - Calculate worked hours
5. Server logs audit event

---

### 12.3 Record Attendance Manually

**Actor:** Admin, Manager

**Permission:** `employees.manage`

**Steps:**
1. Admin selects employee and date
2. Admin sets status (PRESENT, ABSENT, LATE, HALF_DAY, LEAVE)
3. Admin optionally sets clock-in/out times
4. Client sends `POST /attendance`
5. Server upserts Attendance record
6. Server logs audit event

---

## 13. Payroll

### 13.1 Create Payroll Run

**Actor:** Admin, Accountant

**Permission:** `payroll.manage`

**Steps:**
1. Admin selects period (month/year)
2. Admin clicks "Create Payroll Run"
3. Client sends `POST /payroll/runs` { periodStart, periodEnd }
4. Server creates PayrollRun (status: DRAFT)
5. For each active employee:
   - Calculate working days from Attendance
   - Calculate base salary (pro-rated if needed)
   - Calculate commission from sales
   - Calculate overtime
   - Subtract advances
   - Subtract other deductions
   - Net pay = base + commission + overtime - advances - deductions
   - Create PayrollItem record
6. Server calculates totalAmount = Σ(netPay)
7. Server returns PayrollRun with all items

---

### 13.2 Finalize Payroll

**Actor:** Admin

**Permission:** `payroll.manage`

**Precondition:** PayrollRun status = REVIEW (approved by accountant)

**Steps:**
1. Admin reviews payroll run
2. Admin clicks "Finalize"
3. Client sends `POST /payroll/runs/:id/finalize`
4. Server validates status = REVIEW
5. Server updates status = FINALIZED
6. Server creates LedgerEntry for each PayrollItem
7. Server locks the period (no further changes allowed)
8. Server generates payslips (PDFs)
9. Server logs audit event

**Critical:** Once FINALIZED, the period is immutable. Corrections require a new payroll run.

---

## 14. Approvals

### 14.1 Request Approval

**Trigger:** User performs action exceeding their permission limit

**Examples:**
- Discount > 10% by Staff
- Stock adjustment > 100 units
- Return > ₹10,000
- Expense > ₹5,000

**Steps:**
1. User submits action
2. System evaluates if approval required
3. System creates ApprovalRequest:
   - type: DISCOUNT | STOCK_ADJUSTMENT | RETURN | EXPENSE | PURCHASE | PAYROLL
   - status: PENDING
   - entityType, entityId
   - requestedById
4. Action is NOT completed yet (held)
5. Notifier sent to approvers
6. User sees "Pending Approval" status

---

### 14.2 Approve/Reject

**Actor:** Manager, Admin

**Permission:** Corresponding approval permission

**Steps:**
1. Approver reviews request details
2. Approver adds notes (optional)
3. Approver approves or rejects
4. Client sends `POST /approvals/:id/approve` or `POST /approvals/:id/reject`
5. On approval:
   - ApprovalRequest.status = APPROVED
   - Original action is completed
6. On rejection:
   - ApprovalRequest.status = REJECTED
   - Original action is cancelled
7. Notifier sent to requester
8. Server logs audit event

---

## 15. Reporting & Dashboards

### 15.1 Owner Dashboard

**Metrics displayed:**
- Today's sales (count + amount)
- Today's gross profit
- Bills count
- Items sold
- Stock value (current inventory valuation)
- Low stock count (below reorder level)
- Out of stock count (qty = 0)
- Dead stock value (no sales in 90 days)
- Receivables (outstanding customer balances)
- Payables (outstanding supplier balances)
- Today's expenses
- Top 5 products by revenue
- Staff performance (sales by employee)
- Pending approvals count

**Refresh:** Auto-refresh every 60 seconds

---

### 15.2 Sales Report

**Filters:**
- Date range
- Branch
- Staff
- Payment method
- Category

**Columns:**
- Invoice number
- Date/time
- Customer
- Items
- Subtotal
- Discount
- Tax
- Total
- Payment method
- Staff
- Status

---

## 16. Notifications

### 16.1 Notification Types

| Event | Channel | Recipients |
|---|---|---|
| Sale completed | In-app | Staff who made sale |
| Low stock alert | In-app, Email | Manager, Admin |
| Return requested | In-app, Email | Manager |
| Return approved/rejected | In-app | Requester |
| Approval pending | In-app | Approvers |
| Expense submitted | In-app | Approvers |
| Payroll finalized | In-app, Email | All employees |
| Quotation sent | WhatsApp, Email | Customer |
| Dead stock detected | In-app, Email | Manager |

### 16.2 Notification Delivery

```
Action occurs
      │
      ▼
INSERT OutboxEvent
      │
      ▼
Outbox worker picks up event
      │
      ├──► In-app: Store in Notification table
      │
      ├──► Email: Send via email service
      │
      ├──► WhatsApp: Send via WhatsApp API
      │
      └──► Webhook: POST to configured URL
```

---

## 17. Shift Management

### 17.1 Open Shift

**Actor:** Staff

**Steps:**
1. Staff enters opening cash float
2. Client sends `POST /shifts`
3. Server creates Shift (status: OPEN, openedAt: now)
4. Staff can now process sales

---

### 17.2 During Shift

- All sales are attributed to this shift
- Shift tracks cumulative cash expected
- Staff can view shift summary anytime

---

### 17.3 Close Shift

**Actor:** Staff, Manager

**Steps:**
1. Staff counts actual cash in drawer
2. Client sends `POST /shifts/:id/close` { actualCash }
3. Server calculates expected cash
4. Server calculates difference
5. If |difference| > threshold: flag for manager review
6. Server updates Shift (status: CLOSED)
7. Manager reviews exceptions
8. Server logs audit event

---

## 18. Audit & Compliance

### 18.1 Audit Log Contents

Every audit event records:
- **actorId**: Who performed the action
- **action**: CREATE | UPDATE | DELETE | LOGIN | LOGOUT | VIEW | APPROVE | REJECT | CANCEL
- **entityType**: User, Sale, Purchase, StockMovement, etc.
- **entityId**: ID of the affected record
- **beforeData**: State before change (JSON)
- **afterData**: State after change (JSON)
- **metadata**: Additional context (IP address, device, etc.)
- **createdAt**: Timestamp

### 18.2 Audit Log Query

**Actor:** Admin, Accountant

**Permission:** `audit.view`

**Filters:**
- Entity type
- Entity ID
- Actor
- Action
- Date range

**Use cases:**
- "Show me all changes to sale #123"
- "Show me all actions by user X today"
- "Show me all inventory adjustments this month"
- "Show me the complete history of product Y"

---

### 18.3 Compliance Rules

1. **Immutability**: AuditLog records cannot be updated or deleted
2. **Retention**: Logs retained for 7 years (configurable)
3. **Access**: Only Admin and Accountant can view audit logs
4. **PII**: Sensitive data (password hashes) are excluded from audit
5. **Encryption**: Audit logs are encrypted at rest (production)

---

## Appendix: State Diagrams

### Sale Status

```
DRAFT ──► CONFIRMED ──► PAID ──► COMPLETED
  │          │            │          │
  │          │            │          ▼
  │          │            │      PARTIALLY_
  │          │            │        RETURNED
  │          │            │          │
  │          │            │          ▼
  │          │            │        RETURNED
  │          │            │          │
  ▼          ▼            ▼          ▼
CANCELLED  CANCELLED  CANCELLED   CANCELLED
```

### Return Status

```
REQUESTED ──► INSPECTING ──► APPROVED ──► REFUNDED
    │              │            │           │
    ▼              ▼            │           │
 REJECTED      REJECTED         ▼           │
                               (exchange) ──┘
```

### Purchase Status

```
DRAFT ──► ORDERED ──► PARTIALLY_RECEIVED ──► RECEIVED
  │            │              │                 │
  ▼            ▼              ▼                 ▼
CANCELLED  CANCELLED       CANCELLED        CANCELLED
```

### Quotation Status

```
DRAFT ──► SENT ──► ACCEPTED ──► CONVERTED
  │          │         │            │
  ▼          ▼         ▼            ▼
 REJECTED  EXPIRED   EXPIRED     (links to Sale)
```

### Payroll Status

```
DRAFT ──► REVIEW ──► APPROVED ──► FINALIZED
  │          │            │           │
  ▼          ▼            ▼           ▼
 (deleted)  (deleted)   (deleted)   (LOCKED)
```
