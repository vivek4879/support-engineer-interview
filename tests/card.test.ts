import assert from "node:assert/strict";
import test from "node:test";
import { detectCardType, isValidCardNumber, normalizeCardNumber } from "../lib/utils/card";

test("normalizeCardNumber strips spaces and hyphens", () => {
  assert.equal(normalizeCardNumber("4111 1111-1111 1111"), "4111111111111111");
});

test("isValidCardNumber accepts known valid Luhn test numbers", () => {
  assert.equal(isValidCardNumber("4111 1111 1111 1111"), true); // Visa test number
  assert.equal(isValidCardNumber("5555-5555-5555-4444"), true); // Mastercard test number
  assert.equal(isValidCardNumber("378282246310005"), true); // AmEx test number
  assert.equal(isValidCardNumber("6011111111111117"), true); // Discover test number
  assert.equal(isValidCardNumber("3530111333300000"), true); // JCB test number
  assert.equal(isValidCardNumber("30569309025904"), true); // Diners Club test number
});

test("detectCardType recognizes major supported networks", () => {
  assert.equal(detectCardType("4111111111111111"), "visa");
  assert.equal(detectCardType("2223003122003222"), "mastercard");
  assert.equal(detectCardType("378282246310005"), "amex");
  assert.equal(detectCardType("6011111111111117"), "discover");
  assert.equal(detectCardType("3530111333300000"), "jcb");
  assert.equal(detectCardType("30569309025904"), "diners");
  assert.equal(detectCardType("6200000000000005"), "unionpay");
});

test("isValidCardNumber rejects invalid or suspicious values", () => {
  assert.equal(isValidCardNumber("4111111111111112"), false); // Luhn fail
  assert.equal(isValidCardNumber("0000 0000 0000 0000"), false); // repeated digits
  assert.equal(isValidCardNumber("abcd-efgh"), false); // invalid chars
  assert.equal(isValidCardNumber("9111111111111111"), false); // unsupported type
});
