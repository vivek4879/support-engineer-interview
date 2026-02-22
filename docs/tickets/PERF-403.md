# PERF-403: Expiring sessions remained valid until exact expiry time

## Priority and Impact
- Priority: High
- Impact: Sessions with only a few seconds left were still treated as authenticated, creating a security risk window near expiration.

## Root Cause
In `server/trpc.ts`, session validity checked only:
- `new Date(session.expiresAt) > new Date()`

So a session with very little time remaining (for example, 5 seconds) was still accepted as valid and only logged as "about to expire."

## Fix Implemented
1. Added explicit safety buffer policy in `lib/utils/session.ts`:
   - `SESSION_EXPIRY_BUFFER_MS = 60000`
   - `isSessionUsable(expiresAtIso, now)` returns true only when remaining time is greater than the buffer.
2. Updated `server/trpc.ts` context auth:
   - Accept session only if `isSessionUsable(...)` is true.
   - If session exists but is expired/near-expiry, revoke it from DB and clear session cookie.

## Why This Resolves the Issue
- Sessions close to expiration are no longer treated as valid authenticated sessions.
- Revoking and clearing cookie removes ambiguous state and forces clean re-authentication.
- This closes the near-expiry security gap instead of only warning about it.

## Preventive Measures
1. Define explicit auth validity windows (not just exact timestamp comparison).
2. Keep session policy constants centralized and tested.
3. Revoke invalid sessions proactively rather than passively logging.

## Evidence
- Updated:
  - `lib/utils/session.ts`
  - `server/trpc.ts`
- Added tests:
  - `tests/session-expiry.test.ts`
