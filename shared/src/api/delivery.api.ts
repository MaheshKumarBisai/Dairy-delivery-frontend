import { apiRequest } from './http';
import type {
  AssignedDelivery,
  AvailableDeliveriesQuery,
  AvailableDeliveriesResponse,
  DeliveryPartnerProfile,
  DeliveryPartnerEarnings,
  DeliveryPartnerRatings,
  UpdateDeliveryStatusInput,
  UpdateLocationInput,
} from '../types/delivery';

/** GET /api/v1/deliveries/partner/available — proximity-filtered open orders (backend computes distance). */
export function listAvailableDeliveries(
  query: AvailableDeliveriesQuery = {},
  signal?: AbortSignal,
): Promise<AvailableDeliveriesResponse> {
  return apiRequest<AvailableDeliveriesResponse>('/deliveries/partner/available', {
    query: { ...query },
    signal,
  });
}

/** POST /api/v1/deliveries/partner/accept/:orderId — atomically claims the order. */
export function acceptDelivery(orderId: string): Promise<AssignedDelivery> {
  return apiRequest<AssignedDelivery>(
    `/deliveries/partner/accept/${encodeURIComponent(orderId)}`,
    { method: 'POST' },
  );
}

/** POST /api/v1/deliveries/partner/reject/:orderId — rejects an available or assigned order. */
export function rejectDelivery(orderId: string): Promise<unknown> {
  return apiRequest(
    `/deliveries/partner/reject/${encodeURIComponent(orderId)}`,
    { method: 'POST' },
  );
}

/** PUT /api/v1/deliveries/partner/location — push live GPS (backend stores it). */
export function updatePartnerLocation(input: UpdateLocationInput): Promise<{
  deliveryPartnerId: string;
  currentLatitude: number;
  currentLongitude: number;
  lastLocationAt: string;
}> {
  return apiRequest('/deliveries/partner/location', { method: 'PUT', body: input });
}

/** GET /api/v1/deliveries/partner/assigned — my deliveries, optionally filtered by status. */
export function listAssignedDeliveries(
  status?: string,
  signal?: AbortSignal,
): Promise<AssignedDelivery[]> {
  return apiRequest<AssignedDelivery[]>('/deliveries/partner/assigned', {
    query: status ? { status } : {},
    signal,
  });
}

/** PATCH /api/v1/deliveries/partner/status/:orderId — lifecycle transitions. */
export function updateDeliveryStatus(
  orderId: string,
  input: UpdateDeliveryStatusInput,
): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(
    `/deliveries/partner/status/${encodeURIComponent(orderId)}`,
    { method: 'PATCH', body: input },
  );
}

/** GET /api/v1/delivery-partners/me — own profile incl. merchant + availability. */
export function getPartnerProfile(signal?: AbortSignal): Promise<DeliveryPartnerProfile> {
  return apiRequest<DeliveryPartnerProfile>('/delivery-partners/me', { signal });
}

/** PUT /api/v1/delivery-partners/me/availability — online / offline. */
export function setAvailability(isAvailable: boolean): Promise<{
  deliveryPartnerId: string;
  isAvailable: boolean;
  updatedAt: string;
}> {
  return apiRequest('/delivery-partners/me/availability', {
    method: 'PUT',
    body: { isAvailable },
  });
}

/** GET /api/v1/delivery-partners/me/earnings — computed earnings, daily totals & payout history. */
export function getPartnerEarnings(signal?: AbortSignal): Promise<DeliveryPartnerEarnings> {
  return apiRequest<DeliveryPartnerEarnings>('/delivery-partners/me/earnings', { signal });
}

/** GET /api/v1/delivery-partners/me/ratings — rating breakdown, customer reviews & badges. */
export function getPartnerRatings(signal?: AbortSignal): Promise<DeliveryPartnerRatings> {
  return apiRequest<DeliveryPartnerRatings>('/delivery-partners/me/ratings', { signal });
}
