// crypto.randomUUID() is built into every modern browser, so we skip the
// `uuid` package entirely — one less dependency for something the platform
// already gives us for free.
export function generateId(): string {
  return crypto.randomUUID();
}
