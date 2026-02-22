import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("globals.css enforces readable form control text colors", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /input,\s*textarea,\s*select\s*\{/);
  assert.match(css, /background-color:\s*#ffffff;/);
  assert.match(css, /color:\s*#111827;/);
  assert.match(css, /caret-color:\s*#111827;/);
});
