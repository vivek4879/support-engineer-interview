export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  return Math.round((amount + Number.EPSILON) * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

export function normalizeCurrencyAmount(amount: number): number {
  return fromCents(toCents(amount));
}

export function addCurrencyAmounts(left: number, right: number): number {
  return fromCents(toCents(left) + toCents(right));
}
