/** Resolved API configuration for both DairyFresh apps.
 *  No secrets are ever stored here — only the public REST base URL.
 *
 *  Expo inlines `process.env.EXPO_PUBLIC_*` at bundle time (Metro), so the same
 *  expression works on iOS, Android and web. There is no dev-server proxy in
 *  Expo, therefore the development default is the backend itself; the backend
 *  enables CORS for every origin (`app.enableCors({ origin: true })`).
 */

function resolveBaseUrl(): string {
  const raw =
    typeof process !== 'undefined'
      ? process.env.EXPO_PUBLIC_API_URL ?? process.env.VITE_API_BASE_URL
      : undefined;
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '');
  if (trimmed) return trimmed;

  // Try extracting the development machine's IP address from Expo's packager hostUri
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Constants = require('expo-constants');
    const c = Constants.default ?? Constants;
    const uri = c?.expoConfig?.hostUri ?? c?.manifest2?.extra?.expoGo?.debuggerHost;
    if (typeof uri === 'string') {
      const host = uri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:4000/api/v1`;
      }
    }
  } catch {
    // Not running in an Expo environment
  }

  // Development default: local NestJS backend
  return 'http://192.168.0.5:4000/api/v1';
}

export const API_BASE_URL = resolveBaseUrl();

/** Milliseconds before a request is aborted. */
export const REQUEST_TIMEOUT_MS = 20000;

/** Default polling cadence for "realtime" views (backend has no websocket). */
export const POLL_INTERVAL_MS = 5000;
