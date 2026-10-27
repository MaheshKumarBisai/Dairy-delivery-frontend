import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStorage, type StorageBackend } from '@dairy/shared';

/** AsyncStorage-backed persistence for native platforms. On web the shared
 *  layer already defaults to `window.localStorage`, so this backend is only
 *  installed when no localStorage is available (iOS/Android). */

const asyncBackend: StorageBackend = {
  async getAll() {
    const out: Record<string, string> = {};
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pairs = await AsyncStorage.multiGet(keys);
      pairs.forEach(([key, value]) => {
        if (value !== null) out[key] = value;
      });
    } catch {
      /* treat as empty */
    }
    return out;
  },
  async set(key, value) {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      /* quota / private mode — session simply will not persist */
    }
  },
  async remove(key) {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

function hasLocalStorage(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    window.localStorage.setItem('__dairy_probe__', '1');
    window.localStorage.removeItem('__dairy_probe__');
    return true;
  } catch {
    return false;
  }
}

/** Call once before `hydrateStorage()`. */
export function configureAppStorage(): void {
  if (!hasLocalStorage()) configureStorage(asyncBackend);
}
