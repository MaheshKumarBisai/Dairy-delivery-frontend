import type { DeliveryStatus, OrderStatus, PaymentStatus, PlanStatus } from '../types/commerce';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'slate' | 'solid' | 'lime';

const currencyFormatters = new Map<string, Intl.NumberFormat>();

export function formatCurrency(amount: number, currency = 'INR'): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  const key = `${currency}`;
  let formatter = currencyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: safe % 1 === 0 ? 0 : 2,
    });
    currencyFormatters.set(key, formatter);
  }
  return formatter.format(safe);
}

export function formatDate(iso?: string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  });
}

export function formatDayMonth(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

export function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function formatRelative(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

export function formatDistance(meters?: number | null): string {
  if (meters === null || meters === undefined) return '—';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatSlot(start?: string | null, end?: string | null): string {
  if (!start && !end) return 'Standard slot';
  const pretty = (value?: string | null) => {
    if (!value) return '';
    const [h, m] = value.split(':');
    const hour = Number(h);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const twelve = hour % 12 === 0 ? 12 : hour % 12;
    return `${twelve}:${m ?? '00'} ${suffix}`;
  };
  return `${pretty(start)} – ${pretty(end)}`;
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || '?';
}

export function todaySlotLabel(date = new Date()): string {
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
}

export interface DeliveryEstimate {
  shortTime: string;
  dayLabel: string;
  fullWindow: string;
  etaLabel: string;
  period: 'morning' | 'evening';
  isToday: boolean;
}

/**
 * Computes realistic, dynamic delivery estimates based on when an order was placed.
 * - Orders placed in the morning (before 12 PM) are delivered today evening (e.g. 5:30 PM / 5:00 PM – 7:00 PM).
 * - Orders placed in the afternoon (12 PM - 3 PM) are delivered today late evening (e.g. 7:00 PM / 7:00 PM – 8:30 PM).
 * - Orders placed in the evening or at night (after 3 PM) are delivered tomorrow morning (e.g. 6:30 AM / 6:00 AM – 7:30 AM).
 */
export function getDynamicDeliveryEstimate(createdAtIso?: string | null): DeliveryEstimate {
  const refDate = createdAtIso ? new Date(createdAtIso) : new Date();
  const validDate = isNaN(refDate.getTime()) ? new Date() : refDate;
  const hour = validDate.getHours();

  if (hour < 12) {
    return {
      shortTime: '5:30 PM',
      dayLabel: 'Today',
      fullWindow: 'Today, 5:00 PM – 7:00 PM',
      etaLabel: 'Arriving Today · 5:30 PM',
      period: 'evening',
      isToday: true,
    };
  }

  if (hour < 15) {
    return {
      shortTime: '7:00 PM',
      dayLabel: 'Today',
      fullWindow: 'Today, 7:00 PM – 8:30 PM',
      etaLabel: 'Arriving Today · 7:00 PM',
      period: 'evening',
      isToday: true,
    };
  }

  return {
    shortTime: '6:30 AM',
    dayLabel: 'Tomorrow',
    fullWindow: 'Tomorrow, 6:00 AM – 7:30 AM',
    etaLabel: 'Arriving Tomorrow · 6:30 AM',
    period: 'morning',
    isToday: false,
  };
}

/** Marketing freshness & quality guarantees to project to customers instead of raw order IDs */
export function getMarketingPromise(seed = 0): string {
  const promises = [
    '🌱 100% Farm Fresh & Pure',
    '🥛 Pure Cold-Chain Farm Batch',
    '✨ Farm-to-Door Guaranteed Fresh',
    '🌿 Certified A2 Fresh Harvest',
    '🍃 Direct from Local Dairies',
  ];
  return promises[Math.abs(seed) % promises.length];
}


/* --------------------------------------------------------- status labels -- */

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Order Confirmed',
  PREPARING: 'Packed',
  READY: 'Ready for Pickup',
  ASSIGNED: 'Assigned',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  FAILED: 'Failed',
};

export const ORDER_STATUS_TONE: Record<OrderStatus, Tone> = {
  PENDING: 'slate',
  CONFIRMED: 'green',
  PREPARING: 'blue',
  READY: 'blue',
  ASSIGNED: 'amber',
  OUT_FOR_DELIVERY: 'amber',
  DELIVERED: 'green',
  CANCELLED: 'red',
  FAILED: 'red',
};

/** Ordered fulfilment steps used by the customer tracking timeline. */
export const CUSTOMER_ORDER_TIMELINE: OrderStatus[] = [
  'CONFIRMED',
  'PREPARING',
  'READY',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export function timelineIndex(status: OrderStatus): number {
  if (status === 'CANCELLED' || status === 'FAILED') return -1;
  const order = CUSTOMER_ORDER_TIMELINE;
  const idx = order.indexOf(status);
  if (idx >= 0) return idx;
  if (status === 'PENDING') return 0;
  if (status === 'ASSIGNED') return order.indexOf('READY');
  return 0;
}

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  AVAILABLE: 'New Order',
  ASSIGNED: 'Assigned',
  ACCEPTED: 'Accepted',
  PICKED_UP: 'Picked Up',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
};

export const DELIVERY_STATUS_TONE: Record<DeliveryStatus, Tone> = {
  AVAILABLE: 'blue',
  ASSIGNED: 'amber',
  ACCEPTED: 'amber',
  PICKED_UP: 'amber',
  OUT_FOR_DELIVERY: 'amber',
  DELIVERED: 'green',
  FAILED: 'red',
};

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
};

export const PLAN_STATUS_TONE: Record<PlanStatus, Tone> = {
  ACTIVE: 'green',
  PAUSED: 'amber',
  CANCELLED: 'red',
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: 'Payment Pending',
  COMPLETED: 'Paid',
  FAILED: 'Payment Failed',
  REFUNDED: 'Refunded',
};

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, Tone> = {
  PENDING: 'amber',
  COMPLETED: 'green',
  FAILED: 'red',
  REFUNDED: 'slate',
};

export const FREQUENCY_LABEL: Record<string, string> = {
  DAILY: 'Daily',
  SELECTED_DAYS: 'Selected Days',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  ONE_TIME: 'One-time',
};

/** Weekday labels used by plan day pickers (index aligns with Prisma selectedDays). */
export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAY_LABELS_MON_FIRST = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function isOrderInProgress(status: OrderStatus): boolean {
  return !['DELIVERED', 'CANCELLED', 'FAILED'].includes(status);
}
