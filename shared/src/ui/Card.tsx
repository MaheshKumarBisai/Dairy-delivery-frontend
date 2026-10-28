import type { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from './tokens';
import { IconColorProvider } from './icons';

export interface CardProps {
  tone?: 'default' | 'flat' | 'soft' | 'green';
  tap?: boolean;
  onPress?: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ tone = 'default', tap = false, onPress, children, style }: CardProps) {
  const palette = toneStyles[tone];
  const content = (
    <View style={[styles.card, palette, tap ? styles.tap : null, style]}>{children}</View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
      >
        {content}
      </Pressable>
    );
  }
  return content;
}

const toneStyles = StyleSheet.create({
  default: { backgroundColor: colors.white },
  flat: { backgroundColor: colors.white },
  soft: { backgroundColor: colors.surface },
  green: { backgroundColor: colors.greenPale },
});

export function SectionHeader({
  title,
  action,
  onAction,
  style,
}: {
  title: ReactNode;
  action?: ReactNode;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.sectionHead, style]}>
      <Text style={typography.h3}>{title}</Text>
      {action ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={styles.link}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function KeyValue({
  label,
  value,
  strong = false,
}: {
  label: ReactNode;
  value: ReactNode;
  strong?: boolean;
}) {
  return (
    <View style={styles.kv}>
      <Text style={[styles.kvK, strong && styles.kvStrongK]}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={[styles.kvV, strong && styles.kvStrongV]}>{value}</Text>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>{value}</View>
      )}
    </View>
  );
}

/** Wraps children so nested icons/text pick up the given colour (buttons, notices). */
export function Foreground({ color, children }: { color: string; children: ReactNode }) {
  return <IconColorProvider color={color}>{children}</IconColorProvider>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  tap: { overflow: 'hidden' },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  link: { ...typography.small, color: colors.green, fontWeight: '700' },
  kv: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  kvK: { ...typography.small, color: colors.muted, flexShrink: 1 },
  kvV: { ...typography.small, color: colors.ink, fontWeight: '600', textAlign: 'right' },
  kvStrongK: { fontSize: 15, color: colors.ink, fontWeight: '700' },
  kvStrongV: { fontSize: 17, color: colors.ink, fontWeight: '800' },
});
