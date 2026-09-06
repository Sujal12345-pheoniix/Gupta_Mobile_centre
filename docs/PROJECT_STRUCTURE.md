# Recommended Repository Structure

```text
gupta-mobile-centre/
├── apps/
│   ├── admin-web/
│   ├── staff-mobile/
│   └── owner-mobile/
├── services/
│   └── api/
├── packages/
│   ├── database/
│   ├── types/
│   ├── validation/
│   ├── ui/
│   ├── config/
│   └── utils/
├── docs/
├── database/
│   └── schema.prisma
├── infrastructure/
│   ├── docker/
│   └── deployment/
├── scripts/
├── tests/
├── .github/workflows/
├── .env.example
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## First implementation folders

NestJS:
```text
services/api/src/modules/
auth/
organizations/
branches/
users/
rbac/
products/
inventory/
purchases/
suppliers/
customers/
sales/
payments/
returns/
quotations/
finance/
expenses/
employees/
attendance/
payroll/
approvals/
notifications/
reports/
audit/
```

Next.js:
```text
apps/admin-web/app/
dashboard/
inventory/
sales/
purchases/
suppliers/
customers/
quotations/
finance/
employees/
reports/
settings/
```

Flutter:
```text
apps/staff-mobile/lib/
core/
features/auth/
features/pos/
features/products/
features/sales/
features/quotations/
features/returns/
features/shifts/
```
