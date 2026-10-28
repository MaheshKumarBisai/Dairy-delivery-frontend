/** Envelope and transport types that mirror the NestJS backend contract:
 *  success => { success, data, message }
 *  failure => { success: false, error: { code, message } }  (see src/common/filters/all-exceptions.filter.ts) */

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  error: { code: string; message: string };
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

/** Error thrown by the shared HTTP client for every failed request. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }

  /** True when the user's session is no longer usable. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True when the caller is not allowed to see the resource (role/tenant). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidation(): boolean {
    return this.status === 400 || this.status === 422;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

/** Normalised async view state used by screens (loading / empty / error / success). */
export type AsyncState<T> =
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: T | null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: T | null; error: ApiError };
