import assert from "node:assert/strict";
import test from "node:test";
import { isSessionUsable, SESSION_EXPIRY_BUFFER_MS } from "../lib/utils/session";

test("isSessionUsable returns true when session has more than buffer remaining", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const usableAt = new Date(now.getTime() + SESSION_EXPIRY_BUFFER_MS + 1).toISOString();

  assert.equal(isSessionUsable(usableAt, now), true);
});

test("isSessionUsable returns false when session is inside safety buffer", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const nearExpiry = new Date(now.getTime() + 30_000).toISOString();

  assert.equal(isSessionUsable(nearExpiry, now), false);
});

test("isSessionUsable returns false at exact buffer boundary", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");
  const boundary = new Date(now.getTime() + SESSION_EXPIRY_BUFFER_MS).toISOString();

  assert.equal(isSessionUsable(boundary, now), false);
});
