# API Specification — v1

Base path: `/api/v1`

## Auth
- POST `/auth/login`
- POST `/auth/logout`
- POST `/auth/refresh`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- GET `/auth/me`

## Users/RBAC
- GET `/users`
- POST `/users`
- GET `/users/:id`
- PATCH `/users/:id`
- POST `/users/:id/deactivate`
- GET `/roles`
- POST `/roles`
- PATCH `/roles/:id`
- GET `/permissions`

## Products
- GET `/products`
- POST `/products`
- GET `/products/:id`
- PATCH `/products/:id`
- POST `/products/:id/archive`
- GET `/categories`
- POST `/categories`
- GET `/brands`
- POST `/brands`
- GET `/products/barcode/:barcode`

## Inventory
- GET `/inventory`
- GET `/inventory/low-stock`
- GET `/inventory/out-of-stock`
- GET `/inventory/dead-stock`
- GET `/inventory/:variantId/ledger`
- POST `/inventory/adjustments`
- POST `/inventory/counts`
- POST `/inventory/counts/:id/submit`

## Suppliers/Purchases
- GET `/suppliers`
- POST `/suppliers`
- GET `/suppliers/:id`
- PATCH `/suppliers/:id`
- GET `/purchases`
- POST `/purchases`
- GET `/purchases/:id`
- POST `/purchases/:id/receive`
- POST `/purchases/:id/payments`

## Customers
- GET `/customers`
- POST `/customers`
- GET `/customers/:id`
- PATCH `/customers/:id`
- GET `/customers/:id/purchases`

## Sales/POS
- POST `/sales/quote`
- POST `/sales`
- GET `/sales`
- GET `/sales/:id`
- POST `/sales/:id/cancel`
- POST `/sales/:id/payments`
- GET `/sales/:id/invoice`

## Returns
- POST `/returns`
- GET `/returns`
- GET `/returns/:id`
- POST `/returns/:id/approve`
- POST `/returns/:id/refund`

## Quotations
- GET `/quotations`
- POST `/quotations`
- GET `/quotations/:id`
- PATCH `/quotations/:id`
- POST `/quotations/:id/send`
- POST `/quotations/:id/convert`

## Finance
- GET `/finance/summary`
- GET `/finance/ledger`
- GET `/finance/profit-loss`
- GET `/expenses`
- POST `/expenses`
- PATCH `/expenses/:id`
- POST `/expenses/:id/approve`
- POST `/cash-closures`
- GET `/cash-closures`

## Employees
- GET `/employees`
- POST `/employees`
- GET `/employees/:id`
- PATCH `/employees/:id`
- POST `/employees/:id/deactivate`
- GET `/attendance`
- POST `/attendance/clock-in`
- POST `/attendance/clock-out`
- GET `/payroll`
- POST `/payroll/runs`
- POST `/payroll/runs/:id/finalize`

## Reports
- GET `/reports/sales`
- GET `/reports/inventory`
- GET `/reports/profit`
- GET `/reports/staff`
- GET `/reports/suppliers`
- GET `/reports/payments`

## Approvals
- GET `/approvals`
- POST `/approvals/:id/approve`
- POST `/approvals/:id/reject`

## Notifications
- GET `/notifications`
- POST `/notifications/:id/read`

## Audit
- GET `/audit-logs`

## API conventions
- Cursor pagination for large collections.
- Query filters are explicit and validated.
- Mutations return a stable resource representation.
- Use idempotency key header for critical retryable commands: `Idempotency-Key`.
- Use consistent error shape:
```json
{
  "code": "STOCK_INSUFFICIENT",
  "message": "Insufficient sellable stock",
  "details": {}
}
```
