# RBAC Matrix

Permission naming convention: `resource.action`

## Roles

| Permission | Admin | Sub-admin | Staff | Accountant |
|---|---:|---:|---:|---:|
| dashboard.view | ✓ | ✓ | limited | ✓ |
| products.view | ✓ | ✓ | ✓ | — |
| products.create | ✓ | ✓ | — | — |
| products.update | ✓ | ✓ | — | — |
| products.archive | ✓ | ✓ | — | — |
| inventory.view | ✓ | ✓ | limited | — |
| inventory.receive | ✓ | ✓ | — | — |
| inventory.adjust | ✓ | ✓* | — | — |
| inventory.count | ✓ | ✓ | ✓* | — |
| purchases.view | ✓ | ✓ | — | ✓ |
| purchases.create | ✓ | ✓ | — | — |
| purchases.approve | ✓ | ✓* | — | — |
| suppliers.manage | ✓ | ✓ | — | — |
| sales.create | ✓ | ✓ | ✓ | — |
| sales.view_all | ✓ | ✓ | — | — |
| sales.view_own | ✓ | ✓ | ✓ | — |
| sales.cancel | ✓ | ✓* | — | — |
| discounts.apply | ✓ | ✓ | ✓ limited | — |
| discounts.approve | ✓ | ✓ | — | — |
| returns.create | ✓ | ✓ | ✓ limited | — |
| returns.approve | ✓ | ✓ | — | — |
| quotations.create | ✓ | ✓ | ✓ | — |
| quotations.convert | ✓ | ✓ | ✓ limited | — |
| customers.manage | ✓ | ✓ | ✓ limited | — |
| finance.view | ✓ | ✓ limited | — | ✓ |
| finance.expenses.create | ✓ | ✓* | — | ✓ |
| finance.expenses.approve | ✓ | ✓ | — | ✓ |
| payroll.view | ✓ | ✓ | — | ✓ |
| payroll.manage | ✓ | ✓* | — | ✓ |
| employees.view | ✓ | ✓ | limited | ✓ |
| employees.manage | ✓ | ✓* | — | — |
| roles.manage | ✓ | — | — | — |
| reports.view | ✓ | ✓ | own/limited | ✓ |
| audit.view | ✓ | ✓ | — | ✓ limited |
| settings.manage | ✓ | — | — | — |
| branch.manage | ✓ | — | — | — |
| backups.manage | ✓ | — | — | — |

`*` should be configurable by the owner.

## Authorization rules
- Deny by default.
- Permission checks occur server-side.
- UI visibility is not authorization.
- Resource scope must also be checked: tenant -> branch -> user-owned records where applicable.
- Sensitive operations can require re-authentication or manager approval.
