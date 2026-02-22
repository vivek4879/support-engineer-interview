# PERF-405: Missing transactions in history after multiple funding events

## Priority and Impact
- Priority: Critical
- Impact: Users cannot reliably verify all account activity, which is a core banking trust requirement.

## Root Cause
Transaction history data was not being refreshed after a successful funding mutation.

Specifically:
1. `TransactionList` reads `account.getTransactions` via React Query/tRPC.
2. Global query `staleTime` is 60 seconds (`lib/trpc/Provider.tsx`), so cached results remain "fresh" for one minute.
3. After funding, the dashboard only refreshed accounts (`refetchAccounts`) and did not invalidate/refetch `account.getTransactions`.

Result: newly created transactions existed in the database but were not immediately visible in the history panel, appearing as "missing."

## Fix Implemented
1. Added `refreshQueriesAfterFunding` helper in `lib/utils/query-refresh.ts` to centralize post-funding cache refresh behavior.
2. Updated `components/FundingModal.tsx` to invalidate:
   - `account.getAccounts`
   - `account.getTransactions` for the funded account
3. Removed redundant account refetch call from dashboard funding success callback (`app/dashboard/page.tsx`) since invalidation now handles refresh consistently.

## Why This Resolves the Issue
- Query invalidation marks cached transaction history stale immediately after funding.
- Active observers (`TransactionList`) refetch and show the newly inserted transactions without waiting for staleTime expiration.
- The fix is scoped to the funded account, avoiding unnecessary broad refresh behavior.

## Preventive Measures
1. Define a mutation-to-query invalidation matrix for every state-changing API.
2. Require mutation handlers to either:
   - return enough data for immediate UI reconciliation, or
   - invalidate dependent queries explicitly.
3. Add regression tests for post-mutation cache refresh behavior in critical financial views.

## Evidence
- Added test: `tests/query-refresh.test.ts`
  - `refreshQueriesAfterFunding invalidates account and transaction queries`
- Updated files:
  - `components/FundingModal.tsx`
  - `lib/utils/query-refresh.ts`
  - `app/dashboard/page.tsx`
