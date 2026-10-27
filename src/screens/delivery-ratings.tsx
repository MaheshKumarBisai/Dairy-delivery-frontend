import { StyleSheet, Text, View } from 'react-native';
import {
  Badge,
  deliveryApi,
  EmptyState,
  ErrorState,
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

/** Enterprise-grade Ratings & Customer Reviews screen for Delivery Partner */
export function DeliveryRatingsScreen() {
  const navigate = useNavigate();
  const ratings = useAsync((signal) => deliveryApi.getPartnerRatings(signal), []);

  const data = ratings.data;

  return (
    <DeliveryShell
      nav={false}
      headerProps={{
        title: 'Ratings & reviews',
        onBack: () => navigate(-1),
      }}
      onRefresh={() => ratings.reload()}
      refreshing={ratings.refreshing}
    >
      {ratings.status === 'loading' ? (
        <LoadingState label="Loading customer ratings…" />
      ) : ratings.status === 'error' ? (
        <ErrorState
          title="Could not load ratings"
          description={ratings.error?.message}
          code={ratings.error?.code}
          onRetry={ratings.reload}
        />
      ) : !data ? (
        <EmptyState
          icon="star"
          title="No ratings found"
          description="Your rating will appear here after your first completed deliveries."
        />
      ) : (
        <View style={styles.content}>
          {/* Hero Score Card */}
          <View style={styles.heroCard}>
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreValue}>{data.averageRating.toFixed(1)}</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      name="star"
                      size={18}
                      color={star <= Math.round(data.averageRating) ? '#F59E0B' : '#D1D5DB'}
                    />
                  ))}
                </View>
                <Text style={styles.scoreSub}>Based on {data.totalReviews} customer reviews</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.pillValue}>{data.satisfactionPercentage}%</Text>
                <Text style={styles.pillLabel}>Satisfaction</Text>
              </View>
            </View>

            {/* Rating Breakdown Bars */}
            <View style={styles.barsContainer}>
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = (data.ratingBreakdown as Record<number, number>)[stars] || 0;
                const percentage = data.totalReviews > 0 ? (count / data.totalReviews) * 100 : 0;
                return (
                  <View key={stars} style={styles.barRow}>
                    <Text style={styles.barLabel}>{stars} ★</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${percentage}%` }]} />
                    </View>
                    <Text style={styles.barCount}>{count}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Badges Earned */}
          {data.topBadges && data.topBadges.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Partner badges</Text>
              <View style={styles.badgesWrap}>
                {data.topBadges.map((badge, idx) => (
                  <View key={idx} style={styles.badgeItem}>
                    <Icon name="shield" size={16} color="#141518" />
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Customer Reviews List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer feedback ({data.recentReviews.length})</Text>
            {data.recentReviews.length === 0 ? (
              <EmptyState
                icon="message"
                title="No written reviews yet"
                description="Customers can leave compliments and tips after delivery."
              />
            ) : (
              <View style={styles.reviewsList}>
                {data.recentReviews.map((review) => (
                  <View key={review.reviewId} style={styles.reviewCard}>
                    <View style={styles.reviewHead}>
                      <View style={styles.customerMeta}>
                        <Text style={styles.customerName}>{review.customerName}</Text>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </Text>
                      </View>
                      <View style={styles.reviewStars}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Icon
                            key={s}
                            name="star"
                            size={14}
                            color={s <= review.rating ? '#F59E0B' : '#E5E7EB'}
                          />
                        ))}
                      </View>
                    </View>
                    {review.feedback ? (
                      <Text style={styles.feedbackText}>“{review.feedback}”</Text>
                    ) : null}
                    {review.tags && review.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {review.tags.map((tag, tIdx) => (
                          <Badge key={tIdx} tone="slate">
                            {tag}
                          </Badge>
                        ))}
                      </View>
                    )}
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
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadows.sm,
    gap: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  scoreCol: { gap: 4 },
  scoreValue: {
    fontSize: 44,
    fontWeight: '900',
    color: colors.ink,
    lineHeight: 48,
  },
  starsRow: { flexDirection: 'row', gap: 3 },
  scoreSub: { ...typography.micro, color: colors.muted, marginTop: 2 },
  statPill: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 0,
  },
  pillValue: { fontSize: 22, fontWeight: '800', color: '#141518' },
  pillLabel: { ...typography.micro, color: '#6B7280', fontWeight: '700' },
  barsContainer: { gap: 6, paddingTop: 4 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  barLabel: { ...typography.micro, width: 28, color: colors.ink2, fontWeight: '700' },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface2 ?? '#F3F4F6',
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4, backgroundColor: '#F59E0B' },
  barCount: { ...typography.micro, width: 22, textAlign: 'right', color: colors.muted },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.h3, fontSize: 16 },
  badgesWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: '#F3F4F6',
    borderWidth: 0,
  },
  badgeText: { ...typography.small, color: '#141518', fontWeight: '700' },
  reviewsList: { gap: spacing.sm },
  reviewCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 0,
    gap: spacing.xs,
    ...shadows.sm,
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerMeta: { gap: 2 },
  customerName: { ...typography.body, fontWeight: '700', color: colors.ink },
  reviewDate: { ...typography.micro, color: colors.muted },
  reviewStars: { flexDirection: 'row', gap: 2 },
  feedbackText: { ...typography.body, color: colors.ink2, fontStyle: 'italic', marginTop: 4 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  footer: { paddingHorizontal: 18, paddingBottom: spacing.md },
});

export default DeliveryRatingsScreen;
