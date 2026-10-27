import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  Button,
  deliveryApi,
  DELIVERY_STATUS_LABEL,
  DELIVERY_STATUS_TONE,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Notice,
  useAsync,
  colors,
  spacing,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath, deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';

/** Next real action for each delivery status (backend transitions only). */
export function nextActionFor(status: string): { label: string; route: 'navigation' | 'pickup' | 'confirmDelivery' } | null {
  switch (status) {
    case 'ASSIGNED':
      return { label: 'Navigate to store', route: 'navigation' };
    case 'ACCEPTED':
      return { label: 'Confirm pickup', route: 'pickup' };
    case 'PICKED_UP':
      return { label: 'Navigate to customer', route: 'navigation' };
    case 'OUT_FOR_DELIVERY':
      return { label: 'Confirm delivery', route: 'confirmDelivery' };
    default:
      return null;
  }
}

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

/** 7. Active deliveries — everything currently assigned to this partner. */
export function DeliveryActiveScreen() {
  const navigate = useNavigate();
  const partner = useAsync((signal) => deliveryApi.getPartnerProfile(signal), []);
  const assigned = useAsync(
    (signal) => deliveryApi.listAssignedDeliveries(undefined, signal),
    [],
    { pollIntervalMs: 3000 },
  );

  const isOnline = partner.data?.isAvailable ?? true;

  const active = useMemo(
    () =>
      (assigned.data ?? []).filter(
        (delivery) => !['DELIVERED', 'FAILED'].includes(delivery.status),
      ),
    [assigned.data],
  );

  return (
    <DeliveryShell
      headerProps={{
        title: 'Active deliveries',
        subtitle: active.length ? `${active.length} in progress` : undefined,
      }}
      onRefresh={() => {
        partner.reload();
        assigned.reload();
      }}
      refreshing={assigned.refreshing}
    >
      {!isOnline && (
        <Notice tone="amber" icon="alert">
          You’re offline. Please come online to receive new orders.
        </Notice>
      )}

      <View style={styles.stack}>
        {assigned.status === 'loading' ? (
          <LoadingState label="Loading your deliveries…" />
        ) : assigned.status === 'error' ? (
          <ErrorState
            title="Could not load your deliveries"
            description={assigned.error?.message}
            code={assigned.error?.code}
            onRetry={assigned.reload}
          />
        ) : active.length === 0 ? (
          <EmptyState
            icon="truck"
            title="No active deliveries"
            description="Accept an available order and it will appear here with its next step."
            actionLabel="See available orders"
            onAction={() => navigate(deliveryRoutes.available)}
          />
        ) : (
          active.map((delivery) => {
            const next = nextActionFor(delivery.status);
            const items = delivery.order?.items ?? [];
            return (
              <View key={delivery.orderId} style={styles.card}>
                <View style={styles.cardHead}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      navigate(deliveryPath('orderDetails', { orderId: delivery.orderId }))
                    }
                    style={styles.cardHeadLeft}
                  >
                    <Text style={styles.cardId}>#{delivery.orderId}</Text>
                    {delivery.order?.customer?.name ? (
                      <Text style={styles.cardCustomerName} numberOfLines={1}>
                        · {delivery.order.customer.name}
                      </Text>
                    ) : null}
                  </Pressable>
                  <Badge tone={DELIVERY_STATUS_TONE[delivery.status]}>
                    {DELIVERY_STATUS_LABEL[delivery.status]}
                  </Badge>
                </View>

                <View style={styles.route}>
                  <RouteRow
                    tone="store"
                    title={delivery.merchant?.businessName ?? 'Dairy store'}
                    subtitle={delivery.merchant?.address}
                  />
                  <RouteRow
                    tone="customer"
                    title={delivery.order?.customer?.name ?? 'Customer'}
                    subtitle={
                      delivery.order?.address
                        ? `${delivery.order.address.addressLine1}, ${delivery.order.address.city}`
                        : 'Delivery address'
                    }
                  />
                </View>

                <View style={styles.items}>
                  <Icon name="package" size={14} color={colors.muted2} />
                  <Text style={styles.itemsText} numberOfLines={2}>
                    {items.length} items · {items.map((item) => item.productName).join(', ')}
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                      navigate(deliveryPath('orderDetails', { orderId: delivery.orderId }))
                    }
                    style={({ pressed }) => [
                      styles.detailsBtn,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text style={styles.detailsBtnText}>Details</Text>
                  </Pressable>
                  {next ? (
                    <Button
                      style={styles.actionBtn}
                      onPress={() =>
                        navigate(deliveryPath(next.route, { orderId: delivery.orderId }))
                      }
                    >
                      {next.label}
                    </Button>
                  ) : (
                    <Button variant="ghost" style={styles.actionBtn} disabled>
                      Finished
                    </Button>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14, paddingTop: 4 },
  card: {
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardHeadLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  cardId: { fontSize: 16, fontWeight: '800', color: '#141518' },
  cardCustomerName: { fontSize: 15, fontWeight: '700', color: '#141518', flexShrink: 1 },
  route: {
    gap: 10,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pin: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  pinStore: { backgroundColor: '#141518' },
  pinCustomer: { backgroundColor: '#EF4444' },
  routeText: { flex: 1, minWidth: 0 },
  routeLabel: { fontSize: 13, fontWeight: '700', color: '#141518' },
  routeSub: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  items: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  itemsText: { fontSize: 12, color: '#6B7280', lineHeight: 17, flex: 1 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 14 },
  detailsBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141518',
  },
  section: { marginTop: spacing.xl },
});
