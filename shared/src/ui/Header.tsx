import type { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, spacing, typography } from './tokens';
import { Icon, type IconName } from './icons';

export interface HeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onBack?: () => void;
  backLabel?: string;
  right?: ReactNode;
  bordered?: boolean;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Header({
  title,
  subtitle,
  onBack,
  backLabel = 'Go back',
  right,
  bordered = false,
  solid = false,
  style,
}: HeaderProps) {
  return (
    <View
      accessibilityRole="header"
      style={[
        styles.header,
        bordered && styles.bordered,
        solid && { backgroundColor: colors.white },
        style,
      ]}
    >
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={backLabel}
          hitSlop={8}
          onPress={onBack}
          style={styles.back}
        >
          <Icon name="chevronLeft" size={22} color={colors.ink} />
        </Pressable>
      ) : null}
      <View style={styles.titleWrap}>
        {typeof title === 'string' || typeof title === 'number' ? (
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        ) : (
          title
        )}
        {subtitle ? <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.actions}>{right}</View> : null}
    </View>
  );
}

export function IconButton({
  name,
  label,
  onPress,
  variant,
  badge,
}: {
  name: IconName;
  label: string;
  onPress?: () => void;
  variant?: 'default' | 'ghost' | 'solid';
  badge?: number;
}) {
  const solid = variant === 'solid';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconBtn,
        variant === 'ghost' && styles.iconBtnGhost,
        solid && styles.iconBtnSolid,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Icon name={name} size={solid ? 19 : 20} color={solid ? colors.white : colors.ink} />
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: 18,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  bordered: { borderBottomWidth: 1, borderBottomColor: colors.line },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  titleWrap: { flex: 1, minWidth: 0 },
  title: { ...typography.h3, fontSize: 18 },
  subtitle: { ...typography.caption, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  iconBtn: {
    minWidth: 38,
    height: 38,
    paddingHorizontal: 8,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconBtnGhost: { backgroundColor: colors.transparent },
  iconBtnSolid: { backgroundColor: colors.green },
  badge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
