# Architecture

## High-level

```text
Flutter Staff/Owner Apps
          |
          | HTTPS
          v
Next.js Admin -----> NestJS Modular Monolith
                          |
             +------------+------------+
             |                         |
         PostgreSQL                  Redis
             |
       S3-compatible storage
```

## Backend modules
auth, organizations, branches, users, rbac, products, inventory, suppliers, purchases, customers, sales, payments, returns, quotations, finance, expenses, employees, attendance, payroll, approvals, notifications, reports, audit.

## Data flow
Command -> controller -> DTO validation -> authorization -> domain service -> DB transaction -> audit event -> outbox/event -> async notification/report update.

## Transaction boundary
For completed sale:
- validate stock
- create sale
- create sale items
- create payment records
- create stock movements
- update inventory balance
- create finance posting
- create audit record
All in one database transaction.

## Outbox
Use an outbox table for reliable asynchronous events:
- sale.completed
- purchase.received
- low_stock.detected
- return.completed
- payroll.finalized
- notification.requested

## Multi-tenant readiness
All business tables carry `organizationId`; branch-scoped tables also carry `branchId`.
Never trust tenant/branch IDs from the client without authorization.

## Money
Use PostgreSQL Decimal for persisted monetary values and a money utility in TypeScript. Avoid JS floating-point calculations.

## Inventory
`StockMovement` is the source-of-truth history.
`StockBalance` is a fast current-state projection/cache protected by transactions.

Movement types:
PURCHASE_RECEIPT, SALE, CUSTOMER_RETURN, SUPPLIER_RETURN, DAMAGE, LOSS, FOUND, ADJUSTMENT, TRANSFER_IN, TRANSFER_OUT, COUNT_CORRECTION.

## Product tracking
Tracking modes:
NONE, BATCH, SERIAL.

## Financial accounting
Start with operational finance and COGS.
Keep ledger abstractions ready for double-entry accounting later.
Do not label a simple margin report as statutory accounting.

## Deployment
- local
- staging
- production
- managed PostgreSQL
- encrypted backups
- object storage
- TLS
- secret manager/environment secrets
