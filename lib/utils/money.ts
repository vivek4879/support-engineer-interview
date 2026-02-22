export function toCents(amount: number): number {
  if (!Number.isFinite(amount)) {
    throw new Error("Amount must be a finite number");
  }

  return Math.round((amount + Number.EPSILON) * 100);
}

const AMOUNT_INPUT_PATTERN = /^\d+(\.\d{1,2})?$/;
const MAX_FUNDING_AMOUNT = 10000;

export function fromCents(cents: number): number {
  return cents / 100;
}

export function normalizeCurrencyAmount(amount: number): number {
  return fromCents(toCents(amount));
}

export function addCurrencyAmounts(left: number, right: number): number {
  return fromCents(toCents(left) + toCents(right));
}

export function isValidFundingAmount(amount: number): boolean {
  if (!Number.isFinite(amount)) {
    return false;
  }

  return amount >= 0.01;
}

export function validateFundingAmountInput(rawAmount: string): string | null {
  const trimmed = rawAmount.trim();

  if (trimmed.length === 0) {
    return "Amount is required";
  }

  if (!AMOUNT_INPUT_PATTERN.test(trimmed)) {
    return "Invalid amount format";
  }

  const [wholePart] = trimmed.split(".");
  if (wholePart.length > 1 && wholePart.startsWith("0")) {
    return "Amount cannot include multiple leading zeros";
  }

  const amount = Number(trimmed);
  if (!Number.isFinite(amount)) {
    return "Invalid amount format";
  }

  if (!isValidFundingAmount(amount)) {
    return "Amount must be at least $0.01";
  }

  if (amount > MAX_FUNDING_AMOUNT) {
    return "Amount cannot exceed $10,000";
  }

  return null;
}
