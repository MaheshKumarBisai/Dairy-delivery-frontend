import type { ReactNode } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, toneColors, typography, type Tone } from './tokens';
import { Icon, type IconName } from './icons';

export function Chip({
  active = false,
  soft = false,
  onPress,
  icon,
  children,
  style,
}: {
  active?: boolean;
  soft?: boolean;
  onPress?: () => void;
  icon?: IconName;
  children: ReactNode;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
}) {
  const node = (
    <View
      style={[
        styles.chip,
        active && styles.chipActive,
        soft && !active && styles.chipSoft,
        !onPress && styles.chipStatic,
        style,
      ]}
    >
      {icon ? (
        <Icon name={icon} size={15} color={active ? colors.white : colors.ink2} />
      ) : null}
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{children}</Text>
    </View>
  );
  if (!onPress) return node;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ selected: active }} onPress={onPress}>
      {node}
    </Pressable>
  );
}

export function Badge({
  tone = 'slate',
  children,
  icon,
}: {
  tone?: Tone;
  children: ReactNode;
  icon?: IconName;
}) {
  const palette = toneColors[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      {icon ? <Icon name={icon} size={12} strokeWidth={2.4} color={palette.fg} /> : null}
      <Text style={[styles.badgeText, { color: palette.fg }]} numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}

export function Toggle({
  checked,
  onChange,
  disabled,
  label,
  activeColor,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  activeColor?: string;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked, disabled: Boolean(disabled) }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={[
        styles.track,
        checked && (activeColor ? { backgroundColor: activeColor } : styles.trackOn),
        disabled && { opacity: 0.5 },
      ]}
    >
      <View style={[styles.knob, checked && styles.knobOn]} />
    </Pressable>
  );
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  tone = 'default',
  label,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  tone?: 'default' | 'primary';
  label?: string;
}) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.seg}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            style={[styles.segItem, active && (tone === 'primary' ? styles.segItemPrimary : styles.segItemActive)]}
          >
            <Text
              numberOfLines={1}
              style={[
                styles.segText,
                active && (tone === 'primary' ? styles.segTextPrimary : styles.segTextActive),
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { value: T; label: ReactNode }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View accessibilityRole="tablist" style={styles.tabs}>
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(tab.value)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text numberOfLines={1} style={[styles.tabText, active && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  plain = false,
  label = 'Quantity',
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  plain?: boolean;
  label?: string;
}) {
  const isAtMin = value <= min;
  const isRemove = value === 1 && min === 0;

  return (
    <View accessibilityLabel={label} style={[styles.stepper, plain && styles.stepperPlain]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isRemove ? 'Remove item' : 'Decrease quantity'}
        disabled={isAtMin}
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
      >
        {isRemove ? (
          <Icon name="trash" size={15} color="#DC2626" />
        ) : (
          <Text style={[styles.stepBtnText, isAtMin && { color: colors.muted2 }]}>−</Text>
        )}
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={styles.stepValue}>
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.6 }]}
      >
        <Text style={[styles.stepBtnText, value >= max && { color: colors.muted2 }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.white,
  },
  chipActive: { backgroundColor: colors.green, borderColor: colors.green },
  chipSoft: { backgroundColor: colors.surface },
  chipStatic: {},
  chipText: { ...typography.small, fontWeight: '600', color: colors.ink2 },
  chipTextActive: { color: colors.white },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  badgeText: { fontSize: 11.5, fontWeight: '700' },

  track: {
    width: 46,
    height: 27,
    borderRadius: 14,
    backgroundColor: colors.lineStrong,
    padding: 3,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.green },
  knob: {
    width: 21,
    height: 21,
    borderRadius: 11,
    backgroundColor: colors.white,
    alignSelf: 'flex-start',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobOn: { alignSelf: 'flex-end' },

  seg: {
    flexDirection: 'row',
    backgroundColor: colors.slateBg,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  segItem: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  segItemActive: { backgroundColor: colors.white },
  segItemPrimary: { backgroundColor: colors.green },
  segText: { ...typography.small, fontWeight: '700', color: colors.muted },
  segTextActive: { color: colors.ink },
  segTextPrimary: { color: colors.white },

  tabs: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  tab: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: colors.transparent },
  tabActive: { borderBottomColor: colors.green },
  tabText: { ...typography.small, fontWeight: '700', color: colors.muted },
  tabTextActive: { color: colors.green },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.pill,
  },
  stepperPlain: { borderWidth: 0, backgroundColor: colors.transparent },
  stepBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, fontWeight: '700', color: colors.ink2, lineHeight: 22 },
  stepValue: { minWidth: 26, textAlign: 'center', fontSize: 15, fontWeight: '800', color: colors.ink },
});
