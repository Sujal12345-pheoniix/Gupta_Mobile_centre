# Implementation Roadmap

## Phase 0 — Foundation
Deliver:
- monorepo
- Docker dev environment
- PostgreSQL
- Prisma
- NestJS API
- Next.js admin
- Flutter app
- environment configuration
- logging
- CI
- migrations
- seed data
- base UI system

Acceptance:
- local stack starts with one command
- CI passes
- health endpoints work

## Phase 1 — Auth + RBAC
- login/logout
- sessions
- roles/permissions
- tenant/branch context
- admin creates staff
- authorization guards
- audit events

## Phase 2 — Catalog
- category/brand
- product/variant
- SKU/barcode
- pricing
- stock thresholds
- serial/batch tracking metadata

## Phase 3 — Inventory
- stock ledger
- balance
- purchase receiving
- adjustments
- low-stock
- dead-stock
- stock count

## Phase 4 — POS
- staff POS
- barcode scan
- cart
- discount limits
- payments
- split payment
- invoice
- atomic stock deduction
- daily shift

## Phase 5 — Returns + Customers
- customers
- sale history
- returns
- refunds
- exchanges
- warranty

## Phase 6 — Suppliers + Quotations
- suppliers
- purchase orders
- supplier payments
- quotations
- quotation conversion

## Phase 7 — Finance
- expenses
- revenue
- COGS
- gross profit
- operating profit
- receivables/payables
- daily cash closure
- exports

## Phase 8 — Employees + Payroll
- attendance
- leave
- salary
- commission
- advances
- payroll runs
- approvals
- payslips

## Phase 9 — Reporting + Notifications
- dashboards
- reports
- alerts
- in-app notifications
- email
- WhatsApp integration interface

## Phase 10 — Hardening
- E2E tests
- performance
- security review
- backup/restore drill
- observability
- production deployment
- disaster recovery runbook

## Phase 11 — Growth
- multi-branch
- offline-first enhancements
- advanced stock forecasting
- AI insights
- SaaS tenant onboarding
- subscription/billing

## First vertical slice
Build this before anything else:
Admin creates product -> manager receives 10 units -> staff logs in -> scans product -> sells 1 -> payment recorded -> stock becomes 9 -> invoice generated -> audit log exists -> owner dashboard shows sale.
