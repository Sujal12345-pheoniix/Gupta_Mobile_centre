# Gupta Mobile Centre — Complete System Design

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Monorepo Structure](#monorepo-structure)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [Database Design](#database-design)
7. [API Design](#api-design)
8. [Authentication & RBAC](#authentication--rbac)
9. [Business Workflows](#business-workflows)
10. [CI/CD Pipeline](#cicd-pipeline)
11. [Deployment Architecture](#deployment-architecture)
12. [Security Architecture](#security-architecture)
13. [Money & Inventory Invariants](#money--inventory-invariants)

---

## 1. System Overview

Gupta Mobile Centre is a **production-grade, multi-tenant-ready retail management platform** for a mobile accessories and parts shop. The system covers the full retail operations lifecycle:

- **POS and billing** (Point of Sale)
- **Inventory and stock ledger**
- **Purchases and suppliers**
- **Customers and CRM**
- **Quotations**
- **Returns and exchanges**
- **Finance and expenses**
- **Employee, attendance and payroll**
- **RBAC (Role-Based Access Control) and approvals**
- **Reporting and dashboards**
- **Notifications**
- **Auditability**
- **Multi-branch / SaaS ready**

### Primary Users
- **Owner/Admin** — Full business visibility and configuration
- **Sub-admin/Manager** — Operational control with restricted financial/system permissions
- **Staff** — Fast POS, product lookup, quotations, permitted returns
- **Accountant** — Finance/payroll/reporting without operational admin

---

## 2. Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    Client Layer                                  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Flutter App  │  │ Next.js      │  │ Future: Owner App    │  │
│  │ (Staff/Owner)│  │ Admin Web    │  │ (Mobile)             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │               │
└─────────┼─────────────────┼──────────────────────┼───────────────┘
          │                 │                      │
          │    HTTPS (TLS)  │                      │
          └─────────────────┼──────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    API Layer (NestJS)                            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Modular Monolith                                        │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │ Auth   │ │ RBAC   │ │ Users  │ │ Audit  │ │ Health │ │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │Products│ │Inventory│ │Purchases│ │Sales  │ │Returns │ │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │  │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │  │
│  │  │Customers│ │Quotations│ │Finance│ │Employees│ │Payroll│ │  │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Cross-cutting: Helmet · CORS · Pino Logger · Validation         │
└─────────┬──────────────────────────┬─────────────────────────────┘
          │                          │
          ▼                          ▼
┌──────────────────────┐    ┌──────────────────────┐
│   PostgreSQL 15      │    │   Redis 7            │
│   (Primary DB)       │    │   (Cache/Queue)      │
└──────────────────────┘    └──────────────────────┘
            │
            ▼
┌──────────────────────┐
│  S3-Compatible       │
│  Object Storage      │
│  (Invoices, Backups) │
└──────────────────────┘
```

### Architecture Principles

1. **Modular Monolith** — Single deployable NestJS app, organized into business modules
2. **Domain-Driven Design** — Each module has clear domain services and data-access boundaries
3. **Multi-Tenant Ready** — All business tables carry `organizationId`; branch-scoped tables also carry `branchId`
4. **Ledger-Driven Inventory** — `StockMovement` is the source-of-truth; `StockBalance` is a cache
5. **Money Safety** — PostgreSQL `Decimal(12,2)` for persisted values; integer minor units in business logic
6. **Append-Only Audit** — Audit events are never updated or deleted
7. **Server-Side Authorization** — UI hiding is UX only; backend is the source of truth

---

## 3. Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Monorepo** | pnpm + Turborepo | Workspace management |
| **Admin Web** | Next.js 14 + TypeScript | Owner/Manager interface |
| **Mobile** | Flutter | Staff POS app |
| **API** | NestJS 10 + TypeScript | Business logic |
| **Database** | PostgreSQL 15 | Primary data store |
| **ORM** | Prisma 5 | Type-safe database access |
| **Cache/Queue** | Redis 7 | Session cache, async jobs |
| **Auth** | JWT (access + refresh) | Token-based authentication |
| **Validation** | Zod | Runtime schema validation |
| **Logging** | Pino | Structured JSON logging |
| **Security** | Helmet, bcrypt | HTTP hardening, password hashing |
| **Container** | Docker | Local + production deployment |
| **CI/CD** | GitHub Actions | Automated tests, builds, migrations |
| **Tests** | Jest + Supertest | Unit + integration tests |

---

## 4. Monorepo Structure

```
gupta-mobile-centre/
├── .github/workflows/         # CI/CD pipelines
│   └── ci.yml
├── apps/
│   ├── api/                   # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts        # App entry
│   │   │   ├── app.module.ts  # Root module
│   │   │   ├── common/        # PrismaService, LoggerModule
│   │   │   ├── health/        # Health check
│   │   │   ├── pipes/         # Validation pipes
│   │   │   └── modules/       # Business modules
│   │   │       ├── auth/      # Login, JWT, register
│   │   │       ├── rbac/      # Roles, permissions
│   │   │       ├── users/     # User CRUD
│   │   │       ├── audit/     # Audit logging
│   │   │       ├── products/  # (Phase 2)
│   │   │       ├── inventory/ # (Phase 3)
│   │   │       ├── sales/     # (Phase 4)
│   │   │       └── ...
│   │   ├── nest-cli.json
│   │   ├── jest.config.js
│   │   └── package.json
│   ├── admin-web/             # Next.js admin
│   │   ├── src/
│   │   │   ├── app/           # App router
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   └── api/health/
│   │   │   └── lib/
│   │   │       ├── api.ts     # API client
│   │   │       └── auth.tsx   # Auth provider
│   │   ├── tailwind.config.js
│   │   └── package.json
│   └── staff-mobile/          # Flutter app
│       ├── lib/
│       │   ├── main.dart
│       │   └── core/          # API client, logger
│       ├── pubspec.yaml
│       └── ...
├── packages/                  # Shared libraries
│   ├── database/              # Prisma client export
│   ├── types/                 # Shared TypeScript types
│   ├── validation/            # Shared Zod schemas
│   ├── utils/                 # Money, logger
│   ├── config/                # Env validation
│   └── ui/                    # Shared components
├── prisma/
│   └── schema.prisma          # Database schema
├── infrastructure/
│   └── docker/
│       ├── api/Dockerfile
│       └── admin/Dockerfile
├── scripts/
│   └── seed.ts                # Database seeder
├── docs/                      # Documentation
├── .env.example               # Environment template
├── docker-compose.yml         # Local stack
├── package.json               # Root workspace
└── pnpm-workspace.yaml
```

---

## 5. Data Flow Diagrams

### 5.1 Sale Workflow (Most Critical)

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Staff     │     │  POS App   │     │  API       │
│  Action    │     │  (Flutter) │     │  (NestJS)  │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │
      │ 1. Open shift    │                  │
      ├─────────────────►│                  │
      │                  │ 2. POST /sales   │
      │                  ├─────────────────►│
      │                  │                  │
      │                  │                  │ 3. Validate input (Zod)
      │                  │                  │
      │                  │                  │ 4. Check JWT + permission
      │                  │                  │    (sales.create)
      │                  │                  │
      │                  │                  │ 5. BEGIN TRANSACTION
      │                  │                  │
      │                  │                  │ 6. Validate stock available
      │                  │                  │    (SELECT ... FOR UPDATE)
      │                  │                  │
      │                  │                  │ 7. Compute money (minor units)
      │                  │                  │
      │                  │                  │ 8. INSERT Sale
      │                  │                  │
      │                  │                  │ 9. INSERT SaleItem[]
      │                  │                  │
      │                  │                  │ 10. INSERT Payment[]
      │                  │                  │
      │                  │                  │ 11. INSERT StockMovement[]
      │                  │                  │     (type=SALE, qty<0)
      │                  │                  │
      │                  │                  │ 12. UPDATE StockBalance
      │                  │                  │
      │                  │                  │ 13. INSERT LedgerEntry[]
      │                  │                  │     (revenue + COGS)
      │                  │                  │
      │                  │                  │ 14. INSERT AuditLog
      │                  │                  │
      │                  │                  │ 15. INSERT OutboxEvent
      │                  │                  │     (sale.completed)
      │                  │                  │
      │                  │                  │ 16. COMMIT TRANSACTION
      │                  │                  │
      │                  │ ◄────────────────┤
      │                  │ 17. Return       │
      │                  │     {sale, ...}  │
      │                  │                  │
      │ 18. Display      │                  │
      │     invoice      │                  │
      │ ◄────────────────┤                  │
      │                  │                  │
      │                  │                  │ 19. Outbox worker
      │                  │                  │     processes events
      │                  │                  │     (notification, analytics)
      │                  │                  │
```

### 5.2 Authentication Flow

```
┌────────┐         ┌────────┐         ┌────────┐
│ Client │         │  API   │         │  DB    │
└───┬────┘         └───┬────┘         └───┬────┘
    │                  │                  │
    │ 1. POST /auth/login                  │
    │ {email, password}                    │
    ├─────────────────►│                  │
    │                  │                  │
    │                  │ 2. SELECT user   │
    │                  ├─────────────────►│
    │                  │                  │
    │                  │ ◄────────────────┤
    │                  │ 3. user record   │
    │                  │                  │
    │                  │ 4. bcrypt.compare
    │                  │                  │
    │                  │ 5. JWT.sign      │
    │                  │    accessToken   │
    │                  │    (15 min)      │
    │                  │                  │
    │                  │ 6. JWT.sign      │
    │                  │    refreshToken  │
    │                  │    (30 days)     │
    │                  │                  │
    │                  │ 7. UPDATE user   │
    │                  │   lastLoginAt    │
    │                  ├─────────────────►│
    │                  │                  │
    │ ◄────────────────┤                  │
    │ {accessToken,    │                  │
    │  refreshToken,   │                  │
    │  user}           │                  │
    │                  │                  │
    │ 8. Store tokens  │                  │
    │  in localStorage │                  │
    │                  │                  │
    │ 9. GET /auth/me  │                  │
    │ Authorization:   │                  │
    │ Bearer <token>   │                  │
    ├─────────────────►│                  │
    │                  │                  │
    │                  │ 10. JWT.verify   │
    │                  │                  │
    │                  │ 11. validateUser │
    │                  │                  │
    │ ◄────────────────┤                  │
    │ {user, roles,    │                  │
    │  permissions}    │                  │
    │                  │                  │
```

### 5.3 RBAC Permission Check Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│  Client    │     │ Controller │     │ JwtAuth    │     │ Permissions│
│            │     │            │     │ Guard      │     │ Guard      │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │                  │
      │ 1. PATCH /users/abc                 │                  │
      │ Authorization: Bearer <token>       │                  │
      ├─────────────────►│                  │                  │
      │                  │                  │                  │
      │                  │ 2. canActivate() │                  │
      │                  ├─────────────────►│                  │
      │                  │                  │                  │
      │                  │                  │ 3. Extract token │
      │                  │                  │                  │
      │                  │                  │ 4. JWT.verify    │
      │                  │                  │                  │
      │                  │                  │ 5. Load user     │
      │                  │                  │    + permissions │
      │                  │                  │                  │
      │                  │ ◄────────────────┤                  │
      │                  │ 6. user attached │                  │
      │                  │                  │                  │
      │                  │ 7. canActivate() │                  │
      │                  ├─────────────────────────────►│     │
      │                  │                  │                  │
      │                  │                  │ 8. Read metadata │
      │                  │                  │    @RequirePerms │
      │                  │                  │    ('users.update')│
      │                  │                  │                  │
      │                  │                  │ 9. user.permissions
      │                  │                  │    .includes('users.update')?
      │                  │                  │                  │
      │                  │ ◄──────────────────────────────┤   │
      │                  │ 10. true (or 403 Forbidden)     │   │
      │                  │                  │                  │
      │                  │ 11. Execute      │                  │
      │                  │     handler      │                  │
      │                  │                  │                  │
```

### 5.4 Purchase Receiving Flow

```
┌────────┐         ┌────────┐         ┌────────┐
│Manager │         │  API   │         │  DB    │
└───┬────┘         └───┬────┘         └───┬────┘
    │                  │                  │
    │ 1. POST /purchases (create order)    │
    ├─────────────────►│                  │
    │                  │ INSERT Purchase  │
    │                  │ status=DRAFT     │
    │                  ├─────────────────►│
    │                  │                  │
    │ 2. POST /purchases/:id/receive       │
    │ {items: [...]}   │                  │
    ├─────────────────►│                  │
    │                  │                  │
    │                  │ BEGIN TX          │
    │                  │                  │
    │                  │ 3. Validate order│
    │                  │    status         │
    │                  │                  │
    │                  │ 4. For each item:│
    │                  │   - Insert       │
    │                  │     StockMovement│
    │                  │     type=PURCHASE│
    │                  │     qty>0        │
    │                  │   - Update       │
    │                  │     StockBalance │
    │                  │   - Update       │
    │                  │     PurchaseItem │
    │                  │                  │
    │                  │ 5. Update        │
    │                  │    Purchase      │
    │                  │    status=RECEIVED│
    │                  │                  │
    │                  │ 6. Create        │
    │                  │    LedgerEntry   │
    │                  │    (inventory)   │
    │                  │                  │
    │                  │ 7. AuditLog      │
    │                  │                  │
    │                  │ 8. COMMIT        │
    │                  │                  │
    │ ◄────────────────┤                  │
    │ {purchase, ...}  │                  │
    │                  │                  │
```

---

## 6. Database Design

### Entity-Relationship Overview

```
Organization (1) ──── (M) Branch
     │                     │
     │                     │
     │ (1)                 │ (1)
     ▼                     ▼
   User ──── (M:M) ──── Role ──── (M:M) ──── Permission
     │                     │
     │                     │
     ▼                     ▼
   Employee               UserRole
     │                     RolePermission
     │
     ├── Attendance
     ├── PayrollItem
     └── Shift

Organization (1) ──── (M) Product ──── (M) ProductVariant
                          │                   │
                          │                   │
                          Category           StockBalance
                          Brand              StockMovement
                                              │
                          ProductVariant     SaleItem
                                              PurchaseItem
                                              ReturnItem

Organization (1) ──── (M) Customer
                     (M) Supplier
                     (M) Quotation
                     (M) Expense
                     (M) AuditLog

Branch (1) ──── (M) Sale ──── (M) SaleItem
                    │ (1)         │
                    │             └───► (1) ProductVariant
                    │
                    ├── Payment
                    ├── Return
                    └── Shift

Branch (1) ──── (M) Purchase ──── (M) PurchaseItem
                                  │
                                  └───► (1) Supplier

Employee (1) ──── (M) Attendance
              (M) PayrollItem
```

### Key Tables (Prisma Models)

| Model | Purpose | Key Fields |
|---|---|---|
| `Organization` | Multi-tenant root | id, name, timezone, currency |
| `Branch` | Store/branch | id, organizationId, code |
| `User` | Login identity | id, email, phone, passwordHash, status |
| `Role` | Permission bundle | id, name |
| `Permission` | Atomic permission | id, key (e.g., `products.view`) |
| `UserRole` | User↔Role join | userId, roleId |
| `RolePermission` | Role↔Permission join | roleId, permissionId |
| `Employee` | Staff profile | id, branchId, baseSalary, commissionRate |
| `Category` | Product taxonomy | id, organizationId, parentId |
| `Brand` | Product brand | id, organizationId |
| `Product` | Product header | id, organizationId, name |
| `ProductVariant` | SKU + price | id, sku, barcode, sellingPrice, purchasePrice |
| `StockBalance` | Current stock cache | branchId, variantId, quantity |
| `StockMovement` | **Source-of-truth ledger** | type, quantity, referenceType, referenceId |
| `Supplier` | Vendor | id, organizationId, gstin |
| `Customer` | Buyer | id, organizationId, phone |
| `Sale` | POS transaction | id, invoiceNumber, status, total |
| `SaleItem` | Line item | saleId, variantId, quantity, unitPrice |
| `Payment` | Payment record | saleId, amount, method |
| `Return` | Customer return | saleId, status, refundAmount |
| `ReturnItem` | Returned line | returnId, variantId, disposition |
| `Purchase` | Vendor PO | branchId, supplierId, status |
| `PurchaseItem` | PO line | purchaseId, variantId, quantity, unitCost |
| `Quotation` | Quote | branchId, customerId, status, total |
| `Expense` | Operating expense | branchId, amount, status |
| `Shift` | Cash drawer | branchId, userId, status, openingCash |
| `Attendance` | Clock-in/out | employeeId, date, status |
| `PayrollRun` | Pay period | periodStart, periodEnd, status |
| `PayrollItem` | Per-employee pay | payrollRunId, employeeId, netPay |
| `ApprovalRequest` | Approval workflow | type, status, entityType, entityId |
| `AuditLog` | **Append-only** | actorId, action, entityType, beforeData, afterData |
| `OutboxEvent` | Async event queue | eventType, payload, processedAt |

### Schema Highlights

- **All monetary fields**: `Decimal @db.Decimal(12,2)`
- **All quantity fields**: `Decimal @db.Decimal(12,3)` (allows fractional for length-based items)
- **All timestamps**: UTC, rendered in shop timezone
- **Multi-tenant**: Every business table has `organizationId` index
- **Branch-scoped**: Tables like Sale, Purchase also have `branchId`
- **Unique constraints**: SKU, barcode, invoice number, employee code
- **Cascade deletes**: Only for non-financial records (e.g., `SaleItem` cascade from `Sale`)

---

## 7. API Design

### Base URL

```
http://localhost:3000/api/v1
```

### Standard Response Shape

```json
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": {
    "code": "STOCK_INSUFFICIENT",
    "message": "Insufficient sellable stock",
    "details": { "available": 1, "requested": 2 }
  }
}
```

### Conventions

- **Authentication**: `Authorization: Bearer <token>` header
- **Idempotency**: `Idempotency-Key: <uuid>` header for critical mutations
- **Pagination**: Cursor-based for large collections
- **Validation**: Zod schemas at boundary
- **Versioning**: URL-based (`/api/v1`)

### Endpoints Implemented (Phase 0-1)

| Method | Path | Module | Permission |
|---|---|---|---|
| GET | `/health` | health | public |
| POST | `/auth/login` | auth | public |
| POST | `/auth/register` | auth | public |
| POST | `/auth/refresh` | auth | public |
| POST | `/auth/logout` | auth | authenticated |
| GET | `/auth/me` | auth | authenticated |
| POST | `/auth/forgot-password` | auth | public |
| POST | `/auth/reset-password` | auth | public |
| GET | `/users` | users | `users.view` |
| GET | `/users/:id` | users | `users.view` |
| POST | `/users` | users | `users.create` |
| PATCH | `/users/:id` | users | `users.update` |
| POST | `/users/:id/deactivate` | users | `users.deactivate` |
| POST | `/users/:id/activate` | users | `users.activate` |
| POST | `/users/:id/change-password` | users | `users.change_password` |
| GET | `/rbac/roles` | rbac | `roles.manage` |
| GET | `/rbac/roles/:id` | rbac | `roles.manage` |
| POST | `/rbac/roles` | rbac | `roles.manage` |
| PATCH | `/rbac/roles/:id` | rbac | `roles.manage` |
| GET | `/rbac/permissions` | rbac | `roles.manage` |
| GET | `/rbac/users/:userId/roles` | rbac | `roles.manage` |
| POST | `/rbac/users/:userId/roles` | rbac | `roles.manage` |
| DELETE | `/rbac/users/:userId/roles/:roleId` | rbac | `roles.manage` |
| GET | `/audit/logs` | audit | `audit.view` |
| GET | `/audit/entity/:type/:id` | audit | `audit.view` |
| GET | `/audit/actor/:actorId` | audit | `audit.view` |

### Endpoints Planned (Phase 2+)

See API.md for full spec. Will include:
- Products, Categories, Brands
- Inventory, Stock Movements, Counts
- Purchases, Suppliers
- Customers
- Sales, POS, Payments
- Returns, Refunds
- Quotations
- Finance, Expenses
- Employees, Attendance
- Payroll
- Reports, Dashboards
- Notifications

---

## 8. Authentication & RBAC

### JWT Token Strategy

| Token Type | Lifetime | Purpose | Storage |
|---|---|---|---|
| Access Token | 15 minutes | API requests | Memory / localStorage |
| Refresh Token | 30 days | Get new access token | localStorage / httpOnly cookie |

**Token Payload:**
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "organizationId": "org-id",
  "roleIds": ["role-admin"],
  "type": "access" | "refresh",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### RBAC Matrix

Four default roles:
- **Admin** — All 30+ permissions
- **Sub-admin** — Most operational permissions (configurable)
- **Staff** — Limited POS-related permissions
- **Accountant** — Finance/payroll/reporting

Permission naming: `resource.action` (e.g., `products.view`, `sales.cancel`)

### Authorization Layers

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1: Authentication (JwtAuthGuard)                 │
│  - Verify JWT signature                                  │
│  - Check token type (access vs refresh)                  │
│  - Load user + roles + permissions                       │
│  - Attach to request.user                                │
├──────────────────────────────────────────────────────────┤
│  Layer 2: Authorization (PermissionsGuard)               │
│  - Read @RequirePermissions metadata                     │
│  - Check user.permissions.includes(required)             │
│  - Throw 403 if missing                                  │
├──────────────────────────────────────────────────────────┤
│  Layer 3: Tenant Isolation                               │
│  - Always scope queries by organizationId                │
│  - Verify branch ownership                               │
│  - Never trust client-supplied tenant/branch IDs         │
├──────────────────────────────────────────────────────────┤
│  Layer 4: Resource Scope (in services)                   │
│  - Check user can access specific record                 │
│  - e.g., staff only sees own sales, not all              │
└──────────────────────────────────────────────────────────┘
```

### Seeded Admin User

```
Email:    admin@guptamobile.com
Password: Admin@123
Role:     Admin (all permissions)
```

---

## 9. Business Workflows

### 9.1 Sale Workflow

```
1. Staff opens shift              → Shift {status: OPEN, openingCash}
2. Scan/search SKU                → ProductVariant lookup
3. Server validates product       → Auth + permission check
4. Add to cart                    → Client-side state
5. Apply discount
   ├─ Below limit                 → Accept
   └─ Above limit                 → Create ApprovalRequest
6. Calculate subtotal/tax/total   → Server-side money logic
7. Submit sale                    → POST /sales
8. Transaction:
   ├─ Validate stock
   ├─ Create Sale
   ├─ Create SaleItem[]
   ├─ Create Payment[]
   ├─ Create StockMovement[] (SALE, qty<0)
   ├─ Update StockBalance
   ├─ Create LedgerEntry (revenue + COGS)
   └─ Create AuditLog
9. Generate invoice number
10. Return {sale, invoiceNumber}
11. Print/share invoice
12. Outbox → notifications, analytics
```

### 9.2 Purchase Receiving

```
1. Create purchase order          → Purchase {status: DRAFT}
2. Supplier delivers
3. Staff/manager receives
4. Verify quantity/serials
5. Create goods receipt
6. POST /purchases/:id/receive
7. Transaction:
   ├─ Create StockMovement[] (PURCHASE_RECEIPT, qty>0)
   ├─ Update StockBalance
   ├─ Update Purchase status (RECEIVED)
   ├─ Create LedgerEntry (inventory asset)
   └─ AuditLog
8. Update supplier payable
```

### 9.3 Customer Return

```
1. Find original invoice         → Sale lookup
2. Select returnable items       → Returnable = soldQty - alreadyReturned
3. Capture reason/condition
4. Approval if required
5. Create Return
6. Refund/exchange
7. For each item:
   ├─ If sellable: StockMovement CUSTOMER_RETURN (qty>0)
   └─ If defective: Move to damaged/quarantine
8. Financial reversal entry
9. Audit
```

### 9.4 Stock Adjustment

```
1. User requests adjustment
2. Select reason
3. Enter quantity (positive or negative)
4. System shows before/after stock
5. Approval if required
6. Create StockMovement (ADJUSTMENT)
7. Update StockBalance
8. Audit
```

### 9.5 Daily Cash Close

```
1. Staff opens shift with openingCash
2. Sales collected during shift
3. At close:
   ├─ Calculate expected cash (sum of cash sales + opening)
   ├─ Staff enters actual cash
   ├─ Difference = actual - expected
4. Submit close
5. Manager reviews exceptions
6. Close shift (status: CLOSED)
7. Create cash-close record
```

### 9.6 Quotation to Sale

```
DRAFT → SENT → ACCEPTED → CONVERTED
                              ↓
                         Create Sale
                         (reference quotation)
```

### 9.7 Payroll

```
1. Open payroll period
2. Import attendance/leave
3. Calculate per employee:
   ├─ base salary
   ├─ commission
   ├─ overtime
   ├─ advances
   └─ deductions
4. Review (PayrollStatus: REVIEW)
5. Approve
6. Finalize/lock (PayrollStatus: FINALIZED)
   └─ Period is now immutable
7. Record payroll ledger entries
8. Generate payslips
```

### 9.8 Employee Offboarding

```
1. Deactivate user account
2. Revoke active sessions (rotate JWT secret for user)
3. Preserve history:
   ├─ Sales
   ├─ Attendance
   ├─ Payroll
   └─ Audit
4. Mark Employee.status = INACTIVE
```

### 9.9 Dead Stock Detection (Nightly)

```
1. Cron: nightly at 02:00
2. Query variants with no sales in configured period
3. Calculate quantity × cost
4. Notify manager
5. Surface clearance recommendations
```

---

## 10. CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

```yaml
Triggers: push to main/develop, pull_request

Jobs (run in parallel where possible):
┌────────────────────────────────────────────┐
│ 1. lint-and-type-check                     │
│    - ESLint                                │
│    - TypeScript type check                 │
│    - pnpm install --frozen-lockfile        │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ 2. build-api                               │
│    - Prisma generate                       │
│    - nest build                            │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ 3. build-admin                             │
│    - next build                            │
└────────────────────────────────────────────┘
┌────────────────────────────────────────────┐
│ 4. test                                    │
│    - PostgreSQL 15 service                 │
│    - prisma migrate deploy                 │
│    - jest                                  │
└────────────────────────────────────────────┘
```

### Local Development Pipeline

```
Developer edits code
        │
        ▼
Pre-commit hook (planned)
├─ prettier --write
├─ eslint --fix
└─ type-check
        │
        ▼
git commit
        │
        ▼
git push
        │
        ▼
GitHub Actions CI
├─ Lint + type check
├─ Build API
├─ Build Admin
└─ Unit tests
        │
        ▼
PR merge to main
        │
        ▼
Deploy (planned: GitHub Actions → Docker → Cloud Run/EC2)
```

### Local Development Commands

```bash
# Start local stack (Postgres + Redis)
docker compose up -d

# Install dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed data
pnpm db:seed

# Start API (dev mode)
pnpm dev:api        # http://localhost:3000

# Start Admin (dev mode)
pnpm dev:admin      # http://localhost:3001

# Run tests
pnpm test

# Type check
pnpm type-check
```

---

## 11. Deployment Architecture

### Environments

| Environment | URL | Database | Purpose |
|---|---|---|---|
| Local | `localhost:3000` (api) / `localhost:3001` (admin) | PostgreSQL in Docker | Development |
| Staging | `staging-api.guptamobile.com` | Managed PostgreSQL (smaller) | QA, demos |
| Production | `api.guptamobile.com` | Managed PostgreSQL (HA, backups) | Live business |

### Production Stack (Planned)

```
┌─────────────────────────────────────────────────────┐
│  Cloud Provider (AWS/GCP/DigitalOcean)              │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐              │
│  │  Load        │───►│  NestJS      │              │
│  │  Balancer    │    │  (2+ nodes)  │              │
│  │  (TLS)       │    │              │              │
│  └──────────────┘    └──────┬───────┘              │
│                             │                      │
│                             ▼                      │
│                      ┌──────────────┐              │
│                      │ Managed      │              │
│                      │ PostgreSQL   │              │
│                      │ (HA, daily   │              │
│                      │  backups)    │              │
│                      └──────────────┘              │
│                                                     │
│  ┌──────────────┐    ┌──────────────┐              │
│  │  Next.js     │    │  Redis       │              │
│  │  (Vercel or  │    │  (Upstash/   │              │
│  │   container) │    │   ElastiCache)│             │
│  └──────────────┘    └──────────────┘              │
│                                                     │
│  ┌──────────────┐                                   │
│  │  S3-Compatible│   Invoices, receipts, backups   │
│  │  Object Store│                                   │
│  └──────────────┘                                   │
└─────────────────────────────────────────────────────┘
```

### Backup & Recovery (Planned)

- **Database**: Daily automated backups, 30-day retention
- **Point-in-time recovery**: Enabled
- **Object storage**: Versioned, cross-region replication
- **DR drill**: Quarterly restore-from-backup test

---

## 12. Security Architecture

### Defense in Depth

```
┌────────────────────────────────────────────────────┐
│  1. Network Layer                                  │
│     - TLS 1.2+ enforced                            │
│     - HTTP → HTTPS redirect                        │
│     - Firewall rules (only 80/443 public)          │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│  2. Application Layer                              │
│     - Helmet (security headers)                    │
│     - CORS whitelist (admin, mobile origins)       │
│     - Rate limiting (planned: 100 req/min/user)    │
│     - CSRF protection (planned)                    │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│  3. Authentication Layer                           │
│     - bcrypt password hashing (10 rounds)          │
│     - JWT with short-lived access tokens           │
│     - Refresh token rotation                       │
│     - No secrets in source code (env vars only)    │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│  4. Authorization Layer                            │
│     - RBAC permissions checked server-side          │
│     - Tenant isolation (organizationId)            │
│     - Branch isolation (branchId)                  │
│     - Resource-level scoping (own vs all)          │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│  5. Data Layer                                     │
│     - SQL injection prevention (Prisma ORM)        │
│     - Database constraints (unique, foreign keys)  │
│     - Encryption at rest (managed DB)              │
│     - Encryption in transit (TLS)                  │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│  6. Audit Layer                                    │
│     - All privileged mutations logged              │
│     - Append-only AuditLog (no updates/deletes)    │
│     - Actor, action, entity, before/after recorded │
│     - PII redaction in logs                        │
└────────────────────────────────────────────────────┘
```

### Secret Management

- `.env.example` documents all required variables
- `.env` is gitignored
- Production: Use managed secret manager (AWS Secrets Manager, GCP Secret Manager)
- JWT secrets: minimum 32 characters
- Never log secrets, never echo in error responses

---

## 13. Money & Inventory Invariants

### Money Invariants (Rule 12, 13)

```
┌────────────────────────────────────────────────────┐
│  Rule: Never use JavaScript floating-point         │
│        arithmetic for money.                       │
└────────────────────────────────────────────────────┘

Storage:        PostgreSQL Decimal(12,2)
Wire format:    JSON number (e.g., 799.00)
In business:    Integer minor units (₹799.00 = 79900 paise)
Operations:     packages/utils/money.ts (Math.round, no float math)
```

**Money utility functions:**
- `formatMoney(value)` — Format with 2 decimal places
- `toMinorUnits(value)` — Convert to integer minor units
- `addMoney(a, b)` — Add two minor-unit values
- `subtractMoney(a, b)` — Subtract
- `multiplyMoney(value, multiplier)` — Multiply (for tax, discount)
- `calculateTax(subtotal, taxRate)` — Tax calculation
- `calculateDiscount(subtotal, discountPercent)` — Discount calculation

### Inventory Invariants (Rule 5)

```
┌────────────────────────────────────────────────────┐
│  Rule: Inventory is ledger-driven.                 │
│        Never rely only on product.stock--          │
└────────────────────────────────────────────────────┘

Source of truth: StockMovement (append-only)
Cache:           StockBalance (updated transactionally)
Invariant:       SUM(StockMovement.qty WHERE type IN
                  ('PURCHASE','CUSTOMER_RETURN','FOUND')
                  AND branchId = X AND variantId = Y)
                  -
                  SUM(StockMovement.qty WHERE type IN
                  ('SALE','SUPPLIER_RETURN','DAMAGE','LOSS')
                  AND branchId = X AND variantId = Y)
                  =
                  StockBalance.quantity
```

**Stock Movement Types:**
```
PURCHASE_RECEIPT   (+qty)   Incoming from supplier
SALE               (-qty)   Sold to customer
CUSTOMER_RETURN    (+qty)   Returned by customer (sellable)
SUPPLIER_RETURN    (-qty)   Returned to supplier
DAMAGE             (-qty)   Damaged goods (not sellable)
LOSS               (-qty)   Lost/stolen
FOUND              (+qty)   Found during stock count
ADJUSTMENT         (±qty)   Manual adjustment with reason
TRANSFER_IN        (+qty)   From another branch
TRANSFER_OUT       (-qty)   To another branch
COUNT_CORRECTION   (±qty)   After physical stock count
```

### Critical Business Invariants (from CLAUDE.md)

| # | Invariant | Enforcement |
|---|---|---|
| 1 | Cannot sell more than available sellable stock | Service checks `StockBalance.quantity` before sale |
| 2 | Completed sale has exactly one stock deduction per item | Single transaction per sale |
| 3 | Cancelled sale reverses inventory/financial effects exactly once | Status workflow: only PENDING cancellation allowed once |
| 4 | Return cannot exceed returnable quantity | Service computes returnable = sold - alreadyReturned |
| 5 | Payment cannot exceed outstanding amount | Service validates before persisting |
| 6 | Historical records immutable except via documented reversal | No DELETE on financial tables; only UPDATE status |
| 7 | Every stock adjustment requires reason | Service validates `reason` field |
| 8 | Discounts above role's limit require approval | ApprovalRequest workflow |
| 9 | Payroll periods locked after finalization | Status check before any update |
| 10 | Audit records are append-only | No UPDATE/DELETE on AuditLog (DB-level trigger planned) |

---

## 14. Implementation Progress

### Phase 0: Foundation ✅ COMPLETE
- Monorepo with pnpm workspaces
- Docker Compose (PostgreSQL + Redis)
- Prisma schema (26 models)
- NestJS skeleton with health endpoint
- Next.js admin with login UI
- Flutter app skeleton
- Environment config (Zod validation)
- Structured logging (Pino)
- CI pipeline (GitHub Actions)
- Seed data script
- Base UI components
- Money utility

### Phase 1: Auth + RBAC ✅ COMPLETE
- Auth module: login, register, refresh, logout, /me, password reset
- RBAC module: roles, permissions, user-role assignment
- Audit module: log, query, entity history, actor activity
- Users module: CRUD, deactivate/activate, change password
- Admin login UI
- Unit tests (auth, rbac)
- Permission guards (`@RequirePermissions`)
- JWT with access/refresh rotation

### Phase 2: Catalog (NEXT)
- Categories, Brands CRUD
- Products, Variants CRUD
- SKU/Barcode management
- Pricing, Tax, HSN
- Stock thresholds
- Serial/Batch tracking metadata

### Phase 3-12: Per IMPLEMENTATION_ROADMAP.md
- Inventory ledger
- Purchase receiving
- POS
- Returns
- Customers/Suppliers
- Quotations
- Finance
- Employees/Payroll
- Reporting/Notifications
- Hardening (E2E tests, performance, security review)
- Multi-branch, Offline-first, AI insights (Growth phase)

---

## Quick Reference: Architecture Decision Records (ADRs)

| Decision | Rationale |
|---|---|
| **Modular Monolith** (not microservices) | Simpler deployment, easier to refactor, no premature complexity. Can split later if needed. |
| **PostgreSQL Decimal for money** | Industry standard; no float errors; DB-level precision |
| **Prisma ORM** | Type safety, migration tool, good DX, well-supported |
| **JWT with refresh rotation** | Stateless auth, scales horizontally, no session DB lookup per request |
| **StockMovement as source-of-truth** | Full audit trail; balance is a fast cache; supports time-travel queries |
| **Append-only AuditLog** | Compliance, forensics, immutability by design |
| **Append-only OutboxEvent** | Reliable async event delivery; no lost notifications |
| **Zod for validation** | Single source of truth for type + runtime validation |
| **Pino for logging** | Fast, structured, JSON in prod, pretty in dev |
| **pnpm workspaces** | Faster installs, better monorepo DX than npm/yarn |

---

## Summary

This is a **production-grade foundation** for a multi-tenant retail management system. The architecture prioritizes:
1. **Correctness** over speed of development
2. **Auditability** for financial/inventory records
3. **Multi-tenancy** from day one
4. **Server-side authorization** (never trust client)
5. **Type safety** end-to-end (TypeScript + Prisma + Zod)
6. **Testability** (services are unit-testable, DB calls wrapped)
7. **Observability** (structured logs, audit events, outbox events)

The system is ready for **Phase 2 implementation** (Catalog/Products module) which will be the first complete vertical slice:
- Admin creates product → Manager receives stock → Staff scans → Sells → Stock decreases → Invoice → Audit log
