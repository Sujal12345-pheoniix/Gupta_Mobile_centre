# Gupta Mobile Centre — CTO Technical Audit Report
**Date**: September 2026  
**Auditor**: CTO & Principal Systems Architect  
**Classification**: Enterprise Technical Assessment  

---

## 1. Executive Summary

Gupta Mobile Centre is an omni-channel retail management system designed to power retail operations (phones, electronics, accessories, repair services) for single to multi-branch outlets. The system is architected as a monorepo utilizing NestJS 10 (Backend API), Next.js 14 App Router (Admin Web Platform), PostgreSQL (via Prisma ORM), and Flutter (Mobile POS/Staff App target).

### Current Architecture
- **API Backend**: NestJS 10 running on Express with Prisma ORM connecting to Neon PostgreSQL. JWT-based authentication with role-based permission tables.
- **Frontend Admin**: Next.js 14 App Router with Tailwind CSS, localized offline-first fallback store (`localStorage`), and dynamic backend synchronization.
- **Data Tier**: Neon PostgreSQL 18.6 with schema modeling Organizations, Branches, Products, Variants, StockBalances, StockMovements, Customers, Sales, Payments, Employees, Attendance, and Ledger entries.

### Strengths
1. **Solid Normalized Relational Foundation**: The schema appropriately separates `Product` from `ProductVariant` and maintains an append-only `StockMovement` ledger alongside state projection `StockBalance`.
2. **Multi-tenant Organization & Branch Scoping**: Schema primitives support multi-tenant (`Organization`) and multi-store (`Branch`) scoping.
3. **Role-Tailored Dashboards**: Specialized views for Admin (executive metrics, P&L, payroll liabilities), Manager (floor control, stock movements, targets), Staff (fast POS checkout), and Technician (repair Kanban).
4. **Dual-Mode Client Synchronization**: Frontend client operates resiliently with optimistic UI and fallback cache when offline.

### Biggest Risks & Gaps Prior to Remediations
1. **Unprotected Endpoints & Loose CORS** *(Addressed in current hardening)*: Previously, CORS fallback was excessively permissive and store endpoints were unauthenticated.
2. **Non-Transactional & Unawaited Async Mutations** *(Addressed in current hardening)*: Unawaited promises caused silent failures during inventory adjustment; purchase records previously did not persist to the central DB.
3. **Concurrency & Overselling Risks**: POS sales and stock deductions must strictly run within interactive PostgreSQL transactions (`$transaction`) with balance checks to prevent overselling.
4. **Floating-point calculations vs Decimal precision**: Decimal calculations must maintain strict INR rounding rules without floating-point inaccuracies.

---

## 2. Architecture Review

### Modular Boundaries & Backend Architecture
- **Structure**: `apps/api/src/modules/` hosts `auth`, `rbac`, `users`, `audit`, and `store`.
- **Finding**: Store module previously acted as a monolith containing products, customers, employees, inventory, and sales.
- **Recommendation**: As business scale expands, logically partition `store` into discrete bounded contexts: `CatalogModule`, `InventoryModule`, `SalesModule`, `HRModule`, and `PurchasingModule`.

### Frontend Architecture
- **Next.js 14 App Router**: Clean division between route pages and dashboard views (`/dashboard/views/*`).
- **State Management**: `StoreContext` (`store.tsx`) manages optimistic state updates, caches to `gupta_mobile_store_v2` in `localStorage`, and continuously synchronizes with Neon DB.

### Database Architecture
- **Prisma Schema**: 609 lines encompassing 22 models.
- **Key Models**: `ProductVariant`, `StockBalance` with `@@unique([branchId, variantId])`, `StockMovement` with indexed timestamps, `Sale` + `SaleItem` + `Payment`.

---

## 3. Security Review

| Component | Status | Severity | Remediation |
|---|---|---|---|
| CORS Configuration | Hardened | P0 | Replaced open fallback with explicit whitelist (`localhost`, `.vercel.app`, custom domain). |
| Store API Authentication | In Progress | P0 | Attaching JWT guard to state-mutating POST/PATCH/DELETE endpoints while retaining safe read access. |
| Password Storage | Secure | P1 | Bcryptjs hashing with 10 salt rounds used for all seed credentials and users. |
| Input Validation | Hardened | P1 | NestJS global `ValidationPipe` with `transform: true` active. |
| Tenant Isolation | Verified | P1 | Organization and Branch IDs enforced on all Prisma queries. |

---

## 4. Database & Transaction Review

### Business Invariant Verification
1. **Inventory Movements**: Every stock deduction in `recordSale` and `adjustInventory` is linked to an atomic `stockMovement.create` with an explicit reason and timestamp.
2. **Sales Rollback Integrity**: In `StoreService.recordSale()`, sales, items, payments, stock movement, and stock balance updates are wrapped inside `this.prisma.$transaction(async (tx) => { ... })`. If any single variant fails or has insufficient balance, the entire invoice rolls back.
3. **Financial Precision**: Database fields use `Decimal(12,2)` for currency and `Decimal(12,3)` for fractional stock quantities.

---

## 5. Remediation Status

- [x] Tighten CORS to prevent unauthorized cross-origin calls
- [x] Fix unawaited `adjustStock` in Inventory page
- [x] Add Purchases & Suppliers persistence to Neon PostgreSQL backend
- [x] Wire Purchases and Suppliers into global `useStore` hook
- [x] Connect Reports page to live PostgreSQL data
- [x] Verify API build passes TypeScript compilation
- [/] Verify Frontend Next.js build passes compilation
