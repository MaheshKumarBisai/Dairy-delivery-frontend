import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  deliveryApi,
  DELIVERY_STATUS_LABEL,
  DELIVERY_STATUS_TONE,
  ErrorState,
  formatCurrency,
  formatDistance,
  getDynamicDeliveryEstimate,
  Icon,
  KeyValue,
  LoadingState,
  Notice,
  useToast,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath, deliveryRoutes } from '../delivery-routes';
import { useNavigate, useParams } from '../router';
import { useDeliveryOrder } from '../hooks/use-delivery-order';

function MiniStat({ icon, children }: { icon: 'navigation' | 'clock' | 'package'; children: React.ReactNode }) {
  return (
    <View style={styles.miniStat}>
      <Icon name={icon} size={14} color={colors.ink2} />
      <Text style={styles.miniStatText}>{children}</Text>
    </View>
  );
}

function formatSlotTime(timeStr?: string | null): string {
  if (!timeStr) return 'Scheduled';
  if (/^\d{1,2}:\d{2}/.test(timeStr)) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
  }
  const d = new Date(timeStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  return timeStr || 'Scheduled';
}

/** 5. Order details — store, customer, items and the next real status action. */
export function DeliveryOrderDetailsScreen() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { status, assigned, available, error, reload } = useDeliveryOrder(orderId);
  const [busy, setBusy] = useState<string | null>(null);

  const advance = async (next: 'ACCEPTED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY', key: string) => {
    if (busy) return;
    setBusy(key);
    try {
      await deliveryApi.updateDeliveryStatus(orderId, { status: next });
      toast.success('Delivery status updated');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the status.');
    } finally {
      setBusy(null);
    }
  };

  if (status === 'loading') {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Order details', onBack: () => navigate(-1) }}
      >
        <LoadingState label="Loading order…" />
      </DeliveryShell>
    );
  }

  if (status === 'error') {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Order details', onBack: () => navigate(-1) }}
      >
        <ErrorState
          title="Could not load this order"
          description={error?.message}
          code={error?.code}
          onRetry={reload}
        />
      </DeliveryShell>
    );
  }

  if (!assigned && !available) {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Order details', onBack: () => navigate(deliveryRoutes.available) }}
      >
        <ErrorState
          title="Order not available"
          description="This order is not open and not assigned to you — it may have been claimed by another partner."
          onRetry={reload}
        />
      </DeliveryShell>
    );
  }

  const deliveryStatus = assigned?.status ?? 'AVAILABLE';
  const order = assigned?.order ?? null;
  const customerName = assigned?.order?.customer?.name ?? available?.customer.name ?? 'Customer';
  const customerPhone = assigned?.order?.customer?.phone ?? available?.customer.phone ?? null;
  const merchant = assigned?.merchant ?? null;
  const address = order?.address ?? null;
  const items = order?.items ?? [];
  const distance = available?.delivery.distanceInMeters ?? null;

  const isAvailable = !assigned;

  const callStore = () => {
    if (merchant?.phone) void Linking.openURL(`tel:${merchant.phone}`);
  };
  const callCustomer = () => {
    if (customerPhone) void Linking.openURL(`tel:${customerPhone}`);
  };

  const slotEstimate = getDynamicDeliveryEstimate(
    order?.createdAt ?? (assigned ? assigned.createdAt : null),
  );
  const deliverySlotTimeDisplay =
    order?.deliverySlotStartTime && order.deliverySlotStartTime !== '06:00'
      ? formatSlotTime(order.deliverySlotStartTime)
      : available?.deliverySlot?.startTime && available.deliverySlot.startTime !== '06:00'
      ? formatSlotTime(available.deliverySlot.startTime)
      : `${slotEstimate.dayLabel}, ${slotEstimate.shortTime}`;

  const itemList = (
    items.length
      ? items.map((item) => ({
          key: item.id,
          name: item.productName,
          quantity: item.quantity,
          unit: item.product?.unit ?? 'unit',
          amount: item.totalPrice,
        }))
      : (available?.items ?? []).map((item) => ({
          key: item.productId,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          amount: 0,
        }))
  );

  return (
    <DeliveryShell
      nav={false}
      headerProps={{
        title: 'Order details',
        subtitle: `#${orderId}`,
        onBack: () => navigate(-1),
        right: (
          <Badge tone={DELIVERY_STATUS_TONE[deliveryStatus]}>
            {DELIVERY_STATUS_LABEL[deliveryStatus]}
          </Badge>
        ),
      }}
      onRefresh={() => reload()}
      footer={
        <View style={styles.footer}>
          {isAvailable ? (
            <View style={styles.actionRow}>
              <Button
                variant="outline"
                size="lg"
                style={styles.halfBtn}
                loading={busy === 'reject'}
                onPress={() => {
                  setBusy('reject');
                  deliveryApi
                    .rejectDelivery(orderId)
                    .then(() => {
                      navigate(deliveryRoutes.available);
                    })
                    .catch((err: unknown) => {
                      console.error('Could not reject order:', err);
                    })
                    .finally(() => setBusy(null));
                }}
              >
                Reject order
              </Button>
              <Button
                size="lg"
                style={styles.halfBtn}
                loading={busy === 'accept'}
                onPress={() => {
                  setBusy('accept');
                  deliveryApi
                    .acceptDelivery(orderId)
                    .then(() => {
                      navigate(deliveryPath('navigation', { orderId }));
                    })
                    .catch((err: unknown) => {
                      console.error('Could not accept order:', err);
                    })
                    .finally(() => setBusy(null));
                }}
              >
                Accept order
              </Button>
            </View>
          ) : deliveryStatus === 'ASSIGNED' ? (
            <>
              <Button
                size="lg"
                block
                onPress={() => navigate(deliveryPath('navigation', { orderId }))}
              >
                Start navigation to store
              </Button>
              <Button
                variant="outline"
                size="lg"
                block
                loading={busy === 'accepted'}
                onPress={() => void advance('ACCEPTED', 'accepted')}
              >
                Reached store
              </Button>
            </>
          ) : deliveryStatus === 'ACCEPTED' ? (
            <Button size="lg" block onPress={() => navigate(deliveryPath('pickup', { orderId }))}>
              Confirm pickup
            </Button>
          ) : deliveryStatus === 'PICKED_UP' ? (
            <Button
              size="lg"
              block
              onPress={() => navigate(deliveryPath('navigation', { orderId }))}
            >
              Navigate to customer
            </Button>
          ) : deliveryStatus === 'OUT_FOR_DELIVERY' ? (
            <Button
              size="lg"
              block
              onPress={() => navigate(deliveryPath('confirmDelivery', { orderId }))}
            >
              Confirm delivery
            </Button>
          ) : (
            <Notice tone="muted" icon="checkCircle">
              This delivery is finished ({DELIVERY_STATUS_LABEL[deliveryStatus]}).
            </Notice>
          )}
        </View>
      }
    >
      {isAvailable ? (
        <View style={styles.availableBadge}>
          <Badge tone="red" icon="target">
            New order waiting for you
          </Badge>
        </View>
      ) : null}

      <Card style={styles.routeCard}>
        {/* Pickup Section */}
        <View style={styles.partyHeader}>
          <View style={styles.sectionBadge}>
            <Icon name="store" size={12} color="#141518" />
            <Text style={styles.sectionBadgeText}>PICKUP STORE</Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <View style={styles.partyIcon}>
            <Icon name="store" size={20} color="#141518" />
          </View>
          <View style={styles.partyMain}>
            <Text style={styles.partyName}>
              {merchant?.businessName ?? available?.deliveryAddress.city ?? 'Fresh Dairy Store'}
            </Text>
            <Text style={styles.caption}>
              {merchant?.address ?? available?.deliveryAddress.city ?? 'Merchant address'}
            </Text>
          </View>
          {merchant?.phone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call store"
              onPress={callStore}
              style={({ pressed }) => [styles.roundBtn, pressed && { opacity: 0.7 }]}
            >
              <Icon name="phone" size={17} color="#141518" />
            </Pressable>
          ) : null}
        </View>

        {/* Route connector line */}
        <View style={styles.routeConnector}>
          <View style={styles.routeDot} />
          <View style={styles.routeLine} />
          <View style={[styles.routeDot, styles.routeDotDest]} />
        </View>

        {/* Deliver To Section */}
        <View style={styles.partyHeader}>
          <View style={[styles.sectionBadge, styles.sectionBadgeDest]}>
            <Icon name="mapPin" size={12} color="#0369A1" />
            <Text style={[styles.sectionBadgeText, { color: '#0369A1' }]}>DELIVER TO CUSTOMER</Text>
          </View>
        </View>

        <View style={styles.partyRow}>
          <Avatar name={customerName} size={42} />
          <View style={styles.partyMain}>
            <Text style={styles.partyName}>{customerName}</Text>
            <Text style={styles.caption}>
              {address
                ? `${address.addressLine1}, ${address.city} ${address.postalCode}`
                : `${available?.deliveryAddress.addressLine1 ?? ''}, ${available?.deliveryAddress.city ?? ''}`}
            </Text>
          </View>
          {customerPhone ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Call customer"
              onPress={callCustomer}
              style={({ pressed }) => [styles.roundBtn, styles.roundBtnSolid, pressed && { opacity: 0.7 }]}
            >
              <Icon name="phone" size={17} color={colors.white} />
            </Pressable>
          ) : null}
        </View>

        {/* Dynamic Route & Delivery Slot Banner */}
        <View style={styles.miniRow}>
          {distance != null ? (
            <MiniStat icon="navigation">{formatDistance(distance)}</MiniStat>
          ) : null}
          <MiniStat icon="clock">{deliverySlotTimeDisplay}</MiniStat>
          <MiniStat icon="package">
            {items.length || available?.items.length || 0} {items.length === 1 ? 'item' : 'items'}
          </MiniStat>
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.h3}>Items to pick up</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{itemList.length} items</Text>
          </View>
        </View>
        <Card style={styles.itemsCard}>
          {itemList.map((item) => (
            <View key={item.key} style={styles.itemRow}>
              <View style={styles.itemBox}>
                <Icon name="basket" size={16} color="#141518" />
              </View>
              <View style={styles.itemMain}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.quantityRow}>
                  <View style={styles.qtyPill}>
                    <Text style={styles.qtyPillText}>{item.quantity} × {item.unit}</Text>
                  </View>
                </View>
              </View>
              {item.amount ? <Text style={styles.price}>{formatCurrency(item.amount)}</Text> : null}
            </View>
          ))}
          <View style={styles.coldChainHint}>
            <Icon name="check" size={13} color="#141518" />
            <Text style={styles.coldChainHintText}>
              Keep in insulated cold pouch to maintain fresh dairy temperature.
            </Text>
          </View>
        </Card>
      </View>

      {order?.total ? (
        <View style={styles.section}>
          <Card>
            <KeyValue label="Order value" value={formatCurrency(order.total)} />
            <KeyValue label="Payment" value={order.payment?.status ?? 'PAID'} />
            {order.notes ? <KeyValue label="Customer note" value={order.notes} /> : null}
          </Card>
        </View>
      ) : null}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  availableBadge: { marginBottom: 12 },
  routeCard: {
    padding: spacing.md + 2,
    borderRadius: radius.xl,
    backgroundColor: colors.white,
    ...shadows.sm,
  },
  partyHeader: {
    marginBottom: 4,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  sectionBadgeDest: {
    backgroundColor: '#E0F2FE',
  },
  sectionBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },
  partyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: 4,
  },
  partyIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  partyMain: { flex: 1, minWidth: 0, gap: 2 },
  partyName: { fontWeight: '800', color: colors.ink, fontSize: 16 },
  caption: { ...typography.caption, lineHeight: 18, color: '#6B7280' },
  roundBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnSolid: { backgroundColor: '#141518', borderColor: '#141518' },
  routeConnector: {
    marginLeft: 20,
    marginVertical: 6,
    flexDirection: 'column',
    alignItems: 'center',
    height: 24,
  },
  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#141518',
  },
  routeDotDest: {
    backgroundColor: '#0284C7',
  },
  routeLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 2,
  },
  miniRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  miniStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  miniStatText: { ...typography.caption, fontWeight: '700', color: colors.ink },
  section: { marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  h3: { ...typography.h3 },
  countBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  itemsCard: { paddingVertical: spacing.xs, borderRadius: radius.lg },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  itemBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemMain: { flex: 1, minWidth: 0, gap: 2 },
  itemName: { fontWeight: '800', color: colors.ink, fontSize: 15 },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  qtyPill: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  qtyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  price: { fontSize: 15, fontWeight: '800', color: '#141518' },
  coldChainHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: radius.md,
    marginTop: 8,
  },
  coldChainHintText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#141518',
    flex: 1,
  },
  notice: { marginTop: 16 },
  footer: { paddingHorizontal: 18, gap: spacing.sm, paddingBottom: 16, backgroundColor: 'transparent' },
  actionRow: { flexDirection: 'row', gap: 10 },
  halfBtn: { flex: 1 },
});
