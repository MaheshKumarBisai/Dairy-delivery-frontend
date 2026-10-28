import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { ApiError } from '../types/api';

export interface AsyncResource<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: T | null;
  error: ApiError | null;
  /** True while a background refresh is running but stale data is on screen. */
  refreshing: boolean;
  reload: () => void;
  setData: (updater: T | ((previous: T | null) => T)) => void;
}

export interface UseAsyncOptions {
  /** Skip the request (e.g. waiting for a route param). */
  enabled?: boolean;
  /** Keep previous data visible while refetching (default true). */
  keepPreviousData?: boolean;
  /** Background polling interval in milliseconds (silent background sync). */
  pollIntervalMs?: number;
}

/** Data-fetching hook with loading / error / retry semantics, polling and request cancellation. */
export function useAsync<T>(
  fetcher: (signal: AbortSignal) => Promise<T>,
  deps: React.DependencyList,
  options: UseAsyncOptions = {},
): AsyncResource<T> {
  const { enabled = true, keepPreviousData = true, pollIntervalMs } = options;
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    const controller = new AbortController();
    let active = true;

    if (data === null || !keepPreviousData) setStatus('loading');
    else setRefreshing(true);
    setError(null);

    fetcherRef
      .current(controller.signal)
      .then((result) => {
        if (!active) return;
        setDataState(result);
        setStatus('success');
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.code === 'ABORTED') return;
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(0, 'UNKNOWN_ERROR', 'Something went wrong. Please try again.');
        setError(apiError);
        setStatus('error');
      })
      .finally(() => {
        if (active) setRefreshing(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt, enabled]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);

  // Background polling when pollIntervalMs is configured
  useEffect(() => {
    if (!enabled || !pollIntervalMs || pollIntervalMs <= 0) return;

    let active = true;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      if (!active) return;
      const pollController = new AbortController();
      try {
        const result = await fetcherRef.current(pollController.signal);
        if (active) {
          setDataState(result);
          setStatus((prev) => (prev === 'idle' || prev === 'error' ? 'success' : prev));
        }
      } catch {
        // Silent catch on background poll so existing displayed data is kept intact
      }
    };

    timerId = setInterval(poll, pollIntervalMs);

    return () => {
      active = false;
      if (timerId) clearInterval(timerId);
    };
  }, [enabled, pollIntervalMs]);

  // Rapid refresh when app returns to foreground / becomes active
  useEffect(() => {
    if (!enabled) return;
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        reload();
      }
    });
    return () => {
      sub.remove();
    };
  }, [enabled, reload]);

  const setData = useCallback((updater: T | ((previous: T | null) => T)) => {
    setDataState((previous) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T)(previous) : updater,
    );
  }, []);

  return { status, data, error, refreshing, reload, setData };
}

/** Runs an async action with pending / error handling (mutations: submit, toggle, delete). */
export function useAction<Args extends unknown[], R>(
  action: (...args: Args) => Promise<R>,
): {
  run: (...args: Args) => Promise<R | undefined>;
  pending: boolean;
  error: ApiError | null;
  reset: () => void;
} {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  const run = useCallback(async (...args: Args) => {
    setPending(true);
    setError(null);
    try {
      return await actionRef.current(...args);
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(0, 'UNKNOWN_ERROR', 'Something went wrong. Please try again.');
      setError(apiError);
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  const reset = useCallback(() => setError(null), []);
  return { run, pending, error, reset };
}

/** Polls a fetcher on an interval while `enabled` (backend has no websocket — REST polling). */
export function usePolling(
  fetcher: (signal: AbortSignal) => Promise<void>,
  intervalMs: number,
  enabled = true,
): void {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    let active = true;

    const tick = () => {
      if (!active || controller.signal.aborted) return;
      fetcherRef.current(controller.signal).catch(() => undefined);
    };

    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      active = false;
      controller.abort();
      clearInterval(id);
    };
  }, [intervalMs, enabled]);
}

/* ------------------------------------------------------------- geolocation -- */

export type GeolocationErrorCode = 1 | 2 | 3;

/** Platform-agnostic position callback. */
export type Geolocate = (
  onSuccess: (position: { latitude: number; longitude: number }) => void,
  onError: (code: GeolocationErrorCode, message: string) => void,
) => void;

let geolocator: Geolocate | null = null;

/** Apps install a native implementation (expo-location) at startup.
 *  On web the browser's navigator.geolocation is used when no provider is set. */
export function setGeolocator(fn: Geolocate | null): void {
  geolocator = fn;
}

function browserGeolocator(): Geolocate | null {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return null;
  return (onSuccess, onError) => {
    navigator.geolocation.getCurrentPosition(
      (position) => onSuccess({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
      (error) =>
        onError(
          (error.code as GeolocationErrorCode) ?? 3,
          error.message || 'Could not read your current location.',
        ),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
    );
  };
}

function resolveGeolocator(): Geolocate | null {
  return geolocator ?? browserGeolocator();
}

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
  refresh: () => void;
}

/** Best-effort device GPS. The backend always remains authoritative for assignment/distance. */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<{
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    error: string | null;
  }>({ latitude: null, longitude: null, loading: false, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const locate = resolveGeolocator();
    if (!locate) {
      setState((prev) => ({ ...prev, error: 'Location is not available on this device.' }));
      return;
    }
    let active = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    locate(
      ({ latitude, longitude }) => {
        if (!active) return;
        setState({ latitude, longitude, loading: false, error: null });
      },
      (code, message) => {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            code === 1
              ? 'Location permission denied. Enable it to see nearby orders.'
              : message || 'Could not read your current location.',
        }));
      },
    );

    return () => {
      active = false;
    };
  }, [attempt]);

  const refresh = useCallback(() => setAttempt((value) => value + 1), []);
  const supported = resolveGeolocator() !== null;
  return { ...state, supported, refresh };
}

export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
