// Low-level IndexedDB persistence shim. IDBRequest is invariant across its type
// parameter, so the internal request helper works with `IDBRequest<any>`.
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Low-level persistence backend used by the mock repositories.
// Large entities (conversations, messages, files, documents, images) live in
// IndexedDB; binary blobs are stored separately. When IndexedDB is unavailable
// (e.g. jsdom test environment) we transparently fall back to an in-memory
// backend so the repositories remain fully testable.

export interface PersistBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  keys(): Promise<string[]>;
  putBlob(key: string, blob: Blob): Promise<void>;
  getBlob(key: string): Promise<Blob | null>;
  deleteBlob(key: string): Promise<void>;
  clearAll(): Promise<void>;
  // Notify subscribers (other contexts for native, same context for memory).
  post(channel: string, key: string): void;
  subscribe(channel: string, cb: (key: string) => void): () => void;
}

const DB_NAME = 'jtcode-mock-db';
const DB_VERSION = 1;
const KV_STORE = 'kv';
const BLOB_STORE = 'blobs';

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

class NativeBackend implements PersistBackend {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private channels = new Map<string, BroadcastChannel>();

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(KV_STORE)) db.createObjectStore(KV_STORE);
        if (!db.objectStoreNames.contains(BLOB_STORE)) db.createObjectStore(BLOB_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'));
    });
    return this.dbPromise;
  }

  private tx(store: string, mode: IDBTransactionMode): Promise<IDBObjectStore> {
    return this.open().then((db) => db.transaction(store, mode).objectStore(store));
  }

  private req<T>(produce: () => IDBRequest<any>): Promise<T> {
    return new Promise((resolve, reject) => {
      const request = produce();
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'));
    });
  }

  async get(key: string): Promise<string | null> {
    const store = await this.tx(KV_STORE, 'readonly');
    return this.req<string | null>(() => store.get(key));
  }

  async set(key: string, value: string): Promise<void> {
    const store = await this.tx(KV_STORE, 'readwrite');
    await this.req(() => store.put(value, key));
  }

  async delete(key: string): Promise<void> {
    const store = await this.tx(KV_STORE, 'readwrite');
    await this.req(() => store.delete(key));
  }

  async keys(): Promise<string[]> {
    const store = await this.tx(KV_STORE, 'readonly');
    return this.req<string[]>(() => store.getAllKeys());
  }

  async putBlob(key: string, blob: Blob): Promise<void> {
    const store = await this.tx(BLOB_STORE, 'readwrite');
    await this.req(() => store.put(blob, key));
  }

  async getBlob(key: string): Promise<Blob | null> {
    const store = await this.tx(BLOB_STORE, 'readonly');
    return this.req<Blob | null>(() => store.get(key));
  }

  async deleteBlob(key: string): Promise<void> {
    const store = await this.tx(BLOB_STORE, 'readwrite');
    await this.req(() => store.delete(key));
  }

  async clearAll(): Promise<void> {
    const db = await this.open();
    await this.req(() => db.transaction([KV_STORE, BLOB_STORE], 'readwrite').objectStore(KV_STORE).clear());
    await this.req(() => db.transaction([KV_STORE, BLOB_STORE], 'readwrite').objectStore(BLOB_STORE).clear());
  }

  post(channel: string, key: string): void {
    let bc = this.channels.get(channel);
    if (!bc) {
      bc = new BroadcastChannel(channel);
      this.channels.set(channel, bc);
    }
    bc.postMessage(key);
  }

  subscribe(channel: string, cb: (key: string) => void): () => void {
    let bc = this.channels.get(channel);
    if (!bc) {
      bc = new BroadcastChannel(channel);
      this.channels.set(channel, bc);
    }
    bc.onmessage = (event: MessageEvent) => cb(event.data as string);
    return () => {
      bc.onmessage = null;
    };
  }
}

class MemoryBackend implements PersistBackend {
  private kv = new Map<string, string>();
  private blobs = new Map<string, Blob>();
  private listeners = new Set<(key: string) => void>();

  get(key: string): Promise<string | null> {
    return Promise.resolve(this.kv.get(key) ?? null);
  }

  set(key: string, value: string): Promise<void> {
    this.kv.set(key, value);
    this.emit(key);
    return Promise.resolve();
  }

  delete(key: string): Promise<void> {
    this.kv.delete(key);
    this.emit(key);
    return Promise.resolve();
  }

  keys(): Promise<string[]> {
    return Promise.resolve([...this.kv.keys()]);
  }

  putBlob(key: string, blob: Blob): Promise<void> {
    this.blobs.set(key, blob);
    return Promise.resolve();
  }

  getBlob(key: string): Promise<Blob | null> {
    return Promise.resolve(this.blobs.get(key) ?? null);
  }

  deleteBlob(key: string): Promise<void> {
    this.blobs.delete(key);
    return Promise.resolve();
  }

  clearAll(): Promise<void> {
    this.kv.clear();
    this.blobs.clear();
    return Promise.resolve();
  }

  post(_channel: string, _key: string): void {
    // Same-context notification already happened in set()/delete().
  }

  subscribe(_channel: string, cb: (key: string) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private emit(key: string): void {
    this.listeners.forEach((cb) => cb(key));
  }
}

let backend: PersistBackend | null = null;

export function getBackend(): PersistBackend {
  if (!backend) {
    backend = hasIndexedDb() ? new NativeBackend() : new MemoryBackend();
  }
  return backend;
}

export const DB_CHANNEL = 'jtcode-db-sync';
