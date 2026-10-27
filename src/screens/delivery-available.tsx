import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  deliveryApi,
  EmptyState,
  ErrorState,
  formatDistance,
  Icon,
  LoadingState,
  useAsync,
  useToast,
  colors,
  radius,
  spacing,
  typography,
  type AvailableOrder,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath } from '../delivery-routes';
import { useNavigate } from '../router';
import { useDutyStatus } from '../hooks/use-duty-status';

function RouteRow({
  tone,
  title,
  subtitle,
}: {
  tone: 'store' | 'customer';
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.routeRow}>
      <View style={[styles.pin, tone === 'store' ? styles.pinStore : styles.pinCustomer]} />
      <View style={styles.routeText}>
        <Text style={styles.routeLabel}>{title}</Text>
        {subtitle ? <Text style={styles.routeSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

/** 4. Available orders — unclaimed deliveries with backend-computed distance. */
export function DeliveryAvailableScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const [accepting, setAccepting] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<Set<string>>(new Set());

  const { isOnline, toggling, toggleDuty, partner } = useDutyStatus();
  const available = useAsync(
    (signal) => deliveryApi.listAvailableDeliveries({ limit: 20 }, signal),
    [],
    { pollIntervalMs: 3000 },
  );

  const handleGoOnline = async () => {
    await toggleDuty();
    available.reload();
  };

  const accept = async (order: AvailableOrder) => {
    if (accepting || rejecting) return;
    setAccepting(order.orderId);
    try {
      await deliveryApi.acceptDelivery(order.orderId);
      toast.success(`Order #${order.orderId} assigned to you`);
      navigate(deliveryPath('active'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not accept this order.');
      available.reload();
    } finally {
      setAccepting(null);
    }
  };

  const reject = async (order: AvailableOrder) => {
    if (rejecting || accepting) return;
    setRejecting(order.orderId);
    try {
      await deliveryApi.rejectDelivery(order.orderId);
      setDismissedOrderIds((prev) => new Set(prev).add(order.orderId));
      toast.success(`Order #${order.orderId} rejected`);
      available.reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not reject this order.');
    } finally {
      setRejecting(null);
    }
  };

  const visibleOrders = (available.data?.orders ?? []).filter(
    (order) => !dismissedOrderIds.has(order.orderId),
  );

  return (
    <DeliveryShell
      headerProps={{
        title: 'Available orders',
        subtitle: isOnline && available.data ? `${visibleOrders.length} open` : undefined,
      }}
      onRefresh={() => {
        partner.reload();
        if (isOnline) available.reload();
      }}
      refreshing={available.refreshing}
    >
      {!isOnline ? (
        <View style={styles.offlineBox}>
          <View style={styles.offlineIconWrap}>
            <Icon name="target" size={36} color={colors.white} />
          </View>
          <Text style={styles.offlineTitle}>You’re Offline</Text>
          <Text style={styles.offlineDesc}>
            You’re offline. Please come online to receive and accept orders.
          </Text>
          <Button
            variant="primary"
            size="lg"
            block
            loading={toggling}
            onPress={() => void handleGoOnline()}
            style={styles.goOnlineBtn}
          >
            <Icon name="target" size={18} color={colors.white} /> Go Online to Receive Orders
          </Button>
        </View>
      ) : (
        <View style={styles.stack}>
          {available.status === 'loading' ? (
            <LoadingState label="Looking for open orders…" />
          ) : available.status === 'error' ? (
            <ErrorState
              title="Could not load available orders"
              description={available.error?.message}
              code={available.error?.code}
              onRetry={available.reload}
            />
          ) : visibleOrders.length === 0 ? (
            <EmptyState
              icon="target"
              title="No open orders right now"
              description="You’ll be notified here when your merchant releases a new delivery."
              actionLabel="Refresh"
              onAction={() => {
                setDismissedOrderIds(new Set());
                available.reload();
              }}
            />
          ) : (
            visibleOrders.map((order) => (
              <View key={order.orderId} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={styles.cardHeadLeft}>
                    <Badge tone="red">New</Badge>
                    <Text style={styles.cardId}>#{order.orderId}</Text>
                  </View>
                  <Text style={styles.meta}>
                    {formatDistance(order.delivery.distanceInMeters)} ·{' '}
                    {new Date(order.deliverySlot.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </Text>
                </View>

                <View style={styles.route}>
                  <RouteRow
                    tone="store"
                    title="Fresh Dairy Store"
                    subtitle={`${order.deliveryAddress.city}, ${order.deliveryAddress.state}`}
                  />
                  <RouteRow
                    tone="customer"
                    title={order.customer.name}
                    subtitle={`${order.deliveryAddress.addressLine1}, ${order.deliveryAddress.city}`}
                  />
                </View>

                <View style={styles.items}>
                  <Icon name="package" size={14} color={colors.muted2} />
                  <Text style={styles.itemsText} numberOfLines={2}>
                    {order.items.length} items ·{' '}
                    {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Button
                    variant="outline"
                    size="md"
                    style={styles.actionBtn}
                    loading={rejecting === order.orderId}
                    disabled={accepting === order.orderId}
                    onPress={() => void reject(order)}
                  >
                    Reject
                  </Button>
                  <Button
                    size="md"
                    style={styles.actionBtn}
                    loading={accepting === order.orderId}
                    disabled={rejecting === order.orderId}
                    onPress={() => void accept(order)}
                  >
                    Accept
                  </Button>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigate(deliveryPath('orderDetails', { orderId: order.orderId }))}
                  style={({ pressed }) => [styles.detailsLink, pressed && { opacity: 0.7 }]}
                >
                  <Text style={styles.detailsText}>View order details</Text>
                  <Icon name="chevronRight" size={14} color="#141518" />
                </Pressable>
              </View>
            ))
          )}
        </View>
      )}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14, marginTop: spacing.md },
  card: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardId: { fontSize: 15, fontWeight: '800', color: colors.ink },
  meta: { ...typography.caption, lineHeight: 17 },
  route: {
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#F3F4F6',
    borderRadius: radius.md,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  pin: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  pinStore: { backgroundColor: '#141518' },
  pinCustomer: { backgroundColor: colors.red },
  routeText: { flex: 1, minWidth: 0 },
  routeLabel: { ...typography.small, fontWeight: '700', color: colors.ink },
  routeSub: { ...typography.caption, lineHeight: 17 },
  items: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  itemsText: { ...typography.caption, lineHeight: 17, flex: 1 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 4 },
  actionBtn: { flex: 1 },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  detailsText: { ...typography.small, fontWeight: '700', color: '#141518' },
  footer: { paddingHorizontal: 18 },
  offlineBox: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    alignItems: 'center',
    textAlign: 'center',
    gap: spacing.md,
  },
  offlineIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  offlineTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
  },
  offlineDesc: {
    ...typography.body,
    color: colors.ink2,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  goOnlineBtn: {
    marginTop: spacing.sm,
  },
});
