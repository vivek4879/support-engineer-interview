import assert from "node:assert/strict";
import test from "node:test";
import { validatePasswordStrength } from "../lib/utils/password";

test("validatePasswordStrength accepts a strong password", () => {
  assert.equal(validatePasswordStrength("StrongPass!2026"), null);
});

test("validatePasswordStrength rejects weak passwords with clear messages", () => {
  assert.equal(validatePasswordStrength("short1!A"), "Password must be at least 12 characters");
  assert.equal(validatePasswordStrength("Password123!"), "Password is too common");
  assert.equal(validatePasswordStrength("nouppercase1!"), "Password must include an uppercase letter");
  assert.equal(validatePasswordStrength("NOLOWERCASE1!"), "Password must include a lowercase letter");
  assert.equal(validatePasswordStrength("NoNumber!!!!"), "Password must include a number");
  assert.equal(validatePasswordStrength("NoSpecial1234"), "Password must include a special character");
});
