# PERF-402: Logout always reports success even when session remains active

## Priority and Impact
- Priority: Medium
- Impact: Users can be told they logged out even when no server-side session was actually invalidated, causing false security expectations.

## Root Cause
In `server/routers/auth.ts`, logout response used token presence instead of deletion result:
- If `session` cookie existed, message returned "Logged out successfully"
- It did not verify whether a session row was actually deleted

Also, cookie parsing in `lib/utils/cookies.ts` assumed `"; "` delimiter only, which can fail on valid headers like `a=1;b=2`.

## Fix Implemented
1. Added `deleteSessionByToken` helper in `lib/utils/session.ts`:
   - Executes delete with `.run()`
   - Returns actual deleted row count (`changes`)
2. Added `buildLogoutResponse` helper in `lib/utils/session.ts`:
   - Success only when deleted row count > 0
3. Updated logout mutation in `server/routers/auth.ts`:
   - Uses actual deletion count to build response
   - Still clears cookie in all cases
4. Hardened cookie parsing in `lib/utils/cookies.ts`:
   - Supports both `"; "` and `";"` formats
5. Reused `deleteSessionByToken` in `server/trpc.ts` near-expiry revocation path for consistency.

## Why This Resolves the Issue
- Logout status now reflects real server-side invalidation outcome, not just cookie presence.
- Edge-case cookie formats no longer prevent session-token extraction.
- Users receive accurate logout feedback aligned with backend state.

## Preventive Measures
1. For state-changing endpoints, base success responses on persistence results, not input presence.
2. Centralize session deletion and response semantics in utility helpers.
3. Add parser tests for multiple cookie header formats.

## Evidence
- Updated:
  - `server/routers/auth.ts`
  - `lib/utils/session.ts`
  - `lib/utils/cookies.ts`
  - `server/trpc.ts`
- Added/updated tests:
  - `tests/session.test.ts`
  - `tests/cookies.test.ts`
