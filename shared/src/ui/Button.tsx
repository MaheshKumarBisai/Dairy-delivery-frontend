import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius, shadows, spacing } from './tokens';
import { IconColorProvider } from './icons';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'danger-solid'
  | 'white'
  | 'dark'
  | 'lime';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingPrice?: ReactNode;
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border?: string; shadow?: boolean }> = {
  primary: { bg: colors.ink, fg: colors.white, shadow: true },
  secondary: { bg: colors.greenLight, fg: colors.greenDark },
  outline: { bg: colors.white, fg: colors.ink2, border: colors.lineStrong },
  ghost: { bg: colors.transparent, fg: colors.green },
  danger: { bg: colors.redBg, fg: colors.red },
  'danger-solid': { bg: colors.red, fg: colors.white },
  white: { bg: colors.white, fg: colors.ink, border: colors.line, shadow: true },
  dark: { bg: colors.ink, fg: colors.white, shadow: true },
  lime: { bg: colors.lime, fg: colors.ink, shadow: true },
};

const SIZES = {
  sm: { py: 8, px: 14, font: 13, radius: radius.sm },
  md: { py: 12, px: 18, font: 15, radius: radius.md },
  lg: { py: 15, px: 22, font: 16, radius: 24 },
} as const;

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  leadingIcon,
  trailingPrice,
  children,
  onPress,
  disabled,
  style,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const metrics = SIZES[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border ?? palette.bg,
          borderWidth: palette.border ? 1 : 0,
          paddingVertical: metrics.py,
          paddingHorizontal: metrics.px,
          borderRadius: metrics.radius,
          opacity: isDisabled ? 0.55 : pressed ? 0.92 : 1,
          alignSelf: block ? 'stretch' : 'flex-start',
        },
        palette.shadow ? shadows.greenSm : null,
        style,
      ]}
    >
      <IconColorProvider color={palette.fg}>
        <View style={styles.row}>
          {loading ? (
            <ActivityIndicator size="small" color={palette.fg} style={{ marginRight: spacing.sm }} />
          ) : (
            leadingIcon
          )}
          <Text
            numberOfLines={1}
            style={{
              color: palette.fg,
              fontSize: metrics.font,
              fontWeight: '700',
              flexShrink: 1,
              textAlign: 'center',
            }}
          >
            {children}
          </Text>
          {trailingPrice ? (
            <Text style={{ color: palette.fg, fontSize: metrics.font - 1, fontWeight: '800' }}>
              {trailingPrice}
            </Text>
          ) : null}
        </View>
      </IconColorProvider>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
