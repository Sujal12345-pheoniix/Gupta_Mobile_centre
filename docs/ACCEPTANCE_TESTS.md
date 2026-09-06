# Critical Acceptance Tests

## Sale integrity
### A1 — normal sale
Given stock=10 and quantity=2:
- sale completes
- stock=8
- one SALE stock movement exists
- payment exists
- invoice exists
- audit event exists

### A2 — insufficient stock
Given stock=1 and quantity=2:
- sale is rejected
- no sale is completed
- stock remains 1
- no completed payment is recorded

### A3 — payment retry
Repeat the same idempotency key:
- exactly one sale/payment effect exists.

### A4 — cancellation
Cancel a completed sale:
- cancellation recorded
- stock reversal created exactly once
- financial reversal recorded
- audit event exists.

## Returns
### A5
Return 1 of 3 sold units:
- return succeeds
- returnable quantity becomes 2
- disposition determines whether stock is restored.

### A6
Attempt return of 4 when only 3 were sold:
- reject.

## Permissions
### A7
Staff attempts inventory adjustment:
- server returns forbidden.

### A8
Staff applies discount above configured limit:
- approval required.

### A9
Sub-admin attempts role/owner management:
- forbidden.

## Payroll
### A10
Finalized payroll period:
- cannot be edited directly.

## Audit
### A11
Sensitive mutation:
- append-only audit event created.
