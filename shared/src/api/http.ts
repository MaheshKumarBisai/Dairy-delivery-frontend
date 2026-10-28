/** Shared HTTP transport for the DairyFresh apps.
 *
 *  Responsibilities:
 *  - Build URLs against the configured backend base URL
 *  - Attach the Bearer access token (backend is the only authority for identity/role)
 *  - Unwrap the backend envelope { success, data, message }
 *  - Map failures to a typed ApiError using the backend error envelope
 *  - Transparent, single-flight access-token refresh on 401 (POST /auth/refresh)
 *
 *  It never contains secrets, business rules, prices or authorization decisions.
 */

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config';
import { ApiError, ApiEnvelope } from '../types/api';
import type { TokenPair } from '../types/auth';
import type { SessionStore } from './session';

export type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Attach the Bearer token (default true). */
  auth?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Internal: prevents recursive refresh attempts. */
  skipRefresh?: boolean;
}

interface HttpConfig {
  baseUrl: string;
  session: SessionStore | null;
  onUnauthorized?: () => void;
}

const config: HttpConfig = { baseUrl: API_BASE_URL, session: null };

export function configureHttp(next: Partial<HttpConfig>): void {
  Object.assign(config, next);
}

export function getHttpSession(): SessionStore | null {
  return config.session;
}

function origin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return 'http://localhost:4000';
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const base = config.baseUrl.replace(/\/+$/, '');
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;

  // Relative base (legacy dev proxy) stays relative so a proxy can handle it.
  if (base.startsWith('/')) {
    const search = buildSearch(query);
    return `${base}${normalisedPath}${search}`;
  }

  const url = new URL(`${base}${normalisedPath}`, origin());
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

function buildSearch(query?: Record<string, QueryValue>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  const search = params.toString();
  return search ? `?${search}` : '';
}

function extractError(status: number, payload: unknown): ApiError {
  const fallbackCode =
    status === 0
      ? 'NETWORK_ERROR'
      : status === 401
        ? 'UNAUTHORIZED'
        : status === 403
          ? 'FORBIDDEN'
          : status === 404
            ? 'NOT_FOUND'
            : status >= 500
              ? 'SERVER_ERROR'
              : 'REQUEST_FAILED';

  if (payload && typeof payload === 'object') {
    const body = payload as { error?: { code?: string; message?: string }; message?: string };
    if (body.error?.message) {
      return new ApiError(status, body.error.code || fallbackCode, body.error.message);
    }
    if (typeof body.message === 'string') {
      return new ApiError(status, fallbackCode, body.message);
    }
  }

  const message =
    status === 0
      ? 'Cannot reach the DairyFresh server. Check your connection and try again.'
      : status >= 500
        ? 'The DairyFresh server had a problem. Please try again.'
        : 'Request failed. Please try again.';

  return new ApiError(status, fallbackCode, message);
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const session = config.session;
  if (!session) return false;
  const tokens = session.getTokens();
  if (!tokens?.refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const response = await fetch(buildUrl('/auth/refresh'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });
        if (!response.ok) return false;
        const payload = (await response.json()) as ApiEnvelope<TokenPair>;
        if (!payload?.success || !payload.data?.accessToken) return false;
        session.setTokens({
          accessToken: payload.data.accessToken,
          refreshToken: payload.data.refreshToken || payload.data.accessToken,
        });
        return true;
      } catch {
        return false;
      } finally {
        // Release the shared promise after all waiting callers settled.
        setTimeout(() => {
          refreshInFlight = null;
        }, 0);
      }
    })();
  }

  return refreshInFlight;
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = 'GET', body, query, auth = true, timeoutMs = REQUEST_TIMEOUT_MS } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  if (auth) {
    const tokens = config.session?.getTokens();
    if (tokens?.accessToken) headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const externalSignal = options.signal;
  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener('abort', onExternalAbort, { once: true });
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    if (externalSignal?.aborted) throw new ApiError(499, 'ABORTED', 'Request cancelled');
    const aborted = (error as Error)?.name === 'AbortError';
    throw new ApiError(
      0,
      aborted ? 'TIMEOUT' : 'NETWORK_ERROR',
      aborted
        ? 'The request took too long. Please try again.'
        : 'Cannot reach the DairyFresh server. Check your connection and try again.',
    );
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', onExternalAbort);
  }

  let payload: unknown = null;
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status !== 204 && contentType.includes('application/json')) {
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
  }

  if (!response.ok) throw extractError(response.status, payload);

  if (payload && typeof payload === 'object' && 'success' in payload) {
    const envelope = payload as ApiEnvelope<T>;
    return envelope.data as T;
  }
  return payload as T;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    return await rawRequest<T>(path, options);
  } catch (error) {
    const canRetry =
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth !== false &&
      !options.skipRefresh;

    if (canRetry) {
      const refreshed = await refreshTokens();
      if (refreshed) {
        return rawRequest<T>(path, { ...options, skipRefresh: true });
      }
      config.session?.clear();
      config.onUnauthorized?.();
    }
    throw error;
  }
}
