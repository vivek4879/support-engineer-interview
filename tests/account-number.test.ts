import assert from "node:assert/strict";
import test from "node:test";
import { generateSecureAccountNumber } from "../lib/utils/account-number";

test("generateSecureAccountNumber returns 10-digit zero-padded numbers", () => {
  assert.equal(generateSecureAccountNumber(() => 0), "0000000000");
  assert.equal(generateSecureAccountNumber(() => 42), "0000000042");
  assert.equal(generateSecureAccountNumber(() => 9999999999), "9999999999");
});

test("generateSecureAccountNumber enforces output range and integer constraints", () => {
  assert.throws(() => generateSecureAccountNumber(() => -1), /out-of-range/);
  assert.throws(() => generateSecureAccountNumber(() => 10_000_000_000), /out-of-range/);
  assert.throws(() => generateSecureAccountNumber(() => 1.5), /out-of-range/);
});
