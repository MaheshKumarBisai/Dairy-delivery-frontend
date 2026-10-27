import { useMemo } from 'react';
import {
  deliveryApi,
  useAsync,
  type ApiError,
  type AvailableOrder,
  type AssignedDelivery,
} from '@dairy/shared';

export interface DeliveryOrderState {
  status: 'loading' | 'success' | 'error';
  assigned: AssignedDelivery | null;
  available: AvailableOrder | null;
  error: ApiError | null;
  reload: () => void;
}

/**
 * Resolves one order for the delivery app. An order is either already assigned
 * to this partner (`GET /deliveries/partner/assigned`) or still open
 * (`GET /deliveries/partner/available`) — the backend is the only authority.
 */
export function useDeliveryOrder(orderId: string, enabled = true): DeliveryOrderState {
  const assigned = useAsync(
    (signal) => deliveryApi.listAssignedDeliveries(undefined, signal),
    [orderId],
    { enabled: enabled && Boolean(orderId), pollIntervalMs: 3000 },
  );

  const available = useAsync(
    (signal) => deliveryApi.listAvailableDeliveries({ limit: 50 }, signal),
    [orderId],
    { enabled: enabled && Boolean(orderId), pollIntervalMs: 3000 },
  );

  const status: DeliveryOrderState['status'] =
    assigned.status === 'error' && available.status === 'error'
      ? 'error'
      : assigned.status === 'loading' || available.status === 'loading'
        ? 'loading'
        : 'success';

  const assignedRow = useMemo(
    () => (assigned.data ?? []).find((row) => row.orderId === orderId) ?? null,
    [assigned.data, orderId],
  );

  const availableRow = useMemo(
    () => (available.data?.orders ?? []).find((row) => row.orderId === orderId) ?? null,
    [available.data, orderId],
  );

  return {
    status,
    assigned: assignedRow,
    available: availableRow,
    error: assigned.error ?? available.error,
    reload: () => {
      assigned.reload();
      available.reload();
    },
  };
}
