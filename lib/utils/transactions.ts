type TxnWithOrderFields = {
  id: number;
  createdAt: string | null;
};

function toTimestamp(value: string | null): number {
  if (!value) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
}

function compareNewestFirst(a: TxnWithOrderFields, b: TxnWithOrderFields): number {
  const timeDiff = toTimestamp(b.createdAt) - toTimestamp(a.createdAt);
  if (timeDiff !== 0) {
    return timeDiff;
  }

  return b.id - a.id;
}

export function sortTransactionsNewestFirst<T extends TxnWithOrderFields>(transactions: T[]): T[] {
  if (transactions.length < 2) {
    return transactions;
  }

  let alreadySorted = true;
  for (let i = 1; i < transactions.length; i += 1) {
    if (compareNewestFirst(transactions[i - 1]!, transactions[i]!) > 0) {
      alreadySorted = false;
      break;
    }
  }

  if (alreadySorted) {
    return transactions;
  }

  return [...transactions].sort(compareNewestFirst);
}
