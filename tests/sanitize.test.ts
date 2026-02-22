import assert from "node:assert/strict";
import test from "node:test";
import { escapeHtml } from "../lib/utils/sanitize";

test("escapeHtml neutralizes dangerous HTML/script content", () => {
  const payload = `<img src=x onerror="alert('xss')"><script>alert(1)</script>`;
  const escaped = escapeHtml(payload);

  assert.equal(escaped.includes("<script>"), false);
  assert.equal(escaped.includes("<img"), false);
  assert.equal(escaped.includes("&lt;script&gt;"), true);
  assert.equal(escaped.includes("&lt;img"), true);
});
