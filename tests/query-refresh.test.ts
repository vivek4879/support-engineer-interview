import assert from "node:assert/strict";
import test from "node:test";
import { refreshQueriesAfterFunding } from "../lib/utils/query-refresh";

test("refreshQueriesAfterFunding invalidates account and transaction queries", async () => {
  const calls: string[] = [];

  await refreshQueriesAfterFunding(
    {
      invalidateAccounts: async () => {
        calls.push("accounts");
      },
      invalidateTransactions: async (accountId) => {
        calls.push(`transactions:${accountId}`);
      },
    },
    42
  );

  assert.equal(calls.includes("accounts"), true);
  assert.equal(calls.includes("transactions:42"), true);
  assert.equal(calls.length, 2);
});
