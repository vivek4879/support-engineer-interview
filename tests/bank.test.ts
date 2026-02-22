import assert from "node:assert/strict";
import test from "node:test";
import { isValidRoutingNumber } from "../lib/utils/bank";

test("isValidRoutingNumber accepts 9-digit routing numbers", () => {
  assert.equal(isValidRoutingNumber("123456789"), true);
  assert.equal(isValidRoutingNumber(" 123456789 "), true);
});

test("isValidRoutingNumber rejects missing or malformed values", () => {
  assert.equal(isValidRoutingNumber(undefined), false);
  assert.equal(isValidRoutingNumber(""), false);
  assert.equal(isValidRoutingNumber("12345678"), false);
  assert.equal(isValidRoutingNumber("1234567890"), false);
  assert.equal(isValidRoutingNumber("12345abcd"), false);
});
