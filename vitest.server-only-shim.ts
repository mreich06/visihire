// Next.js resolves the bare `server-only`/`client-only` specifiers via its
// own bundler, not a real npm package - Vitest (plain Vite) can't resolve
// them at all otherwise. Aliased to this no-op in vitest.config.mts so
// server-only lib files can be imported directly in tests instead of only
// ever being reachable through a full vi.mock of the whole module.
export {};
