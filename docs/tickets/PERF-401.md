# PERF-401: New accounts show $100 balance when DB operations fail

## Priority and Impact
- Priority: Critical
- Impact: Financial misinformation at account creation time, causing immediate trust and reconciliation risk.

## Root Cause
In `server/routers/account.ts`, `createAccount` returned a fabricated fallback object when the post-insert fetch failed:
- `balance: 100`
- `status: "pending"`
- synthetic ID/timestamp data

This meant account-creation errors could be masked as successful responses with incorrect account state.

## Fix Implemented
1. Removed fabricated fallback return path entirely.
2. Wrapped account creation in a DB transaction for consistent read/check/create flow.
3. Switched to `insert(...).returning().get()` to return the actual persisted row directly.
4. Added a strict guard (`requireEntity`) that throws `INTERNAL_SERVER_ERROR` if a created row is unexpectedly missing.

## Why This Resolves the Issue
- The API now fails fast when persistence does not produce a valid account row.
- No synthetic account payloads can be returned, so incorrect balances like `$100` cannot be shown from this failure path.
- Response data is now sourced only from the database write result.

## Preventive Measures
1. Prohibit synthetic/fallback success objects in financial workflows.
2. Require DB writes to return persisted rows (`returning`) rather than re-query + fallback.
3. Add code review checklist item: “No success response on failed persistence path.”
4. Keep explicit guard helpers for impossible states and test them.

## Evidence
- Updated:
  - `server/routers/account.ts`
  - `lib/utils/guards.ts`
- Added test:
  - `tests/guards.test.ts` validates guard success/failure behavior.
