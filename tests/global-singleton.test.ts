import assert from "node:assert/strict";
import test from "node:test";
import { getGlobalSingleton } from "../lib/utils/global-singleton";

test("getGlobalSingleton creates value once and reuses it", () => {
  const key = `__test_singleton_${Date.now()}_${Math.random()}`;
  let factoryCalls = 0;

  const first = getGlobalSingleton(key, () => {
    factoryCalls += 1;
    return { id: 1 };
  });

  const second = getGlobalSingleton(key, () => {
    factoryCalls += 1;
    return { id: 2 };
  });

  assert.equal(factoryCalls, 1);
  assert.equal(first, second);

  delete (globalThis as Record<string, unknown>)[key];
});
