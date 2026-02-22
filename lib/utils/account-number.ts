import { randomInt } from "node:crypto";

const ACCOUNT_NUMBER_DIGITS = 10;
const ACCOUNT_NUMBER_MAX = 10 ** ACCOUNT_NUMBER_DIGITS;

type RandomIntFn = (min: number, max: number) => number;

export function generateSecureAccountNumber(randomFn: RandomIntFn = randomInt): string {
  const value = randomFn(0, ACCOUNT_NUMBER_MAX);

  if (!Number.isInteger(value) || value < 0 || value >= ACCOUNT_NUMBER_MAX) {
    throw new Error("Secure account number generator returned an out-of-range value");
  }

  return value.toString().padStart(ACCOUNT_NUMBER_DIGITS, "0");
}
