# PERF-407: Performance degradation during multiple transaction workflows

## Priority and Impact
- Priority: High
- Impact: Transaction history retrieval slowed down as transaction volume increased.

## Root Cause
`getTransactions` in `server/routers/account.ts` had an N+1 query pattern:
1. Query all transactions for an account.
2. For each transaction, query the `accounts` table again to fetch account details.

Because all transactions in this endpoint already belong to the same verified account, those repeated account lookups were redundant and scaled poorly.

## Fix Implemented
1. Removed per-transaction account lookup loop in `getTransactions`.
2. Reused already-loaded account metadata (`account.accountType`) from the initial ownership check.
3. Kept description sanitization in the same map transformation pass.

## Why This Resolves the Issue
- Query count for transaction retrieval is reduced by up to `N` extra account queries.
- Response assembly is now a single map pass over in-memory transaction rows.
- Performance scales linearly with one base account check + one transaction query.

## Preventive Measures
1. Add review checks for N+1 query anti-patterns.
2. Prefer joining/preloading or reuse already-fetched parent entity data.

## Evidence
- Updated:
  - `server/routers/account.ts`
- Added test:
  - `tests/transactions-transform.test.ts`
