import assert from "node:assert/strict";
import test from "node:test";

type Txn = {
  id: number;
  description: string | null;
};

function transformTransactionsForAccount(accountType: string, transactions: Txn[]) {
  return transactions.map((transaction) => ({
    ...transaction,
    description: transaction.description,
    accountType,
  }));
}

test("transaction transform attaches accountType without per-transaction lookup", () => {
  const transactions: Txn[] = [
    { id: 1, description: "Funding from card" },
    { id: 2, description: "Funding from bank" },
    { id: 3, description: null },
  ];

  const transformed = transformTransactionsForAccount("checking", transactions);

  assert.equal(transformed.length, 3);
  assert.equal(transformed[0]?.accountType, "checking");
  assert.equal(transformed[1]?.accountType, "checking");
  assert.equal(transformed[2]?.accountType, "checking");
});
