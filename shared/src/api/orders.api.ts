import { apiRequest } from './http';
import type { CheckoutInput, Order, OrderStatus } from '../types/commerce';
import type { Pagination } from '../types/api';
import type { CustomerDashboard } from '../types/commerce';

export interface OrderListResponse {
  orders: Order[];
  pagination: Pagination;
}

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  date?: string;
}

/** POST /api/v1/orders/checkout — converts the cart into authoritative orders. */
export function checkout(input: CheckoutInput): Promise<Order | Order[]> {
  return apiRequest<Order | Order[]>('/orders/checkout', { method: 'POST', body: input });
}

/** GET /api/v1/orders — the signed-in customer's own history. */
export function listOrders(query: OrderQuery = {}, signal?: AbortSignal): Promise<OrderListResponse> {
  return apiRequest<OrderListResponse>('/orders', { query: { ...query }, signal });
}

/** GET /api/v1/orders/:orderId */
export function getOrder(orderId: string, signal?: AbortSignal): Promise<Order> {
  return apiRequest<Order>(`/orders/${encodeURIComponent(orderId)}`, { signal });
}

/** POST /api/v1/orders/:orderId/cancel */
export function cancelOrder(orderId: string, reason?: string): Promise<Order> {
  return apiRequest<Order>(`/orders/${encodeURIComponent(orderId)}/cancel`, {
    method: 'POST',
    body: { reason },
  });
}

/** GET /api/v1/customers/dashboard — recent orders, active plans, addresses. */
export function getDashboard(signal?: AbortSignal): Promise<CustomerDashboard> {
  return apiRequest<CustomerDashboard>('/customers/dashboard', { signal });
}
