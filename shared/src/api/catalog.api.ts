import { apiRequest } from './http';
import type { Category, Product, ProductQuery, PublicMerchant } from '../types/catalog';
import type { Pagination } from '../types/api';

export interface ProductListResponse {
  products: Product[];
  pagination: Pagination;
}

/** GET /api/v1/products — public browse API (Section 14A). */
export function listProducts(query: ProductQuery = {}, signal?: AbortSignal): Promise<ProductListResponse> {
  return apiRequest<ProductListResponse>('/products', {
    query: { ...query },
    auth: false,
    signal,
  });
}

/** GET /api/v1/products/:productId */
export function getProduct(productId: string, signal?: AbortSignal): Promise<Product> {
  return apiRequest<Product>(`/products/${encodeURIComponent(productId)}`, {
    auth: false,
    signal,
  });
}

/** GET /api/v1/categories — public. */
export function listCategories(signal?: AbortSignal): Promise<Category[]> {
  return apiRequest<Category[]>('/categories', { auth: false, signal });
}

/** GET /api/v1/merchants/public — multi-tenant storefront list (no coordinates exposed). */
export function listMerchants(signal?: AbortSignal): Promise<PublicMerchant[]> {
  return apiRequest<PublicMerchant[]>('/merchants/public', { auth: false, signal });
}

/** GET /api/v1/merchants/public/:merchantId */
export function getMerchant(merchantId: string, signal?: AbortSignal): Promise<PublicMerchant> {
  return apiRequest<PublicMerchant>(`/merchants/public/${encodeURIComponent(merchantId)}`, {
    auth: false,
    signal,
  });
}
