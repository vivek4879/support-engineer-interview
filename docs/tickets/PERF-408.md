# PERF-408: Database connections remain open (resource leak)

## Priority and Impact
- Priority: Critical
- Impact: Repeated server/module initialization can accumulate open DB handles and degrade reliability over time.

## Root Cause
`lib/db/index.ts` created unnecessary extra SQLite connections:
1. One connection at module scope (`const sqlite = new Database(dbPath)`).
2. Another connection inside `initDb()` (`const conn = new Database(dbPath)`), pushed into an array.
3. The extra connections were never used for queries and never closed.


## Fix Implemented
1. Removed the `connections` array and all extra per-init connection creation.
2. Introduced a global singleton helper (`lib/utils/global-singleton.ts`) so the app reuses one SQLite connection.
3. Changed `initDb` to accept and initialize the shared connection.
4. Added a one-time initialization flag to prevent repeated schema initialization in the same process.

## Why This Resolves the Issue
- Only one DB connection is created and reused, so no hidden handle accumulation.
- Initialization now operates on that single connection.
- One-time init guard avoids repeated setup work and repeated connection side effects.

## Preventive Measures
1. Enforce singleton ownership for process-level resources (DB clients, sockets, pools).
2. Ban "open connection inside init helper" patterns unless explicit lifecycle management exists.
3. Add checklist item in review: every created resource must have clear ownership and close strategy.
4. Keep a regression test for singleton behavior.

## Evidence
- Updated:
  - `lib/db/index.ts`
  - `lib/utils/global-singleton.ts`
- Added test:
  - `tests/global-singleton.test.ts`
