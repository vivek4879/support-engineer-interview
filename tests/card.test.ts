import assert from "node:assert/strict";
import test from "node:test";
import { isValidCardNumber, normalizeCardNumber } from "../lib/utils/card";

test("normalizeCardNumber strips spaces and hyphens", () => {
  assert.equal(normalizeCardNumber("4111 1111-1111 1111"), "4111111111111111");
});

test("isValidCardNumber accepts known valid Luhn test numbers", () => {
  assert.equal(isValidCardNumber("4111 1111 1111 1111"), true); // Visa test number
  assert.equal(isValidCardNumber("5555-5555-5555-4444"), true); // Mastercard test number
  assert.equal(isValidCardNumber("378282246310005"), true); // AmEx test number
});

test("isValidCardNumber rejects invalid or suspicious values", () => {
  assert.equal(isValidCardNumber("4111111111111112"), false); // Luhn fail
  assert.equal(isValidCardNumber("0000 0000 0000 0000"), false); // repeated digits
  assert.equal(isValidCardNumber("abcd-efgh"), false); // invalid chars
});
