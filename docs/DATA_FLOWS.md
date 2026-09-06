# Data Flow Diagrams

## Table of Contents
1. [System Context](#1-system-context)
2. [Authentication Flow](#2-authentication-flow)
3. [Sale Transaction Flow](#3-sale-transaction-flow)
4. [Purchase Receiving Flow](#4-purchase-receiving-flow)
5. [Return Processing Flow](#5-return-processing-flow)
6. [Inventory Movement Flow](#6-inventory-movement-flow)
7. [Audit Event Flow](#7-audit-event-flow)
8. [Outbox Event Flow](#8-outbox-event-flow)

---

## 1. System Context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     External Actors                                      │
│                                                                          │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│   │   Admin    │  │   Staff     │  │  Supplier   │  │  Customer   │ │
│   │  (Owner)   │  │   (POS)     │  │  (Vendor)   │  │   (Buyer)   │ │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘ │
└──────────┼───────────────┼───────────────┼───────────────┼──────────┘
           │               │               │               │
           ▼               ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     GUPTA MOBILE CENTRE SYSTEM                          │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     CLIENT APPLICATIONS                            │   │
│  │   ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐  │   │
│  │   │  Next.js Admin   │  │  Flutter Staff   │  │  Future:   │  │   │
│  │   │    (Web)         │  │    (Mobile)      │  │  Owner App │  │   │
│  │   └────────┬─────────┘  └────────┬─────────┘  └────────────┘  │   │
│  └────────────┼──────────────────────┼──────────────────────────────┘   │
│               │   HTTPS / REST API  │                                    │
│               ▼                      ▼                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    NESTJS API GATEWAY                            │   │
│  │                                                                  │   │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │   │
│  │   │  Auth    │  │  RBAC    │  │  Health  │  │  Audit   │      │   │
│  │   │ Module  │  │ Module   │  │ Module   │  │ Module   │      │   │
│  │   └────┬─────┘  └────┬─────┘  └──────────┘  └────┬─────┘      │   │
│  │        │             │                            │              │   │
│  │   ┌────┴─────────────┴────────────────────────────┴────┐        │   │
│  │   │           CROSS-CUTTING MIDDLEWARE                  │        │   │
│  │   │  Helmet │ CORS │ Pino Logger │ Validation │ Error   │        │   │
│  │   └───────────────────────────────────────────────────┘        │   │
│  │                               │                                │   │
│  │   ┌───────────┬───────────┬──┴───┬───────────┬──────────┐   │   │
│  │   ▼           ▼           ▼      ▼           ▼          ▼   │   │
│  │  ┌────────┐ ┌────────┐ ┌────┐ ┌───────┐ ┌────────┐ ┌───┐ │   │
│  │  │Products│ │Inventory│ │Sales│ │Returns│ │Finance│ │HR │ │   │
│  │  └────────┘ └────────┘ └────┘ └───────┘ └────────┘ └───┘ │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                               │                                           │
│                               ▼                                           │
│  ┌───────────────────┐              ┌───────────────────┐               │
│  │   PostgreSQL 15   │              │    Redis 7        │               │
│  │                   │              │                   │               │
│  │  • Organizations │              │  • Session cache  │               │
│  │  • Products      │              │  • Rate limiting  │               │
│  │  • Inventory     │              │  • Job queues    │               │
│  │  • Sales         │              │                   │               │
│  │  • Finance       │              └───────────────────┘               │
│  │  • HR            │                                                 │
│  │  • Audit logs   │              ┌───────────────────┐               │
│  │  • Outbox       │              │  S3-Compatible   │               │
│  └───────────────────┘              │                   │               │
│                                    │  • Invoices      │               │
│                                    │  • Receipts      │               │
│                                    │  • Backups       │               │
│                                    └───────────────────┘               │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Flow

### 2.1 Login Sequence

```
┌─────────┐         ┌─────────┐         ┌─────────┐         ┌─────────┐
│  Staff  │         │ Flutter │         │   API   │         │   DB    │
│         │         │   App   │         │         │         │         │
└────┬────┘         └────┬────┘         └────┬────┘         └────┬────┘
     │                    │                    │                    │
     │ 1. Enter email + password              │                    │
     │──────────────────►│                    │                    │
     │                    │                    │                    │
     │                    │ 2. POST /auth/login                   │
     │                    │ {email, password}  │                    │
     │                    │──────────────────►│                    │
     │                    │                    │                    │
     │                    │                    │ 3. SELECT user    │
     │                    │                    │ WHERE email = ?   │
     │                    │                    │──────────────────►│
     │                    │                    │                    │
     │                    │                    │ ◄─────────────────│
     │                    │                    │ 4. user record     │
     │                    │                    │                    │
     │                    │                    │ 5. bcrypt.compare │
     │                    │                    │    password        │
     │                    │                    │                    │
     │                    │                    │ 6. JWT.sign()      │
     │                    │                    │    access token    │
     │                    │                    │    (15 min)       │
     │                    │                    │                    │
     │                    │                    │ 7. JWT.sign()      │
     │                    │                    │    refresh token   │
     │                    │                    │    (30 days)      │
     │                    │                    │                    │
     │                    │                    │ 8. UPDATE         │
     │                    │                    │    lastLoginAt    │
     │                    │                    │──────────────────►│
     │                    │                    │                    │
     │                    │ ◄───────────────────────────────────│
     │                    │ 9. {accessToken, refreshToken, user} │
     │                    │                    │                    │
     │ 10. Store tokens  │                    │                    │
     │    in localStorage│                    │                    │
     │ ◄─────────────────│                    │                    │
     │                    │                    │                    │
     │ 11. Redirect to   │                    │                    │
     │    Dashboard      │                    │                    │
```

### 2.2 Authenticated Request Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  Staff  │         │   API   │         │   DB    │
│         │         │         │         │         │
└────┬────┘         └────┬────┘         └────┬────┘
     │                    │                    │
     │ 1. GET /sales     │                    │
     │ Authorization:     │                    │
     │ Bearer <token>    │                    │
     │──────────────────►│                    │
     │                    │                    │
     │                    │ 2. JwtAuthGuard    │
     │                    │    .canActivate()  │
     │                    │                    │
     │                    │ 3. JWT.verify()   │
     │                    │    Check exp, sig  │
     │                    │                    │
     │                    │ 4. SELECT user    │
     │                    │    + roles        │
     │                    │    + permissions  │
     │                    │──────────────────►│
     │                    │                    │
     │                    │ ◄─────────────────│
     │                    │                    │
     │                    │ 5. PermissionsGuard│
     │                    │    @RequirePerms  │
     │                    │    (sales.view_all│
     │                    │     or sales.view │
     │                    │     _own)          │
     │                    │                    │
     │                    │ 6. Execute        │
     │                    │    handler         │
     │                    │                    │
     │ ◄───────────────────────────────────│
     │ 7. {sales: [...]}                   │
```

### 2.3 Token Refresh Flow

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│  Staff  │         │   API   │         │   DB    │
│         │         │         │         │         │
└────┬────┘         └────┬────┘         └────┬────┘
     │                    │                    │
     │ Access token       │                    │
     │ expired (401)     │                    │
     │◄───────────────────│                    │
     │                    │                    │
     │ 1. POST /auth/refresh                  │
     │ {refreshToken}    │                    │
     │──────────────────►│                    │
     │                    │                    │
     │                    │ 2. JWT.verify()  │
     │                    │    (refresh)      │
     │                    │                    │
     │                    │ 3. Validate user │
     │                    │──────────────────►│
     │                    │                    │
     │                    │ ◄─────────────────│
     │                    │                    │
     │                    │ 4. Generate new   │
     │                    │    access token   │
     │                    │    (15 min)      │
     │                    │                    │
     │ ◄───────────────────────────────────│
     │ 5. New accessToken                   │
     │                    │                    │
     │ 6. Retry original │                    │
     │    request        │                    │
```

---

## 3. Sale Transaction Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Staff  │    │ Flutter │    │   API   │    │   DB    │    │  Outbox │
│         │    │   App   │    │         │    │         │    │ Worker  │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │               │               │               │               │
     │ 1. Open shift │               │               │               │
     │───────────────►│               │               │               │
     │               │ 2. POST /shifts (OPEN)        │               │
     │               │───────────────────────────────►│               │
     │               │               │               │               │
     │               │               │ 3. INSERT Shift {status:OPEN} │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │ ◄────────────────────────────────────────────│               │
     │               │               │               │               │
     │ 4. Scan barcode│               │               │               │
     │───────────────►│               │               │               │
     │               │ 5. GET /products/barcode/:code               │
     │               │─────────────────────────────────────────────►│
     │               │               │               │               │
     │               │ ◄────────────────────────────────────────────│
     │               │ 6. {product, variant, price}               │
     │               │               │               │               │
     │ 7. Display    │               │               │               │
     │    product    │               │               │               │
     │ ◄─────────────│               │               │               │
     │               │               │               │               │
     │ 8. Add to    │               │               │               │
     │    cart       │               │               │               │
     │───────────────►│               │               │               │
     │               │               │               │               │
     │ 9. Submit    │               │               │               │
     │    sale       │               │               │               │
     │───────────────►│               │               │               │
     │               │               │               │               │
     │               │ 10. POST /sales           │               │
     │               │ {customerId?, items:[],   │               │
     │               │  payment:{method,amount}} │               │
     │               │───────────────────────────►│               │
     │               │               │               │               │
     │               │               │ 11. BEGIN TX  │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 12. For each │               │
     │               │               │    item:      │               │
     │               │               │    SELECT qty │               │
     │               │               │    FROM       │               │
     │               │               │    StockBalance│              │
     │               │               │    WHERE ...  │               │
     │               │               │    FOR UPDATE │               │
     │               │               │               │               │
     │               │               │ 13. Validate │               │
     │               │               │    stock >=   │               │
     │               │               │    qty        │               │
     │               │               │               │               │
     │               │               │ 14. Calculate│               │
     │               │               │    money      │               │
     │               │               │    (minor     │               │
     │               │               │    units)     │               │
     │               │               │               │               │
     │               │               │ 15. INSERT Sale│              │
     │               │               │    {invoice#} │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 16. INSERT SaleItem[]       │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 17. INSERT Payment[]         │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 18. INSERT   │               │
     │               │               │    StockMovement[]           │
     │               │               │    type=SALE │               │
     │               │               │    qty=-N   │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 19. UPDATE   │               │
     │               │               │    StockBalance             │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 20. INSERT   │               │
     │               │               │    LedgerEntry[]            │
     │               │               │    (revenue,  │               │
     │               │               │     COGS)     │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 21. INSERT   │               │
     │               │               │    AuditLog  │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 22. INSERT   │               │
     │               │               │    OutboxEvent│              │
     │               │               │    {sale.    │               │
     │               │               │     completed}│              │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │               │ 23. COMMIT   │               │
     │               │               │──────────────────────────────►│
     │               │               │               │               │
     │               │ ◄───────────────────────────────────────────│
     │               │ 24. {sale, invoiceNumber, items}          │
     │               │               │               │               │
     │ 25. Display   │               │               │               │
     │    invoice    │               │               │               │
     │ ◄────────────│               │               │               │
     │               │               │               │               │
     │               │               │ 26. Outbox   │               │
     │               │               │    worker     │               │
     │               │               │    picks up  │               │
     │               │               │    event     │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │               │ 27. Process   │
     │               │               │               │    sale.      │
     │               │               │               │    completed  │
     │               │               │               │    (notify,   │
     │               │               │               │    analytics)│
     │               │               │               │               │
     │               │               │               │ 28. UPDATE    │
     │               │               │               │    OutboxEvent│
     │               │               │               │    processedAt│
```

---

## 4. Purchase Receiving Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Manager │    │  Admin   │    │   API    │    │    DB    │
│          │    │   Web    │    │          │    │          │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │
     │ 1. Create PO │               │               │
     │───────────────►│               │               │
     │               │               │               │
     │               │ 2. POST /purchases          │
     │               │ {supplierId, items:[...]}  │
     │               │─────────────────────────────►│
     │               │               │               │
     │               │               │ 3. INSERT    │
     │               │               │    Purchase  │
     │               │               │    {status: │
     │               │               │     DRAFT}   │
     │               │               │──────────────►│
     │               │               │               │
     │ ◄────────────────────────────────────────────│
     │               │               │               │
     │ 4. Receive   │               │               │
     │    goods    │               │               │
     │───────────────►│               │               │
     │               │               │               │
     │               │ 5. POST /purchases/:id/receive│
     │               │ {items:[{variantId,qty,unitCost}]}│
     │               │─────────────────────────────►│
     │               │               │               │
     │               │               │ 6. BEGIN TX  │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 7. For each  │
     │               │               │    item:      │
     │               │               │               │
     │               │               │ 8. INSERT    │
     │               │               │    StockMovement│
     │               │               │    type=PURCHASE│
     │               │               │    qty=+N    │            │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 9. UPDATE    │
     │               │               │    StockBalance│
     │               │               │    qty += N │            │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 10. INSERT   │
     │               │               │    LedgerEntry│
     │               │               │    (inventory│
     │               │               │     asset)   │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 11. UPDATE   │
     │               │               │    Purchase  │
     │               │               │    {status: │
     │               │               │     RECEIVED}│
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 12. AuditLog │
     │               │               │──────────────►│
     │               │               │               │
     │               │               │ 13. COMMIT   │
     │               │               │──────────────►│
     │               │               │               │
     │               │ ◄───────────────────────────────────────────│
     │               │ 14. {purchase, receivedItems}              │
     │               │               │               │
     │ ◄────────────────────────────────────────────│
```

---

## 5. Return Processing Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│Customer  │    │  Staff   │    │   API    │    │    DB    │    │ Outbox   │
│          │    │          │    │          │    │          │    │ Worker   │
└────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
     │               │               │               │               │
     │ 1. Return    │               │               │               │
     │    item      │               │               │               │
     │──────────────►│               │               │               │
     │               │               │               │               │
     │               │ 2. Find sale  │               │               │
     │               │    by invoice │               │               │
     │               │───────────────►│               │               │
     │               │               │               │               │
     │               │ 3. Check      │               │               │
     │               │    returnable │               │               │
     │               │    qty =       │               │               │
     │               │    sold -      │               │               │
     │               │    already     │               │               │
     │               │    returned    │               │               │
     │               │               │               │               │
     │               │ 4. POST /returns           │               │
     │               │ {saleId, items:[          │
     │               │  {variantId, qty,         │
     │               │   disposition, reason}]  │
     │               │───────────────►│               │               │
     │               │               │               │               │
     │               │               │ 5. BEGIN TX   │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 6. Validate  │               │
     │               │               │    return qty│               │
     │               │               │    ≤ returnable               │
     │               │               │               │               │
     │               │               │ 7. INSERT    │               │
     │               │               │    Return   │               │
     │               │               │    {status: │               │
     │               │               │     PENDING} │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 8. INSERT    │               │
     │               │               │    ReturnItem[]              │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 9. For each  │               │
     │               │               │    sellable: │               │
     │               │               │    INSERT     │               │
     │               │               │    StockMovement               │
     │               │               │    type=CUSTOMER_RETURN       │
     │               │               │    qty=+N    │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 10. For each│               │
     │               │               │    sellable:│               │
     │               │               │    UPDATE    │               │
     │               │               │    StockBalance              │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 11. Financial│               │
     │               │               │    reversal  │               │
     │               │               │    (debit   │               │
     │               │               │    revenue) │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 12. AuditLog │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │               │ 13. COMMIT   │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │ ◄───────────────────────────────────────────│
     │               │ 14. {return, refundAmount}                │
     │               │               │               │               │
     │ 15. Refund   │               │               │               │
     │    issued   │               │               │               │
     │ ◄────────────│               │               │               │
```

---

## 6. Inventory Movement Flow

```
┌────────────────────────────────────────────────────────────────────────┐
│                    INVENTORY LEDGER FLOW                                │
│                                                                         │
│   StockMovement (append-only) ────────────────────────────────────┐   │
│   │                                                              │   │
│   │ Type: PURCHASE_RECEIPT          Type: SALE                   │   │
│   │ qty: +10                        qty: -2                     │   │
│   │ Ref: Purchase                   Ref: Sale                  │   │
│   │                                      │                      │   │
│   │                                      │                      │   │
│   │                                      ▼                      │   │
│   │                              StockBalance (cache)           │   │
│   │                              quantity: 8                   │   │
│   │                              (projected from ledger)       │   │
│   │                                                             │   │
│   │                              ▲                              │   │
│   │                              │ UPDATE (transactional)      │   │
│   │                              │                              │   │
│   │ Type: DAMAGE ───────────────────────────────────────────┐   │   │
│   │ qty: -1                    Type: CUSTOMER_RETURN ─────┐ │   │   │
│   │ Ref: Damage report         qty: +3                   │ │   │   │
│   │                            Ref: Return                │ │   │   │
│   │                            (if sellable)             │ │   │   │
│   │                                                         │ │   │   │
│   │                            Type: FOUND ────────────────┘ │   │   │
│   │                            qty: +1                      │   │   │
│   │                            Ref: Stock count             │   │   │
│   │                                                         │   │   │
│   │                            Type: ADJUSTMENT ────────────┘   │   │
│   │                            qty: ±N                        │   │
│   │                            Ref: Adjustment reason          │   │
│   │                                                         │   │
│   │                            Type: TRANSFER_IN ─────────────┘   │
│   │                            qty: +5                            │
│   │                            Ref: Branch transfer               │
│   │                                                         │
│   └────────────────────────────────────────────────────────────┘
│                                                                         │
│   INVARIANT: SUM(movements) = StockBalance.quantity                    │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Audit Event Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Actor  │    │  Client │    │   API   │    │   DB    │    │  Admin  │
│ (User)  │    │   App   │    │         │    │         │    │   Web   │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │               │               │               │               │
     │ 1. Perform  │               │               │               │
     │    action   │               │               │               │
     │ (mutation)  │               │               │               │
     │─────────────►│               │               │               │
     │               │               │               │               │
     │               │ 2. POST/PATCH/DELETE     │               │
     │               │─────────────────────────►│               │
     │               │               │               │               │
     │               │               │ 3. Execute   │               │
     │               │               │    business  │               │
     │               │               │    logic     │               │
     │               │               │               │               │
     │               │               │ 4. INSERT     │               │
     │               │               │    AuditLog   │               │
     │               │               │    {          │               │
     │               │               │      actorId, │               │
     │               │               │      action,  │               │
     │               │               │      entityType,              │
     │               │               │      entityId,│               │
     │               │               │      beforeData,              │
     │               │               │      afterData,│              │
     │               │               │      metadata │               │
     │               │               │    }          │               │
     │               │               │──────────────►│               │
     │               │               │               │               │
     │               │ ◄───────────────────────────────────────────│
     │               │ 5. Success response │               │               │
     │               │               │               │               │
     │ ◄────────────────────────────────────────────│               │
     │               │               │               │               │
     │ 6. Success   │               │               │               │
     │ ◄────────────│               │               │               │
     │               │               │               │               │
     │               │               │               │ 7. View audit│
     │               │               │               │    logs      │
     │               │               │               │◄──────────────│
     │               │               │               │               │
     │               │               │               │ 8. SELECT    │
     │               │               │               │    AuditLog  │
     │               │               │               │    WHERE     │
     │               │               │               │    entityId │
     │               │               │               │               │
```

---

## 8. Outbox Event Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Sale   │    │   API   │    │   DB    │    │ Outbox  │    │ Notifi- │
│ Handler │    │         │    │         │    │ Worker  │    │ cation  │
└────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘
     │               │               │               │               │
     │ 1. Sale       │               │               │               │
     │    created     │               │               │               │
     │               │               │               │               │
     │ 2. INSERT     │               │               │               │
     │    OutboxEvent│               │               │               │
     │    {          │               │               │               │
     │      eventType:│              │               │               │
     │      'sale.',  │               │               │               │
     │      completed',│              │               │               │
     │      payload: │               │               │               │
     │      {...}    │               │               │               │
     │    }          │               │               │               │
     │───────────────►│               │               │               │
     │               │ 3. COMMIT TX │               │               │
     │               │──────────────►│               │               │
     │               │               │               │               │
     │               │               │ 4. Polls every│              │
     │               │               │    5 seconds: │               │
     │               │               │    SELECT *   │               │
     │               │               │    FROM       │               │
     │               │               │    OutboxEvent│               │
     │               │               │    WHERE      │               │
     │               │               │    processedAt │               │
     │               │               │    IS NULL    │               │
     │               │               │    ORDER BY   │               │
     │               │               │    createdAt  │               │
     │               │               │    LIMIT 10   │               │
     │               │               │◄──────────────│               │
     │               │               │               │               │
     │               │               │ 5. Returns   │               │
     │               │               │    unprocessed│               │
     │               │               │    events     │               │
     │               │               │               │               │
     │               │               │               │ 6. For each  │
     │               │               │               │    event:    │
     │               │               │               │               │
     │               │               │               │ 7. Process   │
     │               │               │               │    (email,   │
     │               │               │               │    webhook,  │
     │               │               │               │    analytics│
     │               │               │               │               │
     │               │               │               │ 8. UPDATE   │
     │               │               │               │    OutboxEvent│
     │               │               │               │    SET       │
     │               │               │               │    processedAt│
     │               │               │               │    = NOW()  │
     │               │               │               │◄─────────────│
     │               │               │               │               │
     │               │               │               │ 9. On        │
     │               │               │               │    failure:  │
     │               │               │               │    retry or  │
     │               │               │               │    dead-letter│
```

---

## Summary: Data Flow Principles

1. **Command Query Responsibility Segregation (CQRS)**
   - Commands (writes) go through the API → DB transaction
   - Queries (reads) can go through cache or DB
   - Audit events are written synchronously in the same transaction

2. **Outbox Pattern**
   - Events are written to OutboxEvent table in the same DB transaction as the business operation
   - A separate worker polls and processes events asynchronously
   - Guarantees at-least-once delivery without distributed transaction complexity

3. **Eventual Consistency**
   - Outbox events are processed with delay (5 seconds)
   - Notifications and analytics reflect the latest state within seconds
   - Core business state (inventory, finance) is always consistent (within the transaction)

4. **Audit as First-Class Citizen**
   - Every mutation creates an AuditLog entry
   - AuditLog is append-only
   - Actor, action, entity, before/after state are all captured
