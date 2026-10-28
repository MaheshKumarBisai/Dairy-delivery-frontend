/** Cross-platform key/value storage used by the session store.
 *
 *  - Web (react-native-web): reads/writes `window.localStorage` directly.
 *  - Native (iOS/Android): an app installs an async backend (AsyncStorage) and
 *    calls `hydrateStorage()` once at startup; after hydration all reads are
 *    served synchronously from an in-memory mirror.
 *
 *  No DOM globals are touched without a guard, and no secrets are logged.
 */

export interface StorageBackend {
  /** Returns every persisted key/value pair (used to hydrate the memory mirror). */
  getAll(): Promise<Record<string, string>>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

const memory = new Map<string, string>();
let backend: StorageBackend | null = null;
let hydrated = false;

function hasLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const probe = '__dairy_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

const localBackend: StorageBackend | null = hasLocalStorage()
  ? {
      async getAll() {
        const out: Record<string, string> = {};
        try {
          const storage = window.localStorage;
          for (let i = 0; i < storage.length; i += 1) {
            const key = storage.key(i);
            if (key === null) continue;
            const value = storage.getItem(key);
            if (value !== null) out[key] = value;
          }
        } catch {
          /* private mode — treat as empty */
        }
        return out;
      },
      async set(key, value) {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* quota / private mode — session simply will not persist */
        }
      },
      async remove(key) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      },
    }
  : null;

backend = localBackend;

/** Installs an async backend (AsyncStorage on native). Call before hydrating. */
export function configureStorage(next: StorageBackend | null): void {
  backend = next ?? localBackend;
  hydrated = false;
}

/** Loads persisted values into the synchronous mirror. Call once at app startup. */
export async function hydrateStorage(): Promise<void> {
  if (hydrated) return;
  hydrated = true;
  if (!backend) return;
  try {
    const all = await backend.getAll();
    Object.entries(all).forEach(([key, value]) => memory.set(key, value));
  } catch {
    /* keep whatever is already in memory */
  }
}

export function storageRead(key: string): string | null {
  return memory.get(key) ?? null;
}

export function storageWrite(key: string, value: string): void {
  memory.set(key, value);
  void backend?.set(key, value);
}

export function storageRemove(key: string): void {
  memory.delete(key);
  void backend?.remove(key);
}
