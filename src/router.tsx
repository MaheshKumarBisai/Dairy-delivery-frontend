import { useCallback, type ReactNode } from 'react';
import {
  Link as ExpoLink,
  Redirect,
  router,
  useLocalSearchParams,
  usePathname,
  type Href,
} from 'expo-router';

/**
 * Thin react-router-compatible facade over Expo Router.
 *
 * The DairyFresh screens were written against react-router-dom (`Link`,
 * `useNavigate`, `useParams`, `useLocation`, `useSearchParams`, `Navigate`).
 * This module keeps those call-sites working while the router underneath is
 * Expo Router. No react-router runtime is involved.
 */

export interface AppLocation {
  pathname: string;
  search: string;
  state: unknown;
}

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export type Navigate = (to: string | number, options?: NavigateOptions) => void;

export function useNavigate(): Navigate {
  const pathname = usePathname();
  return useCallback<Navigate>((to, options) => {
    if (typeof to === 'number') {
      if (to < 0) {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/home');
        }
      }
      return;
    }
    if (!to) return;
    try {
      const target = (typeof to === 'string' ? to.split('?')[0] : '').replace(/\/+$/, '') || '/';
      const current = (pathname || '').split('?')[0].replace(/\/+$/, '') || '/';
      if (
        target === current ||
        (target === '/home' && current === '/') ||
        (target === '/' && current === '/home')
      ) {
        return;
      }

      if (options?.replace) router.replace(to as Href);
      else router.push(to as Href);
    } catch {
      /* ignore malformed navigation targets */
    }
  }, [pathname]);
}

export function useParams<
  T extends Record<string, string | undefined> = Record<string, string | undefined>,
>(): T {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const out: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    out[key] = Array.isArray(value) ? value[0] : value;
  }
  return out as T;
}

/** Splits Expo Router params into "query params" by dropping values that are
 *  actually path segments of the current pathname. */
function queryParams(): URLSearchParams {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const pathname = usePathname();
  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (typeof single !== 'string' || single === '') continue;
    if (segments.includes(single)) continue;
    query.append(key, single);
  }
  return query;
}

export function useLocation(): AppLocation {
  const pathname = usePathname();
  const query = queryParams().toString();
  return { pathname, search: query ? `?${query}` : '', state: null };
}

type SetSearchParams = (
  next:
    | URLSearchParams
    | Record<string, string | null>
    | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | null>),
  options?: { replace?: boolean },
) => void;

export function useSearchParams(): [URLSearchParams, SetSearchParams] {
  const params = queryParams();
  const setSearchParams: SetSearchParams = (next) => {
    const resolved =
      typeof next === 'function'
        ? next(new URLSearchParams(params))
        : next instanceof URLSearchParams
          ? Object.fromEntries(next.entries())
          : next;
    // Replace semantics: clear every existing query key, then apply `resolved`.
    const patch: Record<string, string | undefined> = {};
    for (const key of new Set(params.keys())) patch[key] = undefined;
    for (const [key, value] of Object.entries(resolved)) {
      patch[key] = value ?? undefined;
    }
    try {
      router.setParams(patch);
    } catch {
      /* ignore malformed query updates */
    }
  };
  return [params, setSearchParams];
}

interface LinkProps {
  to: string;
  replace?: boolean;
  state?: unknown;
  className?: string;
  children?: ReactNode;
  onPress?: () => void;
}

export function Link({ to, replace, state, className, children, onPress }: LinkProps) {
  void state;
  void className;
  return (
    <ExpoLink href={to as Href} replace={replace} onPress={onPress}>
      {children}
    </ExpoLink>
  );
}

export function Navigate(props: { to: string; replace?: boolean; state?: unknown }) {
  return <Redirect href={props.to as Href} />;
}
