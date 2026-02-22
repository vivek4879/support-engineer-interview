import assert from "node:assert/strict";
import test from "node:test";
import { buildLogoutResponse, deleteSessionByToken, replaceUserSession } from "../lib/utils/session";

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

test("deleteSessionByToken returns deleted row count from DB run result", () => {
  const calls: string[] = [];

  const dbMock = {
    delete() {
      calls.push("delete");
      return {
        where() {
          calls.push("where");
          return {
            run() {
              calls.push("run");
              return { changes: 1 };
            },
          };
        },
      };
    },
  };

  const deleted = deleteSessionByToken(dbMock, "token-123");
  assert.equal(deleted, 1);
  assert.deepEqual(calls, ["delete", "where", "run"]);
});

test("buildLogoutResponse reports success only when a session row is deleted", () => {
  assert.deepEqual(buildLogoutResponse(1), { success: true, message: "Logged out successfully" });
  assert.deepEqual(buildLogoutResponse(0), { success: false, message: "No active session" });
});
