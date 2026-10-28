import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from './tokens';
import { Icon, type IconName } from './icons';
import { Button } from './Button';

/* ------------------------------------------------------------ skeletons -- */

export function Skeleton({
  width = '100%',
  height = 14,
  radius: radiusProp,
  circle = false,
  style,
}: {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  circle?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.55, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      style={[
        {
          width: width as ViewStyle['width'],
          height: height as number,
          borderRadius: circle ? (typeof height === 'number' ? height / 2 : 999) : (radiusProp as number) ?? radius.sm,
          backgroundColor: colors.skeleton,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={styles.skeletonCard}>
      <Skeleton height={118} radius={0} />
      <View style={styles.skeletonBody}>
        <Skeleton width="75%" height={13} />
        <Skeleton width="45%" height={11} />
        <View style={styles.skeletonRow}>
          <Skeleton width={54} height={15} />
          <Skeleton width={32} height={32} circle />
        </View>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------------- states -- */

export function LoadingState({
  label = 'Loading…',
  color = colors.ink,
}: {
  label?: string;
  color?: string;
}) {
  return (
    <View style={styles.loadingState}>
      <ActivityIndicator size="large" color={color} />
      {label ? <Text style={styles.stateBody}>{label}</Text> : null}
    </View>
  );
}

export function EmptyState({
  icon = 'basket',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.state}>
      <View style={styles.stateArt}>
        <Icon name={icon} size={40} strokeWidth={1.6} color={colors.ink} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {description ? <Text style={styles.stateBody}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Button
          variant="primary"
          size="sm"
          onPress={onAction}
          style={{ marginTop: spacing.md, alignSelf: 'center' }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  retrying = false,
  code,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  code?: string;
}) {
  return (
    <View style={styles.state}>
      <View style={[styles.stateArt, { backgroundColor: colors.redBg }]}>
        <Icon name="alert" size={40} strokeWidth={1.6} color={colors.red} />
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateBody}>{description ?? 'Please check your connection and try again.'}</Text>
      {code ? <Text style={styles.stateCaption}>Error code: {code}</Text> : null}
      {onRetry ? (
        <Button
          variant="primary"
          onPress={onRetry}
          disabled={retrying}
          loading={retrying}
          leadingIcon={!retrying ? <Icon name="refresh" size={18} color={colors.white} /> : undefined}
          style={{ marginTop: spacing.sm, alignSelf: 'center' }}
        >
          Retry
        </Button>
      ) : null}
    </View>
  );
}

export function Notice({
  tone = 'amber',
  icon = 'info',
  children,
}: {
  tone?: 'amber' | 'error' | 'muted';
  icon?: IconName;
  children: ReactNode;
}) {
  const palette =
    tone === 'error'
      ? { bg: colors.redBg, fg: colors.red }
      : tone === 'muted'
        ? { bg: colors.slateBg, fg: colors.ink2 }
        : { bg: colors.amberBg, fg: colors.amber };

  return (
    <View style={[styles.notice, { backgroundColor: palette.bg }]}>
      <Icon name={icon} size={16} color={palette.fg} style={{ marginTop: 2 }} />
      <Text style={[styles.noticeText, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

/* --------------------------------------------------------------- toast -- */

type ToastTone = 'default' | 'success' | 'error';

interface ToastApi {
  show: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const api = useMemo<ToastApi>(
    () => ({
      show: (message: string, tone?: ToastTone) => {
        console.log(`[Toast ${tone ?? 'default'}]:`, message);
      },
      success: (message: string) => {
        console.log('[Toast success]:', message);
      },
      error: (message: string) => {
        console.log('[Toast error]:', message);
      },
    }),
    [],
  );

  return <ToastContext.Provider value={api}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    return { show: () => undefined, success: () => undefined, error: () => undefined };
  }
  return context;
}

/* ---------------------------------------------------------- bottom sheet -- */

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetAvoid}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <View style={styles.grabber} />
          {title ? (
            <View style={styles.sheetHead}>
              {typeof title === 'string' ? <Text style={typography.h3}>{title}</Text> : title}
              <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={8} onPress={onClose}>
                <Icon name="x" size={19} color={colors.ink} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.sheetBody}>{children}</View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  skeletonCard: {
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  skeletonBody: { padding: spacing.md, gap: spacing.sm },
  skeletonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  state: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: spacing.xl, gap: spacing.sm },
  loadingState: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: spacing.xl,
    gap: 12,
  },
  stateArt: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.slateBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  stateTitle: { ...typography.h3, textAlign: 'center' },
  stateBody: { ...typography.small, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  stateCaption: { ...typography.caption },

  notice: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  noticeText: { flex: 1, fontSize: 13.5, fontWeight: '600', lineHeight: 19 },

  toastHost: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 100,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.ink,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    maxWidth: '100%',
    ...shadows.md,
  },
  toastText: { color: colors.white, fontSize: 14, fontWeight: '600', flexShrink: 1 },

  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.45)' },
  sheetAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: '100%',
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    maxHeight: '88%',
    ...shadows.lg,
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.lineStrong,
    marginBottom: spacing.md,
  },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sheetBody: { gap: spacing.md, flexShrink: 1, minHeight: 0 },
});
