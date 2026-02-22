import assert from "node:assert/strict";
import test from "node:test";
import { replaceUserSession } from "../lib/utils/session";

test("replaceUserSession keeps only one active session per user", () => {
  const calls: string[] = [];
  const deletedUserIds: number[] = [];
  const insertedTokens: string[] = [];

  const dbMock = {
    delete() {
      calls.push("delete");
      return {
        where() {
          calls.push("delete-where");
          return {
            run() {
              calls.push("delete-run");
            },
          };
        },
      };
    },
    insert() {
      calls.push("insert");
      return {
        values(values: { userId: number; token: string; expiresAt: string }) {
          deletedUserIds.push(values.userId);
          insertedTokens.push(values.token);
          calls.push("insert-values");
          return {
            run() {
              calls.push("insert-run");
            },
          };
        },
      };
    },
  };

  replaceUserSession(dbMock, {
    userId: 1,
    token: "second-token",
    expiresAt: "2030-01-02T00:00:00.000Z",
  });

  assert.deepEqual(calls, ["delete", "delete-where", "delete-run", "insert", "insert-values", "insert-run"]);
  assert.deepEqual(deletedUserIds, [1]);
  assert.deepEqual(insertedTokens, ["second-token"]);
});
