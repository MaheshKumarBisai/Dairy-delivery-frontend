import { apiRequest } from './http';
import type { Notification } from '../types/commerce';
import type { CouponValidation } from '../types/commerce';
import type { OrderPayment } from '../types/commerce';

/** GET /api/v1/notifications — current user's notifications (most recent 20). */
export function listNotifications(signal?: AbortSignal): Promise<Notification[]> {
  return apiRequest<Notification[]>('/notifications', { signal });
}

/** PATCH /api/v1/notifications/:id/read */
export function markNotificationRead(id: string): Promise<unknown> {
  return apiRequest<unknown>(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' });
}

/** POST /api/v1/coupons/validate — public, authoritative discount calculation. */
export function validateCoupon(input: {
  code: string;
  subtotal?: number;
  merchantId?: string;
}): Promise<CouponValidation> {
  return apiRequest<CouponValidation>('/coupons/validate', { method: 'POST', body: input, auth: false });
}

/** POST /api/v1/payments/intent — server-controlled payment intent (mock provider). */
export function createPaymentIntent(input: {
  orderId: string;
  method?: 'ONLINE' | 'CASH_ON_DELIVERY' | 'WALLET';
  idempotencyKey?: string;
}): Promise<{
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}> {
  return apiRequest('/payments/intent', { method: 'POST', body: input });
}

/** GET /api/v1/payments/order/:orderId */
export function getPaymentForOrder(orderId: string): Promise<OrderPayment> {
  return apiRequest<OrderPayment>(`/payments/order/${encodeURIComponent(orderId)}`);
}
