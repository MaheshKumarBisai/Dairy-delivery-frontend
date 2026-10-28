/** Delivery partner domain types — verified against
 *  deliveries.service.ts (available / assigned / status) and delivery-partners.service.ts (me). */

import type { DeliveryStatus, Order, OrderStatus, Address, OrderItem } from './commerce';

/** Item projection returned inside available deliveries. */
export interface AvailableOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface AvailableOrder {
  orderId: string;
  merchantId: string;
  status: OrderStatus;
  delivery: {
    deliveryId: string;
    status: DeliveryStatus;
    /** Authoritative haversine distance computed by the backend (meters). */
    distanceInMeters: number | null;
  };
  customer: { customerId: string; name: string; phone: string };
  deliveryAddress: {
    addressId: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    latitude: number | null;
    longitude: number | null;
  };
  items: AvailableOrderItem[];
  deliverySlot: { date: string; startTime: string; endTime: string };
}

/** GET /deliveries/partner/assigned — full Prisma Delivery with relations. */
export interface AssignedDelivery {
  id: string;
  deliveryId?: string | null;
  orderId: string;
  merchantId: string;
  deliveryPartnerId?: string | null;
  status: DeliveryStatus;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  failedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  order: Order & { items: OrderItem[]; address: Address };
  merchant: { merchantId: string; businessName: string; address: string; phone: string };
}

export interface AvailableDeliveriesQuery {
  latitude?: number;
  longitude?: number;
  radiusInMeters?: number;
  maxDistanceMeters?: number;
  page?: number;
  limit?: number;
}

export interface AvailableDeliveriesResponse {
  orders: AvailableOrder[];
  pagination: { page: number; limit: number; totalItems: number; totalPages: number };
}

/** GET /delivery-partners/me */
export interface DeliveryPartnerProfile {
  deliveryPartnerId: string;
  userId: string;
  merchantId: string;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  lastLocationAt?: string | null;
  isAvailable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user: { userId: string; email: string; name: string; phone?: string | null };
  merchant: { merchantId: string; businessName: string; phone: string; address: string };
}

export interface UpdateLocationInput {
  latitude: number;
  longitude: number;
}

export type UpdateDeliveryStatusInput =
  | { status: 'ACCEPTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' }
  | { status: 'FAILED'; failedReason: string };

export interface DeliveryPartnerEarnings {
  todayEarnings: number;
  todayCount: number;
  thisWeekEarnings: number;
  thisWeekCount: number;
  thisMonthEarnings: number;
  totalEarnings: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  currency: string;
  breakdown: {
    basePay: number;
    deliveryFeeShare: number;
    incentives: number;
  };
  recentPayouts: Array<{
    orderId: string;
    deliveredAt: string;
    amount: number;
    customerName: string;
    address: string;
    itemCount: number;
  }>;
  payoutSummary: {
    availableForPayout: number;
    nextPayoutDate: string;
    payoutMethod: string;
  };
}

export interface DeliveryPartnerRatingReview {
  reviewId: string;
  rating: number;
  feedback?: string | null;
  tags: string[];
  customerName: string;
  createdAt: string;
}

export interface DeliveryPartnerRatings {
  averageRating: number;
  totalReviews: number;
  satisfactionPercentage: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  topBadges: string[];
  recentReviews: DeliveryPartnerRatingReview[];
}
