# PERF-404: Transaction order appeared random

## Priority and Impact
- Priority: Medium
- Impact: Users reviewing history could see inconsistent ordering, making activity verification confusing.

## Root Cause
`getTransactions` did not enforce deterministic ordering at query level.
Without explicit `ORDER BY`, SQLite can return rows in non-guaranteed order patterns, especially as inserts grow over time.

## Fix Implemented
1. Added explicit DB ordering in `server/routers/account.ts`:
   - `ORDER BY createdAt DESC, id DESC`
2. Added deterministic ordering helper (`lib/utils/transactions.ts`) with tie-break behavior:
   - Newest timestamp first
   - If timestamps tie, higher ID first
3. Applied helper to formatted transaction output for stable final ordering.
4. Added regression tests in `tests/transactions-order.test.ts`.

## Why This Resolves the Issue
- Query now returns newest-first chronology consistently.
- Tie-break by ID prevents “random” ordering for transactions sharing the same timestamp.
- Post-format ordering helper keeps output deterministic even with edge-case timestamp formatting differences.

## Preventive Measures
1. Require explicit ordering for all user-visible history endpoints.
2. Include deterministic tie-break columns when timestamp precision can collide.
3. Add regression tests for ordering stability.

## Evidence
- Updated:
  - `server/routers/account.ts`
  - `lib/utils/transactions.ts`
- Added test:
  - `tests/transactions-order.test.ts`
