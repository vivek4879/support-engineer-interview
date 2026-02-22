# PERF-406: Account balances become incorrect after many transactions

## Priority and Impact
- Priority: Critical
- Impact: Direct financial correctness issue in customer balances; high trust and compliance risk.

## Root Cause
The `fundAccount` mutation in `server/routers/account.ts` had three correctness flaws:
1. It used floating-point arithmetic directly for monetary updates, which introduces precision drift over repeated operations.
2. It used read-then-write balance logic (`account.balance + amount`) that can lose updates under concurrent funding requests.
3. It computed and returned `newBalance` through an unnecessary loop that amplified precision issues.

## Fix Implemented
1. Added `lib/utils/money.ts` helpers to normalize values using integer cents and convert back to two-decimal currency values.
2. Updated funding logic to normalize deposit amount before persistence.
3. Moved transaction insertion and balance update into a single DB transaction to keep mutation atomic.
4. Replaced read-then-write balance assignment with SQL increment logic:
   - `balance = ROUND(balance + amount, 2)`
   This prevents lost updates and enforces two-decimal storage precision.
5. Removed loop-based `newBalance` computation and now return the persisted post-update balance.

## Why This Resolves the Issue
- Integer-cents normalization prevents floating drift from propagating through deposits.
- Atomic DB transaction ensures transaction record creation and balance update succeed/fail together.
- SQL-side increment applies updates based on current persisted balance, avoiding stale-read overwrite behavior.
- Returning persisted balance guarantees API response reflects source-of-truth data.

## Preventive Measures
1. Enforce a money-handling guideline: no direct float math for currency; always normalize to cents.
2. Require atomic transactions for all ledger-affecting operations.
3. Add regression tests for repeated micro-deposits and non-finite amount handling.
4. Add code review checklist items for:
   - Read-modify-write balance patterns
   - Non-atomic financial writes
   - Precision-sensitive logic

## Evidence
- Added tests in `tests/money.test.ts`:
  - `normalizeCurrencyAmount rounds to two decimal places`
  - `addCurrencyAmounts avoids floating point drift in repeated deposits`
  - `toCents rejects non-finite values`
- Updated implementation in `server/routers/account.ts` and `lib/utils/money.ts`.
