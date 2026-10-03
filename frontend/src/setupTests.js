import '@testing-library/jest-dom/vitest';

// Node's built-in webstorage global can shadow jsdom's; install a plain in-memory one.
if (typeof globalThis.localStorage?.clear !== 'function') {
  const store = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    },
  });
}
