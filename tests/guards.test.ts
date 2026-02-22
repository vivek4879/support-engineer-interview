import assert from "node:assert/strict";
import test from "node:test";
import { TRPCError } from "@trpc/server";
import { requireEntity } from "../lib/utils/guards";

test("requireEntity returns value when present", () => {
  const value = { id: 1 };
  assert.equal(requireEntity(value, "should not fail"), value);
});

test("requireEntity throws internal server error when value is missing", () => {
  assert.throws(
    () => requireEntity(undefined, "Failed to create account"),
    (error) =>
      error instanceof TRPCError &&
      error.code === "INTERNAL_SERVER_ERROR" &&
      error.message === "Failed to create account"
  );
});
