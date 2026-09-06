# Architecture Decision Records (ADR)

This document captures key architectural decisions made during the design and implementation of Gupta Mobile Centre.

---

## ADR-001: Modular Monolith over Microservices

**Status:** Accepted

**Context:**
We need to choose an architecture pattern for the backend. Options:
- Microservices
- Modular Monolith
- Single-tier monolith

**Decision:** Modular Monolith

**Rationale:**
- **Simpler deployment** — one process, one DB transaction boundary
- **Easier to refactor** — module boundaries can evolve as we learn the domain
- **No premature complexity** — microservices add network latency, distributed transactions, deployment overhead
- **Can split later** — well-designed modules can be extracted into services when scale demands it
- **Single team** — currently small team; microservices are an organizational pattern as much as a technical one

**Consequences:**
- All modules share a single PostgreSQL instance
- Single deployable unit
- Cross-module calls are in-process (fast)
- Need disciplined module boundaries to avoid spaghetti code

---

## ADR-002: PostgreSQL Decimal for Money

**Status:** Accepted

**Context:**
Money values cannot use JavaScript floating-point arithmetic (rule 12). Options:
- BigInt (integer minor units)
- Decimal library (e.g., decimal.js)
- PostgreSQL Decimal type
- String-based representation

**Decision:** PostgreSQL `Decimal(12,2)` for persistence; integer minor units in business logic

**Rationale:**
- **Database-level precision** — no rounding errors from float conversion
- **Industry standard** — financial systems use Decimal
- **Queryable** — can do arithmetic in SQL with exact results
- **Wire format** — JSON number (e.g., 799.00) is human-readable
- **Business logic** — integer minor units (₹799.00 = 79900 paise) avoids any float math

**Consequences:**
- All money fields in Prisma: `Decimal @db.Decimal(12,2)`
- TypeScript utility functions (`packages/utils/money.ts`) for safe operations
- Validation at API boundary ensures values are correctly typed

---

## ADR-003: StockMovement as Source-of-Truth Inventory

**Status:** Accepted

**Context:**
How to track inventory? Options:
- Counter on Product (simple but loses history)
- Per-branch stock counter
- Movement ledger (double-entry style)

**Decision:** StockMovement (append-only ledger) + StockBalance (cache)

**Rationale:**
- **Full audit trail** — can answer "what happened to inventory on date X?"
- **Supports time-travel** — can compute stock at any past moment
- **Multi-branch transfers** — TRANSFER_IN/OUT ledger entries are natural
- **Discrepancy detection** — compare cache to sum of movements
- **Compliance** — auditors can see the full inventory history
- **Cache for speed** — StockBalance is fast to read; computed in transaction

**Consequences:**
- More complex schema (two tables instead of one counter)
- Service must atomically update both StockMovement and StockBalance
- Periodically validate cache vs ledger (nightly job)

---

## ADR-004: JWT with Refresh Token Rotation

**Status:** Accepted

**Context:**
Authentication strategy. Options:
- Session-based (server-side session table)
- JWT (stateless)
- JWT with refresh token

**Decision:** JWT (15-min access token) + Refresh token (30-day) with rotation

**Rationale:**
- **Stateless API** — no DB lookup per request
- **Short-lived access token** — limits damage if leaked
- **Long-lived refresh** — user doesn't have to log in every 15 minutes
- **Refresh rotation** — every refresh issues a new refresh token; old one invalidated
- **Scalable** — works across multiple API nodes

**Consequences:**
- Logout is client-side (clear tokens); no server-side revocation
- Compromised access token is valid for up to 15 minutes
- Need to handle token expiry gracefully on client (auto-refresh)

---

## ADR-005: Append-Only Audit Log

**Status:** Accepted

**Context:**
How to record privileged actions for compliance? Options:
- Update timestamps on records
- Separate audit table (mutable)
- Separate audit table (append-only)

**Decision:** Separate AuditLog table, append-only

**Rationale:**
- **Immutability** — cannot be tampered with by the application
- **Compliance** — required for many financial regulations
- **Forensics** — can see full history including deletions/changes
- **Performance** — write-once, no row-level locks
- **Forensic queries** — entity history, actor activity, time-range queries

**Consequences:**
- AuditLog table grows unbounded (need retention policy in production)
- Database-level trigger to enforce append-only (planned)
- Slight overhead per mutation (one extra INSERT)

---

## ADR-006: Outbox Pattern for Async Events

**Status:** Accepted

**Context:**
How to reliably emit events for notifications, analytics, etc.? Options:
- Direct call to message queue (e.g., Redis pub/sub)
- Outbox pattern (DB table + worker)
- Event sourcing

**Decision:** Outbox pattern (OutboxEvent table + worker)

**Rationale:**
- **Transactional consistency** — event is written in same DB transaction as business state
- **No lost events** — even if API crashes after DB commit, event is persisted
- **At-least-once delivery** — worker retries until processed
- **Simpler than event sourcing** — don't need to rebuild state from events
- **Decoupled** — workers can be added/replaced without changing API

**Consequences:**
- Slight delay (5-second polling) before notifications sent
- Worker must be idempotent (handle duplicate events)
- Outbox table grows; needs cleanup job

---

## ADR-007: Prisma ORM

**Status:** Accepted

**Context:**
Database access layer. Options:
- Raw SQL with pg library
- Query builder (Knex)
- ORM (Prisma, TypeORM, Sequelize)
- Drizzle

**Decision:** Prisma

**Rationale:**
- **Type safety** — generated TypeScript types from schema
- **Migration tool** — first-class migration support
- **DX** — autocomplete, no string-typed queries
- **Multi-database** — supports PostgreSQL, MySQL, SQLite
- **Transactions** — `prisma.$transaction()` for atomic operations
- **Performance** — good query plan generation

**Consequences:**
- Generated client adds build step
- Complex queries can be cumbersome (sometimes need `prisma.$queryRaw`)
- Schema is single source of truth

---

## ADR-008: Zod for Runtime Validation

**Status:** Accepted

**Context:**
Input validation at API boundary. Options:
- class-validator (decorator-based)
- Zod (schema-first)
- Yup
- Joi

**Decision:** Zod

**Rationale:**
- **Single source of truth** — schema generates both validator and TypeScript type
- **Composable** — schemas can be merged, extended
- **No decorator magic** — schemas are plain data
- **Good error messages** — detailed validation errors
- **Inference** — `z.infer<typeof Schema>` gives you the type

**Consequences:**
- Each DTO is a Zod schema + inferred type
- Validation pipe runs schemas automatically
- Slightly different from NestJS's built-in class-validator approach

---

## ADR-009: Pino for Structured Logging

**Status:** Accepted

**Context:**
Logging library. Options:
- Winston
- Pino
- Bunyan
- Built-in console

**Decision:** Pino

**Rationale:**
- **Fast** — one of the fastest Node.js loggers
- **Structured JSON** — easy to parse in log aggregators
- **Child loggers** — can scope by module/user/request
- **Pretty printing in dev** — pino-pretty makes it readable
- **Low overhead** — production-safe at high volume

**Consequences:**
- JSON logs in production require a log aggregator (planned: ELK, Loki)
- Slight learning curve for new developers

---

## ADR-010: Multi-Tenant from Day One

**Status:** Accepted

**Context:**
Should we build multi-tenancy now or add later? Options:
- Single-tenant first, migrate later
- Multi-tenant from day one

**Decision:** Multi-tenant from day one (organizationId on all business tables)

**Rationale:**
- **Schema already supports it** — easier to add than migrate
- **PRD requires it** — "Future multi-branch / SaaS support"
- **Cheap now, expensive later** — retrofitting tenant isolation is a major refactor
- **Discipline** — forces every query to think about tenant scope
- **Branch scope** — branchId on relevant tables

**Consequences:**
- All queries must include `organizationId` filter
- Slight overhead for single-tenant scenarios
- Cannot have a "global admin" without explicit special handling
- Need to verify JWT token's organizationId matches request's organizationId (in services)

---

## ADR-011: Server-Side Authorization Only

**Status:** Accepted (per CLAUDE.md rule 8, 9)

**Context:**
Where to enforce permissions? Options:
- Client-side only (UI hiding)
- Server-side only
- Both (defense in depth)

**Decision:** Server-side only; client-side hiding is UX only

**Rationale:**
- **Single source of truth** — server is authoritative
- **Cannot be bypassed** — even with browser dev tools, permissions are enforced
- **RBAC matrix** — permissions checked at every endpoint
- **Defense in depth** — UI hiding is still done (better UX) but not security
- **Multi-tenant safety** — never trust client-supplied IDs

**Consequences:**
- All endpoints use `@RequirePermissions()` decorator
- PermissionsGuard runs after JwtAuthGuard
- Service methods also check tenant scope (defense in depth)

---

## ADR-012: Soft Delete (Status Fields) over Hard Delete

**Status:** Accepted (per CLAUDE.md rule 4)

**Context:**
How to "delete" financial/inventory/audit records? Options:
- Hard delete (DELETE FROM)
- Soft delete (status='ARCHIVED' or 'INACTIVE')
- Reversal/cancellation workflow

**Decision:** Soft delete via status fields; financial/inventory/audit records are append-only

**Rationale:**
- **Compliance** — many regulations require retention
- **Audit** — full history of what existed
- **Reversibility** — can recover from mistakes
- **Referential integrity** — foreign keys still work
- **Reporting** — historical reports can include deleted records

**Consequences:**
- All financial tables have a `status` enum
- Queries often filter by `status NOT IN ('CANCELLED', 'DELETED')`
- Periodic archive to cold storage (planned)

---

## ADR-013: Money Never Floats

**Status:** Accepted (per CLAUDE.md rule 12)

**Context:**
Money arithmetic in JavaScript. Options:
- Native number (IEEE 754 float)
- BigInt (integer math)
- Decimal library
- Integer minor units

**Decision:** Integer minor units in business logic; Decimal in DB

**Rationale:**
- **No precision loss** — integer math is exact
- **No rounding surprises** — explicit rounding where needed
- **Performance** — integer math is fastest
- **Type safety** — TypeScript can enforce integer types

**Consequences:**
- All money variables in business logic: `number` representing minor units
- `packages/utils/money.ts` provides safe operations
- Formatted output (e.g., ₹799.00) only at the display layer

---

## ADR-014: Append-Only Migrations

**Status:** Accepted

**Context:**
How to evolve the database schema? Options:
- Mutable migrations (can edit past migrations)
- Immutable migrations (only add new ones)

**Decision:** Immutable migrations

**Rationale:**
- **Reproducibility** — same migration history → same DB state
- **Audit** — schema changes are tracked in git
- **Collaboration** — no merge conflicts on shared migrations
- **Recovery** — can roll forward to any migration

**Consequences:**
- `prisma migrate dev` creates a new migration file
- Never edit a migration after it's committed
- For destructive changes, create a new migration that performs the change

---

## ADR-015: Continuous Validation

**Status:** Accepted

**Context:**
When to validate input? Options:
- Only at API boundary
- At every layer

**Decision:** At API boundary (Zod); defensive checks in services

**Rationale:**
- **Single point of validation** — easy to audit
- **Fast failure** — invalid input rejected immediately
- **Service trust** — services can assume valid input from API
- **Defense in depth** — services re-check critical invariants (e.g., stock availability)

**Consequences:**
- Each DTO has a Zod schema
- ValidationPipe runs on every request
- Services have additional business invariant checks

---

## Future Decisions to Make

- **ADR-016:** Cache strategy (Redis for hot data?)
- **ADR-017:** Background job processing (BullMQ vs custom worker)
- **ADR-018:** Real-time updates (WebSockets vs SSE vs polling)
- **ADR-019:** File storage strategy (local vs S3)
- **ADR-020:** Email/WhatsApp notification provider
- **ADR-021:** Reporting database (read replica vs materialized views)
- **ADR-022:** Backup and disaster recovery procedure
