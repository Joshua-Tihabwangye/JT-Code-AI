import { DB_CHANNEL, getBackend, type PersistBackend } from './idb';

// Typed collections stored as JSON arrays in the backend, keyed by id.
// Blobs (files, image bytes) are stored separately and referenced by key.
// Every write notifies subscribers so other tabs/contexts stay in sync.

export class JsonCollection<T extends { id: string }> {
  constructor(
    private readonly key: string,
    private readonly backend: PersistBackend = getBackend(),
  ) {}

  async all(): Promise<T[]> {
    const raw = await this.backend.get(this.key);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  async get(id: string): Promise<T | undefined> {
    return (await this.all()).find((item) => item.id === id);
  }

  async upsert(item: T): Promise<T> {
    const items = await this.all();
    const index = items.findIndex((existing) => existing.id === item.id);
    if (index >= 0) items[index] = item;
    else items.push(item);
    await this.persist(items);
    return item;
  }

  async remove(id: string): Promise<void> {
    const items = (await this.all()).filter((item) => item.id !== id);
    await this.persist(items);
  }

  async replaceAll(items: T[]): Promise<void> {
    await this.persist(items);
  }

  private async persist(items: T[]): Promise<void> {
    await this.backend.set(this.key, JSON.stringify(items));
    this.backend.post(DB_CHANNEL, this.key);
  }

  subscribe(cb: () => void): () => void {
    return this.backend.subscribe(DB_CHANNEL, (changedKey) => {
      if (changedKey === this.key) cb();
    });
  }
}

export async function readValue<T>(key: string, fallback: T): Promise<T> {
  const raw = await getBackend().get(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeValue<T>(key: string, value: T): Promise<void> {
  const backend = getBackend();
  await backend.set(key, JSON.stringify(value));
  backend.post(DB_CHANNEL, key);
}

export function subscribeKey(key: string, cb: () => void): () => void {
  return getBackend().subscribe(DB_CHANNEL, (changedKey) => {
    if (changedKey === key) cb();
  });
}

export function putBlob(ref: string, blob: Blob): Promise<void> {
  return getBackend().putBlob(ref, blob);
}

export function getBlob(ref: string): Promise<Blob | null> {
  return getBackend().getBlob(ref);
}

export function deleteBlob(ref: string): Promise<void> {
  return getBackend().deleteBlob(ref);
}

export function blobKey(prefix: string): string {
  return `${prefix}:${crypto.randomUUID()}`;
}
