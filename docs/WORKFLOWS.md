# Core Business Workflows

## Sale
1. Staff opens shift.
2. Scan/search SKU.
3. Server validates product and stock.
4. Add item to cart.
5. Apply allowed discount.
6. If discount exceeds limit -> approval.
7. Calculate subtotal/tax/total using server-side money logic.
8. Create sale, sale items, payment(s), stock movements and audit event in one transaction.
9. Generate invoice number.
10. Print/share invoice.
11. Emit notifications and analytics events asynchronously.

## Purchase receiving
1. Create purchase order.
2. Supplier delivers goods.
3. Staff/manager receives items.
4. Verify quantity/serials.
5. Create goods receipt.
6. Add positive stock movements.
7. Update supplier payable.
8. Record audit event.

## Customer return
1. Find original invoice.
2. Select returnable items.
3. Capture reason/condition.
4. Approval if required.
5. Create return.
6. Refund/exchange.
7. Create reversing/positive stock movement when item is sellable.
8. If defective, move to damaged/quarantine stock.
9. Record financial reversal and audit.

## Stock adjustment
1. User requests adjustment.
2. Select reason.
3. Enter quantity.
4. System shows before/after.
5. Approval if required.
6. Create immutable stock movement.
7. Update balance.
8. Audit.

## Daily cash close
1. Staff opens shift with opening cash.
2. Sales are collected during shift.
3. At close, system calculates expected cash.
4. Staff enters actual cash.
5. Difference is calculated.
6. Staff submits.
7. Manager reviews/approves exceptions.
8. Close shift and create cash-close record.

## Quotation to sale
Draft -> Sent -> Accepted -> Converted.
Conversion must reference the quotation and prevent duplicate conversion.

## Payroll
1. Open payroll period.
2. Import attendance/leave.
3. Calculate base pay, commission, overtime, advances and deductions.
4. Review.
5. Approve.
6. Finalize/lock.
7. Record payroll ledger entries.
8. Generate payslips.

## Employee offboarding
Deactivate account -> revoke sessions -> preserve sales/attendance/payroll/audit history.

## Dead stock
Nightly job:
- identify variants with no sales in configured period
- calculate quantity and inventory cost
- notify manager
- surface clearance recommendations
