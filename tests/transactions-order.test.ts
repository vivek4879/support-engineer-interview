import assert from "node:assert/strict";
import test from "node:test";
import { sortTransactionsNewestFirst } from "../lib/utils/transactions";

test("sortTransactionsNewestFirst orders by createdAt desc, then id desc", () => {
  const input = [
    { id: 1, createdAt: "2026-01-01T10:00:00.000Z" },
    { id: 3, createdAt: "2026-01-01T10:00:00.000Z" },
    { id: 2, createdAt: "2026-01-01T11:00:00.000Z" },
    { id: 4, createdAt: null },
  ];

  const sorted = sortTransactionsNewestFirst(input);
  assert.deepEqual(
    sorted.map((txn) => txn.id),
    [2, 3, 1, 4]
  );
});

test("sortTransactionsNewestFirst returns input as-is when already sorted", () => {
  const input = [
    { id: 5, createdAt: "2026-01-02T10:00:00.000Z" },
    { id: 4, createdAt: "2026-01-02T09:00:00.000Z" },
  ];

  const sorted = sortTransactionsNewestFirst(input);
  assert.equal(sorted, input);
});
