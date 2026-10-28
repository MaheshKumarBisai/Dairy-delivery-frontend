import { apiRequest } from './http';
import type { AddToCartInput, CartResponse, UpdateCartItemInput } from '../types/commerce';

export interface CartQuery {
  couponCode?: string;
  addressId?: string;
}

/** GET /api/v1/cart — backend recalculates authoritative totals on every call. */
export function getCart(query: CartQuery = {}, signal?: AbortSignal): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart', { query: { ...query }, signal });
}

/** POST /api/v1/cart/items */
export function addToCart(input: AddToCartInput): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart/items', { method: 'POST', body: input });
}

/** PATCH /api/v1/cart/items/:itemId */
export function updateCartItem(itemId: string, input: UpdateCartItemInput): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: input,
  });
}

/** DELETE /api/v1/cart/items/:itemId */
export function removeCartItem(itemId: string): Promise<CartResponse> {
  return apiRequest<CartResponse>(`/cart/items/${encodeURIComponent(itemId)}`, {
    method: 'DELETE',
  });
}

/** DELETE /api/v1/cart */
export function clearCart(): Promise<CartResponse> {
  return apiRequest<CartResponse>('/cart', { method: 'DELETE' });
}
