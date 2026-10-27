import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  deliveryApi,
  DELIVERY_STATUS_LABEL,
  DELIVERY_STATUS_TONE,
  EmptyState,
  ErrorState,
  formatCurrency,
  formatDistance,
  Icon,
  LoadingState,
  Skeleton,
  useAsync,
  colors,
  radius,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath, deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';
import { useDeliveryAuth } from '../auth/delivery-auth.context';
import { useDutyStatus } from '../hooks/use-duty-status';

/** 3. Delivery Home — modern dashboard with black duty toggle and zero green. */
export function DeliveryHomeScreen() {
  const navigate = useNavigate();
  const { profile } = useDeliveryAuth();
  const { isOnline, toggling, toggleDuty: toggleAvailability, partner } = useDutyStatus();

  const earnings = useAsync((signal) => deliveryApi.getPartnerEarnings(signal), []);
  const ratings = useAsync((signal) => deliveryApi.getPartnerRatings(signal), []);
  const assigned = useAsync(
    (signal) => deliveryApi.listAssignedDeliveries(undefined, signal),
    [],
    { pollIntervalMs: 3000 },
  );
  const available = useAsync(
    (signal) => deliveryApi.listAvailableDeliveries({ limit: 5 }, signal),
    [],
    { pollIntervalMs: 3000 },
  );

  const todayCount = useMemo(() => {
    if (earnings.data) return earnings.data.todayCount;
    const today = new Date().toDateString();
    return (assigned.data ?? []).filter(
      (delivery) => new Date(delivery.createdAt).toDateString() === today,
    ).length;
  }, [earnings.data, assigned.data]);

  const activeDeliveries = useMemo(
    () =>
      (assigned.data ?? []).filter(
        (delivery) => !['DELIVERED', 'FAILED'].includes(delivery.status),
      ),
    [assigned.data],
  );

  const handleRefreshAll = () => {
    partner.reload();
    earnings.reload();
    ratings.reload();
    if (isOnline) {
      assigned.reload();
      available.reload();
    }
  };

  return (
    <DeliveryShell
      onRefresh={handleRefreshAll}
      refreshing={assigned.refreshing || available.refreshing || earnings.refreshing}
      header={
        <View style={styles.homeHead}>
          <Avatar name={profile?.name ?? 'Rider'} size={48} />
          <View style={styles.headText}>
            <Text style={styles.hello}>Welcome back,</Text>
            <Text numberOfLines={1} style={styles.headName}>
              {profile?.name ?? 'Delivery Partner'}
            </Text>
          </View>

          {/* ── Modern App-Themed Duty Toggle (Black & Neutral, No Green) ── */}
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: isOnline, disabled: toggling || partner.status === 'loading' }}
            accessibilityLabel={`Duty: ${isOnline ? 'Online' : 'Offline'}. Tap to toggle.`}
            disabled={toggling || partner.status === 'loading'}
            onPress={() => void toggleAvailability()}
            style={({ pressed }) => [
              styles.dutyCard,
              isOnline ? styles.dutyCardOn : styles.dutyCardOff,
              pressed && { opacity: 0.9 },
              toggling && { opacity: 0.6 },
            ]}
          >
            <View style={styles.dutyInfo}>
              <Text style={[styles.dutyName, isOnline ? styles.dutyNameOn : styles.dutyNameOff]}>
                DUTY
              </Text>
              <View style={styles.dutyStatusRow}>
                <View
                  style={[
                    styles.dutyDot,
                    { backgroundColor: isOnline ? '#FFFFFF' : '#9CA3AF' },
                  ]}
                />
                <Text
                  style={[
                    styles.dutyStatusText,
                    isOnline ? styles.dutyStatusTextOn : styles.dutyStatusTextOff,
                  ]}
                >
                  {isOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>

            <View style={[styles.switchTrack, isOnline ? styles.switchTrackOn : styles.switchTrackOff]}>
              <View style={[styles.switchThumb, isOnline ? styles.switchThumbOn : styles.switchThumbOff]} />
            </View>
          </Pressable>
        </View>
      }
    >
      {/* ── Top 3 Stat Highlights (Attractive, Clean, No Outlines, No Green) ── */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.statIconWrap}>
            <Icon name="package" size={16} color="#141518" />
          </View>
          <Text style={styles.statValue}>{todayCount}</Text>
          <Text style={styles.statLabel}>Today's Orders</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigate(deliveryRoutes.earnings)}
          style={({ pressed }) => [styles.stat, pressed && { opacity: 0.88 }]}
        >
          <View style={styles.statIconWrap}>
            <Icon name="wallet" size={16} color="#141518" />
          </View>
          <Text style={styles.statValue}>
            {earnings.data ? formatCurrency(earnings.data.todayEarnings) : '₹0'}
          </Text>
          <Text style={styles.statLabel}>Today's Earnings</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigate(deliveryRoutes.ratings)}
          style={({ pressed }) => [styles.stat, pressed && { opacity: 0.88 }]}
        >
          <View style={styles.statIconWrap}>
            <Icon name="star" size={16} color="#D97706" />
          </View>
          <View style={styles.ratingRow}>
            <Text style={[styles.statValue, { color: '#B45309' }]}>
              ★ {ratings.data ? ratings.data.averageRating.toFixed(1) : '5.0'}
            </Text>
          </View>
          <Text style={styles.statLabel}>
            {ratings.data?.totalReviews ? `${ratings.data.totalReviews} reviews` : 'Top Rating'}
          </Text>
        </Pressable>
      </View>

      {/* ── OFFLINE STATE ── */}
      {!isOnline ? (
        <View style={styles.offlineBox}>
          <View style={styles.offlineIconWrap}>
            <Icon name="target" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.offlinePromptTitle}>You’re currently offline</Text>
          <Text style={styles.offlinePromptDesc}>
            Turn on your duty switch to start receiving order broadcasts and earning payouts.
          </Text>
          <Button
            variant="primary"
            size="lg"
            block
            loading={toggling}
            onPress={() => void toggleAvailability()}
            style={styles.goOnlineBtn}
          >
            <Icon name="target" size={18} color={colors.white} /> Go Online to Receive Orders
          </Button>
        </View>
      ) : (
        /* ── ONLINE STATE ── */
        <>
          {/* ── Current Active Orders ── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Current orders</Text>
                <Text style={styles.sectionSub}>
                  {activeDeliveries.length} in progress
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => navigate(deliveryRoutes.active)}>
                <Text style={styles.link}>View all</Text>
              </Pressable>
            </View>

            {assigned.status === 'loading' ? (
              <Skeleton height={110} radius={22} />
            ) : assigned.status === 'error' ? (
              <ErrorState
                title="Could not load your deliveries"
                description={assigned.error?.message}
                code={assigned.error?.code}
                onRetry={assigned.reload}
              />
            ) : activeDeliveries.length === 0 ? (
              <EmptyState
                icon="truck"
                title="No active deliveries"
                description="Claim an available order and it will appear here with instant live actions."
                actionLabel="Explore available orders"
                onAction={() => navigate(deliveryRoutes.available)}
              />
            ) : (
              <View style={styles.stack}>
                {activeDeliveries.slice(0, 3).map((delivery) => (
                  <Pressable
                    key={delivery.orderId}
                    accessibilityRole="button"
                    onPress={() =>
                      navigate(deliveryPath('orderDetails', { orderId: delivery.orderId }))
                    }
                    style={({ pressed }) => [styles.orderCard, pressed && { opacity: 0.92 }]}
                  >
                    <View style={styles.orderCardHead}>
                      <View style={styles.orderIdWrap}>
                        <Text style={styles.orderId}>#{delivery.orderId}</Text>
                        <Badge tone={DELIVERY_STATUS_TONE[delivery.status]}>
                          {DELIVERY_STATUS_LABEL[delivery.status]}
                        </Badge>
                      </View>
                      <View style={styles.arrowCircle}>
                        <Icon name="chevronRight" size={14} color="#141518" />
                      </View>
                    </View>

                    {/* Route Flow */}
                    <View style={styles.routeBox}>
                      <View style={styles.routeRow}>
                        <View style={[styles.routeDot, { backgroundColor: '#141518' }]} />
                        <Text numberOfLines={1} style={styles.routeText}>
                          {delivery.merchant?.businessName ?? 'Dairy Store'}
                        </Text>
                      </View>
                      <View style={styles.routeRow}>
                        <View style={[styles.routeDot, { backgroundColor: '#EF4444' }]} />
                        <Text numberOfLines={1} style={styles.routeText}>
                          {delivery.order?.address?.addressLine1 ?? 'Customer location'}, {delivery.order?.address?.city ?? 'Bangalore'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.orderFooter}>
                      <View style={styles.itemsRow}>
                        <Icon name="package" size={14} color="#6B7280" />
                        <Text numberOfLines={1} style={styles.itemsText}>
                          {delivery.order?.items?.length ?? 0} item(s) ·{' '}
                          {delivery.order?.items
                            ?.slice(0, 2)
                            .map((item) => item.productName)
                            .join(', ')}
                        </Text>
                      </View>
                      <Text style={styles.actionPrompt}>View details →</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ── Nearby Available Deliveries ── */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View>
                <Text style={styles.sectionTitle}>Nearby available orders</Text>
                <Text style={styles.sectionSub}>
                  {available.data?.orders?.length ?? 0} open for pickup
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => navigate(deliveryRoutes.available)}>
                <Text style={styles.link}>See all</Text>
              </Pressable>
            </View>

            {available.status === 'loading' ? (
              <LoadingState label="Finding orders near you…" />
            ) : available.status === 'error' ? (
              <ErrorState
                title="Could not load available orders"
                description={available.error?.message}
                code={available.error?.code}
                onRetry={available.reload}
              />
            ) : (available.data?.orders.length ?? 0) === 0 ? (
              <EmptyState
                icon="target"
                title="No open orders right now"
                description="New deliveries from your depot will show up as soon as they are packed and ready."
              />
            ) : (
              <View style={styles.stack}>
                {available.data!.orders.slice(0, 2).map((order) => (
                  <Pressable
                    key={order.orderId}
                    accessibilityRole="button"
                    onPress={() =>
                      navigate(deliveryPath('orderDetails', { orderId: order.orderId }))
                    }
                    style={({ pressed }) => [styles.availableCard, pressed && { opacity: 0.92 }]}
                  >
                    <View style={styles.availableHead}>
                      <View style={styles.orderIdWrap}>
                        <Text style={styles.orderId}>#{order.orderId}</Text>
                        <View style={styles.newBadge}>
                          <Text style={styles.newBadgeText}>New</Text>
                        </View>
                      </View>
                      <Text style={styles.distanceBadge}>
                        {formatDistance(order.delivery.distanceInMeters)}
                      </Text>
                    </View>

                    <View style={styles.availableMeta}>
                      <Text style={styles.customerName}>{order.customer.name}</Text>
                      <Text numberOfLines={1} style={styles.addressLine}>
                        {order.deliveryAddress.addressLine1}, {order.deliveryAddress.city}
                      </Text>
                    </View>
                  </Pressable>
                ))}

                <Button
                  variant="primary"
                  block
                  onPress={() => navigate(deliveryRoutes.available)}
                  style={styles.seeAllBtn}
                >
                  View All Available Deliveries ({available.data!.orders.length})
                </Button>
              </View>
            )}
          </View>
        </>
      )}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  homeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: 18,
    paddingBottom: spacing.md,
  },
  headText: {
    flex: 1,
    minWidth: 0,
  },
  hello: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  headName: {
    fontWeight: '800',
    color: '#141518',
    fontSize: 18,
    letterSpacing: -0.2,
  },

  /* Duty Switch */
  dutyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  dutyCardOn: {
    backgroundColor: '#141518',
  },
  dutyCardOff: {
    backgroundColor: '#E5E7EB',
  },
  dutyInfo: {
    gap: 1,
  },
  dutyName: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  dutyNameOn: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
  dutyNameOff: {
    color: '#6B7280',
  },
  dutyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dutyStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dutyStatusTextOn: {
    color: '#FFFFFF',
  },
  dutyStatusTextOff: {
    color: '#374151',
  },
  switchTrack: {
    width: 32,
    height: 18,
    borderRadius: 9,
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackOn: {
    backgroundColor: '#374151',
  },
  switchTrackOff: {
    backgroundColor: '#D1D5DB',
  },
  switchThumb: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },

  /* Stats */
  stats: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141518',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  /* Offline State */
  offlineBox: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    textAlign: 'center',
    gap: spacing.md,
  },
  offlineIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#141518',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  offlinePromptTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#141518',
  },
  offlinePromptDesc: {
    ...typography.body,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  goOnlineBtn: {
    marginTop: spacing.sm,
  },

  /* Sections */
  section: {
    marginTop: 22,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#141518',
    letterSpacing: -0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 1,
  },
  link: {
    fontSize: 13,
    color: '#141518',
    fontWeight: '700',
  },
  stack: {
    gap: 12,
  },

  /* Order Cards */
  orderCard: {
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
  },
  orderCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141518',
  },
  arrowCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  itemsText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },
  actionPrompt: {
    fontSize: 12,
    fontWeight: '700',
    color: '#141518',
  },

  /* Available Cards */
  availableCard: {
    gap: 8,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
  },
  availableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  newBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  distanceBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  availableMeta: {
    gap: 2,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#141518',
  },
  addressLine: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  seeAllBtn: {
    marginTop: 4,
  },
});
