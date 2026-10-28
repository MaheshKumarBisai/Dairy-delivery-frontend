import { apiRequest } from './http';
import type { Product } from '../types/catalog';


/** GET /api/v1/customers/favorites */
export async function getFavorites(signal?: AbortSignal): Promise<Product[]> {
  const res = await apiRequest<any>('/customers/favorites', { signal });
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.products)) return res.products;
  if (Array.isArray(res?.data?.products)) return res.data.products;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

/** GET /api/v1/customers/favorites/ids */
export function getFavoriteIds(signal?: AbortSignal): Promise<string[]> {
  return apiRequest<string[]>('/customers/favorites/ids', { signal });
}

/** POST /api/v1/customers/favorites/:productId */
export function addFavorite(productId: string): Promise<{ productId: string; isFavorite: boolean }> {
  return apiRequest<{ productId: string; isFavorite: boolean }>(
    `/customers/favorites/${encodeURIComponent(productId)}`,
    { method: 'POST' },
  );
}

/** DELETE /api/v1/customers/favorites/:productId */
export function removeFavorite(productId: string): Promise<{ productId: string; isFavorite: boolean }> {
  return apiRequest<{ productId: string; isFavorite: boolean }>(
    `/customers/favorites/${encodeURIComponent(productId)}`,
    { method: 'DELETE' },
  );
}
