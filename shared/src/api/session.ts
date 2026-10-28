/** Per-app token/session persistence.
 *  Each frontend namespaces its own storage keys so the Customer and Delivery apps
 *  can never read each other's session even if they share an origin.
 *
 *  Backed by the cross-platform storage layer (localStorage on web, async
 *  backend hydrated at startup on native) — see ./storage.ts. */

import { storageRead, storageRemove, storageWrite } from './storage';

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
}

export interface SessionStore {
  readonly namespace: string;
  getTokens(): TokenBundle | null;
  setTokens(tokens: TokenBundle): void;
  clear(): void;
  getUser<T>(): T | null;
  setUser<T>(user: T): void;
  isAuthenticated(): boolean;
}

export function createSessionStore(namespace: string): SessionStore {
  const tokensKey = `${namespace}.tokens`;
  const userKey = `${namespace}.user`;

  const read = <T>(key: string): T | null => {
    try {
      const raw = storageRead(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  };

  const write = (key: string, value: unknown): void => {
    try {
      storageWrite(key, JSON.stringify(value));
    } catch {
      /* quota / private mode — session simply will not persist */
    }
  };

  return {
    namespace,
    getTokens: () => read<TokenBundle>(tokensKey),
    setTokens: (tokens) => write(tokensKey, tokens),
    clear: () => {
      storageRemove(tokensKey);
      storageRemove(userKey);
    },
    getUser: <T>() => read<T>(userKey),
    setUser: <T>(user: T) => write(userKey, user),
    isAuthenticated: () => Boolean(read<TokenBundle>(tokensKey)?.accessToken),
  };
}
