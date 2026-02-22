import assert from "node:assert/strict";
import test from "node:test";
import { getCommonEmailTypoSuggestion, normalizeEmailForLookup, validateEmailForSignup } from "../lib/utils/email";

test("normalizeEmailForLookup normalizes case and surrounding spaces", () => {
  assert.equal(normalizeEmailForLookup("  TEST@Example.COM "), "test@example.com");
});

test("getCommonEmailTypoSuggestion suggests correction for common typo domains", () => {
  assert.equal(getCommonEmailTypoSuggestion("user@example.con"), "user@example.com");
  assert.equal(getCommonEmailTypoSuggestion("user@example.com"), null);
});

test("validateEmailForSignup rejects leading/trailing spaces", () => {
  assert.equal(validateEmailForSignup(" user@example.com "), "Email cannot start or end with spaces");
});

test("validateEmailForSignup rejects common domain typo and returns suggestion", () => {
  assert.equal(
    validateEmailForSignup("user@example.con"),
    "Email domain looks incorrect. Did you mean user@example.com?"
  );
});

test("validateEmailForSignup allows valid email values", () => {
  assert.equal(validateEmailForSignup("TEST@example.com"), null);
});
