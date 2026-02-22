import assert from "node:assert/strict";
import test from "node:test";
import { isValidUsStateCode, normalizeUsStateCode } from "../lib/utils/state";

test("normalizeUsStateCode trims and uppercases values", () => {
  assert.equal(normalizeUsStateCode(" ca "), "CA");
});

test("isValidUsStateCode accepts valid states and territories", () => {
  assert.equal(isValidUsStateCode("CA"), true);
  assert.equal(isValidUsStateCode("ny"), true);
  assert.equal(isValidUsStateCode("PR"), true);
});

test("isValidUsStateCode rejects unknown or malformed values", () => {
  assert.equal(isValidUsStateCode("XX"), false);
  assert.equal(isValidUsStateCode("C"), false);
  assert.equal(isValidUsStateCode("123"), false);
  assert.equal(isValidUsStateCode(""), false);
});
