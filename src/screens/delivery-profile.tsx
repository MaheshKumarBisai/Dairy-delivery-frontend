import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Badge,
  deliveryApi,
  formatCurrency,
  Icon,
  KeyValue,
  LoadingState,
  ErrorState,
  Toggle,
  useAsync,
  radius,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryRoutes } from '../delivery-routes';
import { useNavigate } from '../router';
import { useDeliveryAuth } from '../auth/delivery-auth.context';
import { useDutyStatus } from '../hooks/use-duty-status';

/** 12. Delivery Partner Profile — Modern attractive design without outlines or shadows. */
export function DeliveryProfileScreen() {
  const navigate = useNavigate();
  const { profile, logout } = useDeliveryAuth();
  const { isOnline, toggling, toggleDuty: toggle, partner } = useDutyStatus();

  const earnings = useAsync((signal) => deliveryApi.getPartnerEarnings(signal), []);
  const ratings = useAsync((signal) => deliveryApi.getPartnerRatings(signal), []);

  const menuRow = (
    icon: 'truck' | 'store' | 'target' | 'list' | 'wallet' | 'file' | 'bank' | 'star',
    _iconBg: string,
    _iconColor: string,
    label: string,
    end: React.ReactNode,
    options: { onPress?: () => void; disabled?: boolean; isLast?: boolean } = {},
  ) => {
    const content = (
      <View
        style={[
          styles.menuRow,
          !options.isLast && styles.menuRowDivider,
          options.disabled && { opacity: 0.5 },
        ]}
      >
        <View style={styles.menuIconWrap}>
          <Icon name={icon} size={20} color="#141518" />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
        <View style={styles.menuEnd}>{end}</View>
      </View>
    );
    if (!options.onPress) return content;
    return (
      <Pressable
        accessibilityRole="button"
        disabled={options.disabled}
        onPress={options.onPress}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        {content}
      </Pressable>
    );
  };

  return (
    <DeliveryShell
      headerProps={{
        title: 'Profile',
      }}
    >
      {/* ── Rider Top Hero Card (No outline, No shadow) ─────────────── */}
      <View style={styles.headCard}>
        <Avatar name={profile?.name ?? 'Rider'} size={72} />
        <View style={styles.headDetails}>
          <Text style={styles.headName}>{profile?.name ?? 'Delivery Partner'}</Text>
          <Text style={styles.headMeta}>{profile?.phone ?? profile?.email ?? ''}</Text>
          <View style={styles.verified}>
            <Icon name="shield" size={14} color="#141518" />
            <Text style={styles.verifiedText}>Verified rider</Text>
          </View>
        </View>
      </View>

      {/* ── Quick Stats Row (Pure Black Icons, No colored boxes) ────── */}
      <View style={styles.statsRow}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigate(deliveryRoutes.earnings)}
          style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
        >
          <View style={styles.statIconWrap}>
            <Icon name="wallet" size={20} color="#141518" />
          </View>
          <Text style={styles.statValue}>
            {earnings.data ? formatCurrency(earnings.data.totalEarnings) : '₹0'}
          </Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigate(deliveryRoutes.ratings)}
          style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.8 }]}
        >
          <View style={styles.statIconWrap}>
            <Icon name="star" size={20} color="#141518" />
          </View>
          <Text style={styles.statValue}>
            ★ {ratings.data ? ratings.data.averageRating.toFixed(1) : '5.0'}
          </Text>
          <Text style={styles.statLabel}>
            {ratings.data?.totalReviews ? `${ratings.data.totalReviews} reviews` : 'Top Rated'}
          </Text>
        </Pressable>
      </View>

      {/* ── Operational Info (No outline, No shadow) ────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shift & Vehicle</Text>
        <View style={styles.card}>
          {partner.status === 'loading' ? (
            <View style={styles.stateBox}>
              <LoadingState label="Loading rider profile…" />
            </View>
          ) : partner.status === 'error' ? (
            <View style={styles.stateBox}>
              <ErrorState
                title="Could not load rider profile"
                description={partner.error?.message}
                code={partner.error?.code}
                onRetry={partner.reload}
              />
            </View>
          ) : (
            <>
              {menuRow(
                'target',
                '#F3F4F6',
                isOnline ? '#141518' : '#6B7280',
                'Duty Status',
                (
                  <Toggle
                    checked={isOnline}
                    onChange={() => void toggle()}
                    disabled={toggling}
                    activeColor="#141518"
                    label="Accept new orders"
                  />
                ),
              )}
              {menuRow(
                'truck',
                '#EBF5FF',
                '#2563EB',
                'Vehicle',
                (
                  <Text numberOfLines={1} style={styles.menuValue}>
                    {partner.data?.vehicleType ?? 'Motorcycle'}
                    {partner.data?.vehicleNumber ? ` · ${partner.data.vehicleNumber}` : ''}
                  </Text>
                ),
              )}
              {menuRow(
                'store',
                '#FEF3C7',
                '#D97706',
                'Assigned Depot',
                (
                  <Text numberOfLines={1} style={[styles.menuValue, styles.menuValueWide]}>
                    {partner.data?.merchant?.businessName ?? 'DairyFresh Central'}
                  </Text>
                ),
                { isLast: true },
              )}
            </>
          )}
        </View>
      </View>

      {/* ── History & Performance (No outline, No shadow) ───────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deliveries & Performance</Text>
        <View style={styles.card}>
          {menuRow(
            'list',
            '#F3E8FF',
            '#9333EA',
            'Delivery history',
            <Icon name="chevronRight" size={17} color="#9CA3AF" />,
            { onPress: () => navigate(deliveryRoutes.history) },
          )}
          {menuRow(
            'wallet',
            '#F3F4F6',
            '#141518',
            'Earnings & payouts',
            (
              <View style={styles.endRow}>
                {earnings.data ? (
                  <Badge tone="slate">{formatCurrency(earnings.data.totalEarnings)}</Badge>
                ) : null}
                <Icon name="chevronRight" size={17} color="#9CA3AF" />
              </View>
            ),
            { onPress: () => navigate(deliveryRoutes.earnings) },
          )}
          {menuRow(
            'star',
            '#FEF3C7',
            '#D97706',
            'Ratings & reviews',
            (
              <View style={styles.endRow}>
                {ratings.data ? (
                  <Badge tone="amber">★ {ratings.data.averageRating.toFixed(1)}</Badge>
                ) : null}
                <Icon name="chevronRight" size={17} color="#9CA3AF" />
              </View>
            ),
            { onPress: () => navigate(deliveryRoutes.ratings) },
          )}
          {menuRow(
            'file',
            '#F1F5F9',
            '#64748B',
            'Documents',
            <Badge tone="slate">Verified</Badge>,
            { disabled: true },
          )}
          {menuRow(
            'bank',
            '#F1F5F9',
            '#64748B',
            'Bank details',
            <Badge tone="slate">Linked</Badge>,
            { disabled: true, isLast: true },
          )}
        </View>
      </View>

      {/* ── Account Details (No outline, No shadow) ─────────────────── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rider Account</Text>
        <View style={[styles.card, styles.kvCard]}>
          <KeyValue label="Email" value={profile?.email ?? '—'} />
          <KeyValue label="Phone" value={profile?.phone ?? '—'} />
          <KeyValue label="Partner ID" value={partner.data?.deliveryPartnerId ?? '—'} />
          <KeyValue
            label="Last location update"
            value={
              partner.data?.lastLocationAt
                ? new Date(partner.data.lastLocationAt).toLocaleTimeString('en-IN')
                : 'Not shared yet'
            }
          />
        </View>
      </View>

      {/* ── Log Out (Pure Text with Red Icon, No Box, No Outline) ───── */}
      <View style={styles.logoutWrap}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log out"
          onPress={logout}
          style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.6 }]}
        >
          <Icon name="logout" size={16} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  headCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headDetails: { flex: 1, gap: 3 },
  headName: { fontSize: 20, fontWeight: '800', color: '#141518', letterSpacing: -0.3 },
  headMeta: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#141518' },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#141518' },
  statLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
  },
  stateBox: { padding: spacing.md },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  menuIconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { fontSize: 15, fontWeight: '700', color: '#141518', flex: 1 },
  menuEnd: { alignItems: 'flex-end', maxWidth: '55%' },
  menuValue: { ...typography.small, color: '#4B5563', fontWeight: '600' },
  menuValueWide: { textAlign: 'right' },
  endRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  kvCard: { paddingHorizontal: 16, paddingVertical: 8 },
  logoutWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
    letterSpacing: 0.2,
  },
});
