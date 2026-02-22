import assert from "node:assert/strict";
import test from "node:test";
import { validateDateOfBirth } from "../lib/utils/date-of-birth";

test("validateDateOfBirth rejects future dates", () => {
  const now = new Date("2026-02-22T00:00:00.000Z");
  assert.equal(validateDateOfBirth("2026-12-01", now), "Date of birth cannot be in the future");
});

test("validateDateOfBirth rejects underage users", () => {
  const now = new Date("2026-02-22T00:00:00.000Z");
  assert.equal(validateDateOfBirth("2010-01-01", now), "You must be at least 18 years old");
});

test("validateDateOfBirth accepts users who are at least 18", () => {
  const now = new Date("2026-02-22T00:00:00.000Z");
  assert.equal(validateDateOfBirth("2000-01-01", now), null);
  assert.equal(validateDateOfBirth("2008-02-22", now), null);
});

test("validateDateOfBirth rejects invalid formats and impossible dates", () => {
  const now = new Date("2026-02-22T00:00:00.000Z");
  assert.equal(validateDateOfBirth("01-01-2000", now), "Date of birth must be in YYYY-MM-DD format");
  assert.equal(validateDateOfBirth("2026-02-31", now), "Date of birth is invalid");
});
