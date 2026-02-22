import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidInternationalPhoneNumber,
  normalizePhoneNumber,
  validateInternationalPhoneNumber,
} from "../lib/utils/phone";

test("normalizePhoneNumber removes separators and converts 00 prefix to +", () => {
  assert.equal(normalizePhoneNumber(" +1 (415) 555-2671 "), "+14155552671");
  assert.equal(normalizePhoneNumber("00442071838750"), "+442071838750");
});

test("isValidInternationalPhoneNumber accepts valid international numbers", () => {
  assert.equal(isValidInternationalPhoneNumber("+14155552671"), true);
  assert.equal(isValidInternationalPhoneNumber("+442071838750"), true);
});

test("isValidInternationalPhoneNumber rejects invalid formats", () => {
  assert.equal(isValidInternationalPhoneNumber("1234567890"), false);
  assert.equal(isValidInternationalPhoneNumber("+0123456789"), false);
  assert.equal(isValidInternationalPhoneNumber("+1"), false);
  assert.equal(isValidInternationalPhoneNumber("+1234567890123456"), false);
});

test("validateInternationalPhoneNumber returns a clear error message for invalid input", () => {
  assert.equal(
    validateInternationalPhoneNumber("1234567890"),
    "Use a valid international phone number in +countrycode format (for example, +14155552671)"
  );
  assert.equal(validateInternationalPhoneNumber("+14155552671"), null);
});
