import assert from "node:assert/strict";
import test from "node:test";
import { hashSsn, verifySsnHash } from "../lib/utils/ssn";

test("hashSsn does not return plaintext and can be verified", async () => {
  const ssn = "123456789";
  const hashed = await hashSsn(ssn);

  assert.notEqual(hashed, ssn);
  assert.equal(await verifySsnHash(ssn, hashed), true);
  assert.equal(await verifySsnHash("000000000", hashed), false);
});
