export function getGlobalSingleton<T>(key: string, factory: () => T): T {
  const globalRecord = globalThis as Record<string, unknown>;

  if (!(key in globalRecord)) {
    globalRecord[key] = factory();
  }

  return globalRecord[key] as T;
}
