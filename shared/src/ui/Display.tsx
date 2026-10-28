import type { ReactNode } from 'react';
import { Image, Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from './tokens';
import { Icon, type IconName } from './icons';
import { initials } from './format';

/* ------------------------------------------------------------- timeline -- */

export interface TimelineStep {
  key: string;
  label: ReactNode;
  meta?: ReactNode;
  state: 'done' | 'current' | 'pending';
}

export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <View style={styles.timeline}>
      {steps.map((step, index) => (
        <View key={step.key} style={styles.step}>
          <View style={styles.stepMarker}>
            <View
              style={[
                styles.dot,
                step.state === 'done' && { backgroundColor: colors.green },
                step.state === 'current' && {
                  backgroundColor: colors.white,
                  borderWidth: 2,
                  borderColor: colors.green,
                },
                step.state === 'pending' && { backgroundColor: colors.lineStrong },
              ]}
            >
              {step.state === 'done' ? (
                <Icon name="check" size={13} strokeWidth={2.8} color={colors.white} />
              ) : step.state === 'current' ? (
                <View style={styles.dotInner} />
              ) : null}
            </View>
            {index < steps.length - 1 ? (
              <View style={[styles.rail, step.state !== 'done' && styles.railPending]} />
            ) : null}
          </View>
          <View style={{ flex: 1, minWidth: 0, paddingBottom: index < steps.length - 1 ? spacing.lg : 0 }}>
            <Text style={[styles.stepLabel, step.state === 'pending' && { color: colors.muted }]}>
              {step.label}
            </Text>
            {step.meta ? <Text style={styles.stepMeta}>{step.meta}</Text> : null}
          </View>
        </View>
      ))}
    </View>
  );
}

/** Horizontal icon & dotted line tracker matching Screen 2 */
export function HorizontalOrderTracker({
  status,
  deliveryStatus,
  failedStep,
}: {
  status?: string;
  deliveryStatus?: string;
  failedStep?: number;
}) {
  const isDelivered = status === 'DELIVERED' || deliveryStatus === 'DELIVERED';
  const isFailed = status === 'CANCELLED' || status === 'FAILED' || deliveryStatus === 'FAILED';

  // Determine which step failed if failed
  let activeFailedStep = failedStep;
  if (isFailed && !activeFailedStep) {
    if (deliveryStatus === 'FAILED' || status === 'FAILED') {
      activeFailedStep = 3; // delivery attempt failed at stage 3
    } else if (status === 'CANCELLED') {
      activeFailedStep = 2; // cancelled during preparation
    } else {
      activeFailedStep = 1;
    }
  }

  const isOut =
    status === 'OUT_FOR_DELIVERY' ||
    deliveryStatus === 'OUT_FOR_DELIVERY' ||
    deliveryStatus === 'PICKED_UP';
  const isPrep =
    ['PREPARING', 'READY', 'ASSIGNED'].includes(status ?? '') ||
    ['ASSIGNED', 'ACCEPTED'].includes(deliveryStatus ?? '');

  const currentStep = isDelivered ? 4 : isOut ? 3 : isPrep ? 2 : 1;

  const steps = [
    { num: 1, icon: 'file' as const },
    { num: 2, icon: 'bowl' as const },
    { num: 3, icon: 'bike' as const },
    { num: 4, icon: 'checkCircle' as const },
  ];

  return (
    <View style={styles.hTrackerRow}>
      {steps.map((st, i) => {
        let iconColor: string;
        let strokeW = 2;

        if (isDelivered) {
          // If all stages were passed, show all stages as lime color
          iconColor = '#00E676';
          strokeW = 2.4;
        } else if (isFailed) {
          if (st.num < (activeFailedStep ?? 1)) {
            // Passed stages before failure: lime color
            iconColor = '#00E676';
          } else if (st.num === activeFailedStep) {
            // Failed stage: red color
            iconColor = '#EF4444';
            strokeW = 2.6;
          } else {
            // Unreached stages: muted
            iconColor = '#52555D';
          }
        } else {
          // Normal in-progress: passed and active stages show lime color
          if (st.num <= currentStep) {
            iconColor = '#00E676';
            if (st.num === currentStep) strokeW = 2.5;
          } else {
            iconColor = '#52555D';
          }
        }

        // Connecting dots color
        let dotsColor = '#42454D';
        if (isDelivered) {
          dotsColor = '#00E676';
        } else if (isFailed) {
          if (st.num < (activeFailedStep ?? 1)) {
            dotsColor = '#00E676';
          } else {
            dotsColor = '#42454D';
          }
        } else {
          if (st.num < currentStep) {
            dotsColor = '#00E676';
          } else if (st.num === currentStep) {
            dotsColor = '#00E676';
          } else {
            dotsColor = '#42454D';
          }
        }

        return (
          <View key={st.num} style={styles.hTrackerItem}>
            {/* Pure icon only - no background rectangle box */}
            <View style={styles.hTrackerIconWrap}>
              <Icon name={st.icon} size={22} color={iconColor} strokeWidth={strokeW} />
            </View>
            {i < steps.length - 1 && (
              <Text style={[styles.hTrackerDots, { color: dotsColor }]}>
                ••••••••
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------------- avatar -- */

export function Avatar({
  name,
  src,
  size = 46,
  icon,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  icon?: IconName;
}) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (src) {
    return (
      <Image source={{ uri: src }} style={[style, styles.avatar]} accessibilityLabel={name ?? 'Avatar'} />
    );
  }
  return (
    <View style={[style, styles.avatar, { alignItems: 'center', justifyContent: 'center' }]}>
      {icon ? (
        <Icon name={icon} size={size * 0.5} color={colors.green} />
      ) : (
        <Text style={{ fontSize: size * 0.36, fontWeight: '800', color: colors.greenDark }}>
          {initials(name)}
        </Text>
      )}
    </View>
  );
}

/* ------------------------------------------------------------ star rating -- */

export function StarRating({
  rating,
  count,
  size = 14,
}: {
  rating: number;
  count?: number;
  size?: number;
}) {
  const rounded = Math.round(rating);
  return (
    <View style={styles.ratingRow} accessibilityLabel={`${rating} out of 5`}>
      <View style={{ flexDirection: 'row', gap: 1.5 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Icon
            key={value}
            name="star"
            size={size}
            strokeWidth={0}
            fill={value <= rounded ? colors.star : colors.starOff}
          />
        ))}
      </View>
      <Text style={{ fontSize: size - 1.5, fontWeight: '700', color: colors.ink2 }}>{rating.toFixed(1)}</Text>
      {count !== undefined ? (
        <Text style={{ fontSize: size - 2, color: colors.muted }}>({count})</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: 0 },
  step: { flexDirection: 'row', gap: spacing.md },
  stepMarker: { width: 20, alignItems: 'center' },
  rail: { width: 2, flex: 1, backgroundColor: colors.green, minHeight: 26, marginVertical: 4 },
  railPending: { backgroundColor: colors.line },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  dotInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green },
  stepLabel: { ...typography.bodyStrong, fontSize: 14 },
  stepMeta: { ...typography.caption, marginTop: 2 },

  avatar: { backgroundColor: colors.greenLight, overflow: 'hidden' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },

  hTrackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 6,
  },
  hTrackerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hTrackerIconWrap: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hTrackerDots: {
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
});
