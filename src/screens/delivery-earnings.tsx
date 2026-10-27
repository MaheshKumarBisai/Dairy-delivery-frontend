import { StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  deliveryApi,
  EmptyState,
  ErrorState,
  formatCurrency,
  Icon,
  LoadingState,
  useAsync,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { useNavigate } from '../router';

/** Enterprise-grade Earnings & Payouts screen for Delivery Partner */
export function DeliveryEarningsScreen() {
  const navigate = useNavigate();
  const earnings = useAsync((signal) => deliveryApi.getPartnerEarnings(signal), []);

  const data = earnings.data;

  return (
    <DeliveryShell
      nav={false}
      headerProps={{
        title: 'My earnings',
        onBack: () => navigate(-1),
      }}
      onRefresh={() => earnings.reload()}
      refreshing={earnings.refreshing}
    >
      {earnings.status === 'loading' ? (
        <LoadingState label="Calculating your earnings…" />
      ) : earnings.status === 'error' ? (
        <ErrorState
          title="Could not load earnings"
          description={earnings.error?.message}
          code={earnings.error?.code}
          onRetry={earnings.reload}
        />
      ) : !data ? (
        <EmptyState
          icon="wallet"
          title="No earnings history"
          description="Your payouts and earnings will appear here as you deliver orders."
        />
      ) : (
        <View style={styles.content}>
          {/* Hero: Today's Earnings */}
          <View style={styles.hero}>
            <View style={styles.heroTop}>
              <View>
                <Text style={styles.micro}>Today’s earnings</Text>
                <Text style={styles.value}>{formatCurrency(data.todayEarnings)}</Text>
              </View>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>{data.todayCount} completed</Text>
              </View>
            </View>
            <Text style={styles.heroSub}>
              Based on completed delivery commissions & distance incentives
            </Text>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This Week</Text>
              <Text style={styles.statNum}>{formatCurrency(data.thisWeekEarnings)}</Text>
              <Text style={styles.statSub}>{data.thisWeekCount} orders</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statNum}>{formatCurrency(data.thisMonthEarnings)}</Text>
              <Text style={styles.statSub}>Current cycle</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>All-Time</Text>
              <Text style={styles.statNum}>{formatCurrency(data.totalEarnings)}</Text>
              <Text style={styles.statSub}>{data.completedDeliveries} delivered</Text>
            </View>
          </View>

          {/* Payout Summary */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Icon name="wallet" size={18} color="#141518" />
              <Text style={styles.cardTitle}>Payout summary</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Available for payout</Text>
              <Text style={styles.payoutAmount}>{formatCurrency(data.payoutSummary.availableForPayout)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.payoutMeta}>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Next settlement date:</Text>
                <Text style={styles.metaVal}>
                  {new Date(data.payoutSummary.nextPayoutDate).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={styles.metaLine}>
                <Text style={styles.metaLabel}>Payout method:</Text>
                <Text style={styles.metaVal}>{data.payoutSummary.payoutMethod}</Text>
              </View>
            </View>
          </View>

          {/* Earnings Breakdown */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Icon name="list" size={18} color={colors.ink} />
              <Text style={styles.cardTitle}>Earnings breakdown</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.bdLabel}>Base delivery pay (₹35/order)</Text>
              <Text style={styles.bdVal}>{formatCurrency(data.breakdown.basePay)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.bdLabel}>Customer delivery fee share</Text>
              <Text style={styles.bdVal}>{formatCurrency(data.breakdown.deliveryFeeShare)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.bdLabel}>Distance & performance incentives</Text>
              <Text style={styles.bdVal}>{formatCurrency(data.breakdown.incentives)}</Text>
            </View>
          </View>

          {/* Recent Payouts / Completed Deliveries */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent delivery earnings ({data.recentPayouts.length})</Text>
            {data.recentPayouts.length === 0 ? (
              <EmptyState
                icon="package"
                title="No deliveries yet"
                description="Deliveries you complete will show their payout credit here."
              />
            ) : (
              <View style={styles.payoutList}>
                {data.recentPayouts.map((item) => (
                  <View key={item.orderId} style={styles.payoutItem}>
                    <View style={styles.itemLeft}>
                      <View style={styles.itemHead}>
                        <Text style={styles.itemOrderId}>#{item.orderId}</Text>
                        <Badge tone="slate">Delivered</Badge>
                      </View>
                      <Text style={styles.itemMeta}>
                        {item.customerName} · {item.itemCount} item(s) · {item.address}
                      </Text>
                      <Text style={styles.itemDate}>
                        {new Date(item.deliveredAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <View style={styles.itemRight}>
                      <Text style={styles.itemCredit}>+{formatCurrency(item.amount)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      )}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg, paddingBottom: spacing.xl },
  hero: {
    gap: 8,
    padding: spacing.lg,
    backgroundColor: '#141518',
    borderRadius: radius.lg,
    ...shadows.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  micro: {
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D1FAE5',
  },
  value: {
    fontSize: 38,
    fontWeight: '900',
    color: colors.white,
    lineHeight: 44,
    marginTop: 4,
  },
  heroBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  heroBadgeText: {
    ...typography.small,
    fontWeight: '700',
    color: colors.white,
  },
  heroSub: {
    ...typography.caption,
    color: '#A7F3D0',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    gap: 2,
    ...shadows.sm,
  },
  statLabel: {
    ...typography.micro,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
    marginTop: 2,
  },
  statSub: {
    ...typography.micro,
    color: colors.ink2,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payoutLabel: {
    ...typography.body,
    color: colors.ink2,
  },
  payoutAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#141518',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginVertical: 4,
  },
  payoutMeta: {
    gap: 4,
  },
  metaLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    ...typography.caption,
    color: colors.muted,
  },
  metaVal: {
    ...typography.caption,
    color: colors.ink,
    fontWeight: '600',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  bdLabel: {
    ...typography.caption,
    color: colors.ink2,
  },
  bdVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.ink,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
  },
  payoutList: {
    gap: spacing.sm,
  },
  payoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 0,
    ...shadows.sm,
  },
  itemLeft: {
    flex: 1,
    gap: 3,
  },
  itemHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemOrderId: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.ink,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.ink2,
  },
  itemDate: {
    ...typography.micro,
    color: colors.muted,
  },
  itemRight: {
    alignItems: 'flex-end',
    paddingLeft: spacing.sm,
  },
  itemCredit: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141518',
  },
  footer: {
    paddingHorizontal: 18,
    paddingBottom: spacing.md,
  },
});
