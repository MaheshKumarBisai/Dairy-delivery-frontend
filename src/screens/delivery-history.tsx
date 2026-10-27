import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  deliveryApi,
  DELIVERY_STATUS_LABEL,
  EmptyState,
  ErrorState,
  formatCurrency,
  formatRelative,
  Icon,
  LoadingState,
  useAsync,
  spacing,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath, deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';

type HistoryTab = 'ALL' | 'DELIVERED' | 'FAILED';

/** 10. Delivery history — finished deliveries with sleek black branding and zero green. */
export function DeliveryHistoryScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<HistoryTab>('ALL');

  const assigned = useAsync(
    (signal) => deliveryApi.listAssignedDeliveries(undefined, signal),
    [tab],
    { pollIntervalMs: 3000 },
  );

  const rows = useMemo(() => {
    const all = assigned.data ?? [];
    if (tab === 'ALL') return all.filter((row) => ['DELIVERED', 'FAILED'].includes(row.status));
    return all.filter((row) => row.status === tab);
  }, [assigned.data, tab]);

  return (
    <DeliveryShell
      headerProps={{
        title: 'My orders',
        subtitle: 'Completed deliveries',
      }}
      onRefresh={() => assigned.reload()}
      refreshing={assigned.refreshing}
    >
      <View style={styles.tabs}>
        {(['ALL', 'DELIVERED', 'FAILED'] as HistoryTab[]).map((value) => {
          const active = tab === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setTab(value)}
              style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && { opacity: 0.85 }]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {value === 'ALL' ? 'All' : value === 'DELIVERED' ? 'Delivered' : 'Failed'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {assigned.status === 'loading' ? (
        <LoadingState label="Loading history…" />
      ) : assigned.status === 'error' ? (
        <ErrorState
          title="Could not load your history"
          description={assigned.error?.message}
          code={assigned.error?.code}
          onRetry={assigned.reload}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon="list"
          title="Nothing here yet"
          description="Deliveries you complete will be listed here."
          actionLabel="See active deliveries"
          onAction={() => navigate(deliveryRoutes.active)}
        />
      ) : (
        <View style={styles.stack}>
          {rows.map((row) => (
            <Pressable
              key={row.orderId}
              accessibilityRole="button"
              accessibilityLabel={`Order ${row.orderId}`}
              onPress={() => navigate(deliveryPath('orderDetails', { orderId: row.orderId }))}
              style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
            >
              <View style={styles.cardHead}>
                <Text style={styles.cardId}>#{row.orderId}</Text>
                <View style={row.status === 'DELIVERED' ? styles.deliveredBadge : styles.failedBadge}>
                  <Text style={row.status === 'DELIVERED' ? styles.deliveredBadgeText : styles.failedBadgeText}>
                    {DELIVERY_STATUS_LABEL[row.status]}
                  </Text>
                </View>
              </View>
              <View style={styles.meta}>
                <Icon name="clock" size={14} color="#6B7280" />
                <Text style={styles.metaText}>{formatRelative(row.updatedAt)}</Text>
                <Text style={styles.metaText}>·</Text>
                <Text style={styles.metaText}>{row.order?.items?.length ?? 0} items</Text>
              </View>
              <View style={styles.cardFoot}>
                <Text style={styles.price}>{formatCurrency(row.order?.total ?? 0)}</Text>
                <Text numberOfLines={1} style={[styles.caption, styles.customer]}>
                  {row.order?.customer?.name ?? 'Customer'}
                </Text>
              </View>
              {row.failedReason ? (
                <Text style={styles.failedReason}>{row.failedReason}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      )}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    padding: 4,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: { backgroundColor: '#141518' },
  tabText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF', fontWeight: '800' },
  stack: { gap: 12 },
  card: {
    gap: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
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
  cardId: { fontSize: 16, fontWeight: '800', color: '#141518' },
  deliveredBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  deliveredBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#141518',
  },
  failedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  failedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  cardFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: 2,
  },
  price: { fontSize: 17, fontWeight: '900', color: '#141518' },
  caption: { fontSize: 12, color: '#6B7280', lineHeight: 17 },
  customer: { flex: 1, textAlign: 'right', fontWeight: '600' },
  failedReason: { fontSize: 12, color: '#DC2626', lineHeight: 17 },
});
