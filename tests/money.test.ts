import assert from "node:assert/strict";
import test from "node:test";
import {
  addCurrencyAmounts,
  isValidFundingAmount,
  normalizeCurrencyAmount,
  toCents,
  validateFundingAmountInput,
} from "../lib/utils/money";

test("normalizeCurrencyAmount rounds to two decimal places", () => {
  assert.equal(normalizeCurrencyAmount(10.129), 10.13);
  assert.equal(normalizeCurrencyAmount(10.124), 10.12);
});

test("addCurrencyAmounts avoids floating point drift in repeated deposits", () => {
  let balance = 0;

  for (let i = 0; i < 1000; i++) {
    balance = addCurrencyAmounts(balance, 0.1);
  }

  assert.equal(balance, 100);
});

test("toCents rejects non-finite values", () => {
  assert.throws(() => toCents(Number.NaN), /finite number/);
  assert.throws(() => toCents(Number.POSITIVE_INFINITY), /finite number/);
});

test("isValidFundingAmount rejects zero/near-zero effective values", () => {
  assert.equal(isValidFundingAmount(0), false);
  assert.equal(isValidFundingAmount(0.001), false);
  assert.equal(isValidFundingAmount(0.009), false);
  assert.equal(isValidFundingAmount(0.01), true);
  assert.equal(isValidFundingAmount(10), true);
});

test("validateFundingAmountInput rejects multiple leading zeros and malformed inputs", () => {
  assert.equal(validateFundingAmountInput("00010"), "Amount cannot include multiple leading zeros");
  assert.equal(validateFundingAmountInput("01.25"), "Amount cannot include multiple leading zeros");
  assert.equal(validateFundingAmountInput("10.999"), "Invalid amount format");
  assert.equal(validateFundingAmountInput("abc"), "Invalid amount format");
});

test("validateFundingAmountInput accepts valid amounts in canonical format", () => {
  assert.equal(validateFundingAmountInput("0.01"), null);
  assert.equal(validateFundingAmountInput("10"), null);
  assert.equal(validateFundingAmountInput("10.50"), null);
});
