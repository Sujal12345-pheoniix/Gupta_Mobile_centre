# Gupta Mobile Centre — Master Engineering Instructions

## Mission
Build a production-grade, multi-tenant-ready retail management platform for Gupta Mobile Centre:
- POS and billing
- Inventory and stock ledger
- Purchases and suppliers
- Customers and CRM
- Quotations
- Returns/exchanges
- Finance and expenses
- Employee, attendance and payroll
- RBAC and approvals
- Reporting and dashboards
- Notifications
- Auditability
- Future multi-branch / SaaS support

## Non-negotiable engineering rules

1. Do not build the whole system in one pass. Implement vertical slices.
2. Before coding a module, inspect the existing architecture, schema and tests.
3. Never invent business facts, tax rules, credentials, API keys or external integrations.
4. Never hard-delete financial transactions, payments, invoices, stock movements, payroll records or audit logs. Use status/cancellation/reversal workflows.
5. Inventory is ledger-driven. Never rely only on `product.stock--`.
6. Sale, payment, inventory movement and financial posting must be transactionally consistent.
7. Every privileged mutation must create an audit event.
8. RBAC must use permissions, not scattered `role === "admin"` checks.
9. Server-side authorization is mandatory. Client-side hiding is only UX.
10. Validate all API input at the boundary.
11. Use idempotency for payment/sale operations where retries are possible.
12. Monetary values must use integer minor units or a decimal type; never JavaScript floating-point arithmetic for money.
13. Quantities may be decimal only where the product unit requires it; otherwise use integer quantities.
14. All timestamps are stored in UTC; render in the shop's configured timezone.
15. Database constraints must protect invariants wherever possible.
16. Write tests for every critical business invariant.
17. Do not expose secrets in source code, logs, screenshots or error responses.
18. Prefer simple, maintainable architecture over premature microservices.
19. Build online-first. Add robust offline sync only after the core system is stable.
20. Do not add AI features until deterministic business workflows are reliable.

## Recommended stack
- Monorepo: pnpm + Turborepo
- Admin Web: Next.js + TypeScript
- Mobile: Flutter
- API: NestJS + TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Cache/queues: Redis
- Object storage: S3-compatible
- API style: REST + OpenAPI
- Auth: secure session/JWT architecture with refresh-token rotation
- Tests: Vitest/Jest + Supertest + Playwright; Flutter tests for mobile
- Containers: Docker
- CI: GitHub Actions

## Architecture principles
Use modular monolith architecture initially:
- auth
- users
- rbac
- organizations
- branches
- products
- inventory
- suppliers
- purchases
- customers
- sales
- payments
- returns
- quotations
- finance
- expenses
- employees
- attendance
- payroll
- approvals
- notifications
- reports
- audit

Each module should have clear domain services and repository/data-access boundaries.

## Vertical slice order
1. Foundation/auth/RBAC
2. Products + SKU + barcode
3. Inventory ledger
4. Purchase receiving
5. POS sale + payment + invoice
6. Returns/exchanges
7. Customers/suppliers
8. Quotations
9. Expenses/finance/reporting
10. Employees/attendance/payroll
11. Approvals/audit hardening
12. Notifications/WhatsApp-ready integration
13. Multi-branch
14. Offline sync
15. AI analytics

## Critical invariants
- Cannot sell more than available sellable stock unless an explicit negative-stock policy is enabled.
- A completed sale must have exactly one authoritative stock deduction per sale item.
- A cancelled sale must reverse its inventory/financial effects exactly once.
- A return cannot exceed the returnable quantity.
- A payment cannot exceed the outstanding amount unless overpayment is explicitly supported.
- Historical records are immutable except through documented reversal/correction workflows.
- Every stock adjustment requires a reason.
- Discounts above a role's limit require approval.
- Payroll periods become locked after finalization.
- Audit records are append-only.

## Required workflow for every module
Requirements -> domain model -> DB migration -> API contract -> service logic -> unit tests -> integration tests -> UI -> E2E test -> audit/security review -> documentation.

## Definition of Done
A feature is not complete until:
- migrations exist
- validation exists
- authorization exists
- error handling exists
- audit behavior is defined
- tests pass
- UI handles loading/error/empty states
- API docs are updated
- no sensitive data leaks
- acceptance criteria are demonstrated
