import { getBackend } from './idb';

// Versioned schema + migration support (FE-115) and demo reset utility (FE-116).
// New migrations are appended to `runMigrations` and guarded by version so the
// mock database can evolve without wiping user data.

export const SCHEMA_VERSION = 1;

const VERSION_KEY = 'jtcode:schema-version';

export async function runMigrations(): Promise<void> {
  const backend = getBackend();
  const raw = await backend.get(VERSION_KEY);
  const current = raw ? Number(JSON.parse(raw)) : 0;
  if (current >= SCHEMA_VERSION) return;

  // --- migration v0 -> v1 ---
  // (Initial schema. Future migrations would mutate collections here.)

  await backend.set(VERSION_KEY, JSON.stringify(SCHEMA_VERSION));
}

export async function getCurrentSchemaVersion(): Promise<number> {
  const raw = await getBackend().get(VERSION_KEY);
  return raw ? Number(JSON.parse(raw)) : 0;
}

export async function resetDemoData(): Promise<void> {
  await getBackend().clearAll();
}
