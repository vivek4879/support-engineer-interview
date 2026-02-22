import assert from "node:assert/strict";
import test from "node:test";
import { getSessionTokenFromRequest, parseCookies } from "../lib/utils/cookies";

test("parseCookies handles multiple cookie pairs", () => {
  const cookies = parseCookies("foo=bar; session=abc123; theme=dark");
  assert.equal(cookies.foo, "bar");
  assert.equal(cookies.session, "abc123");
  assert.equal(cookies.theme, "dark");
});

test("getSessionTokenFromRequest reads from fetch-style headers", () => {
  const token = getSessionTokenFromRequest({
    headers: {
      get(name: string) {
        return name === "cookie" ? "session=token-xyz; foo=bar" : null;
      },
    },
  });

  assert.equal(token, "token-xyz");
});
