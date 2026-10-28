/** Commerce types — cart, orders, payments, addresses, dairy plans, coupons, notifications.
 *  Shapes verified against the service return values in dairy-backend/src/modules/*. */

export type PlanFrequency = 'DAILY' | 'SELECTED_DAYS' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
export type PlanStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type PlanActionType = 'SKIP' | 'EXTRA_DELIVERY' | 'PAUSE' | 'RESUME' | 'QUANTITY_CHANGE';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED';

export type DeliveryStatus =
  | 'AVAILABLE'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

/** Backend enum only knows ONLINE / CASH_ON_DELIVERY / WALLET.
 *  UPI, Cards and Net Banking are UI choices that submit as ONLINE (see README "Missing APIs"). */
export type PaymentMethod = 'ONLINE' | 'CASH_ON_DELIVERY' | 'WALLET';

/** Customer-facing payment choice shown in the checkout UI. */
export type PaymentUiChoice = 'UPI' | 'CARD' | 'NET_BANKING' | 'CASH_ON_DELIVERY';

export function paymentMethodForChoice(choice: PaymentUiChoice): PaymentMethod {
  return choice === 'CASH_ON_DELIVERY' ? 'CASH_ON_DELIVERY' : 'ONLINE';
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  merchantId: string;
  unitPrice: number;
  unit: string;
  quantity: number;
  deliverySchedule: PlanFrequency;
  selectedDays: number[];
  itemTotal: number;
  imageUrl: string | null;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  currency: string;
  appliedCoupon: { code: string; discount: number } | null;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  itemCount: number;
  summary: CartSummary;
}

export interface AddToCartInput {
  productId: string;
  quantity: number;
  deliverySchedule?: PlanFrequency;
  selectedDays?: number[];
}

export interface UpdateCartItemInput {
  quantity: number;
  deliverySchedule?: PlanFrequency;
  selectedDays?: number[];
}

export interface Address {
  addressId: string;
  userId?: string;
  title: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressInput {
  title: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  product?: { productId: string; name: string; unit: string; imageUrl?: string | null } | null;
}

export interface OrderPayment {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  transactionReference?: string | null;
}

export interface OrderDeliveryPartner {
  deliveryPartnerId: string;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  /** Live GPS pushed by the partner (`PUT /deliveries/partner/location`).
   *  Included by `GET /orders/:id` — the customer screen uses it for live tracking. */
  currentLatitude?: number | null;
  currentLongitude?: number | null;
  user: { name: string; phone?: string | null };
}

export interface OrderDelivery {
  id: string;
  deliveryId?: string | null;
  orderId: string;
  status: DeliveryStatus;
  assignedAt?: string | null;
  acceptedAt?: string | null;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
  failedReason?: string | null;
  deliveryPartner?: OrderDeliveryPartner | null;
}

export interface Order {
  orderId: string;
  merchantId: string;
  customerId: string;
  addressId: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  isRecurringInstance: boolean;
  dairyPlanId?: string | null;
  deliveryDate: string;
  deliverySlotStartTime?: string | null;
  deliverySlotEndTime?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  payment?: OrderPayment | null;
  delivery?: OrderDelivery | null;
  merchant?: { merchantId: string; businessName: string; phone: string };
  address?: Address;
  customer?: { userId: string; name: string; email: string; phone?: string | null };
}

export interface CheckoutInput {
  addressId: string;
  paymentMethod?: PaymentMethod;
  couponCode?: string;
  deliveryDate?: string;
  notes?: string;
}

export interface CouponValidation {
  code: string;
  discount?: number;
  calculatedDiscount?: number;
  discountType?: string;
  discountValue?: number;
  [key: string]: unknown;
}

export interface DairyPlanItem {
  id: string;
  planId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  product: {
    productId: string;
    name: string;
    unit: string;
    price: number;
    imageUrl?: string | null;
    description?: string;
  };
}

export interface DairyPlanAction {
  id: string;
  planId: string;
  actionType: PlanActionType;
  targetDate: string;
  extraQuantity?: number | null;
  reason?: string | null;
  createdAt: string;
}

export interface DairyPlan {
  planId: string;
  merchantId: string;
  customerId: string;
  addressId: string;
  status: PlanStatus;
  startDate: string;
  endDate?: string | null;
  frequency: PlanFrequency;
  selectedDays: number[];
  pausedAt?: string | null;
  resumedAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: DairyPlanItem[];
  actions?: DairyPlanAction[];
  address?: Address;
  merchant?: { merchantId: string; businessName: string; phone: string };
}

export interface CreateDairyPlanInput {
  addressId: string;
  frequency: PlanFrequency;
  selectedDays?: number[];
  startDate: string;
  endDate?: string;
  items: { productId: string; quantity: number }[];
}

export interface UpdateDairyPlanInput {
  frequency?: PlanFrequency;
  selectedDays?: number[];
  addressId?: string;
  items?: { productId: string; quantity: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CustomerDashboard {
  recentOrders: Order[];
  activePlans: DairyPlan[];
  addresses: Address[];
}
