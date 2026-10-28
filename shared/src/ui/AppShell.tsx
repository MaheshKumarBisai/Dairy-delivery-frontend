import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './tokens';
import { Header, type HeaderProps } from './Header';

/** Device chrome for both apps: safe-area aware frame around the screen content.
 *  (The web app used a fake phone frame; on native/web the OS supplies chrome.) */
export function AppShell({
  children,
  statusLight = false,
  edges = ['top', 'left', 'right', 'bottom'],
  style,
}: {
  children: ReactNode;
  statusLight?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.shell, style] as any}>
      <StatusBar
        barStyle={statusLight ? 'light-content' : 'dark-content'}
        {...({ backgroundColor: 'transparent', translucent: true } as any)}
      />
      {children}
    </SafeAreaView>
  );
}

export interface ScreenProps {
  children: ReactNode;
  /** Structured header (preferred) or a fully custom header node. */
  headerProps?: HeaderProps;
  header?: ReactNode;
  /** Horizontally pad the scroll content (default true). */
  padded?: boolean;
  /** Scroll the content (default true). */
  scroll?: boolean;
  /** Sticky footer (checkout CTA, action bars). */
  footer?: ReactNode;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
  /** Extra bottom inset for bottom navigation. */
  navInset?: number;
  /** Whether the screen has a bottom navigation bar below it. */
  hasNav?: boolean;
  /** Pull-to-refresh callback. */
  onRefresh?: () => void;
  /** Pull-to-refresh spinner status. */
  refreshing?: boolean;
  /** Hide visual loading spinner gesture while preserving pull-to-refresh swipe detection. */
  hideRefreshIndicator?: boolean;
  onScroll?: (event: any) => void;
  scrollEventThrottle?: number;
}

/** Standard screen body: header + (optionally scrolling) content + footer. */
export function Screen({
  children,
  headerProps,
  header,
  padded = true,
  scroll = true,
  footer,
  background = colors.bg,
  contentStyle,
  navInset = 0,
  hasNav = false,
  onRefresh,
  refreshing,
  hideRefreshIndicator = false,
  onScroll,
  scrollEventThrottle = 16,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const gutter = padded ? { paddingHorizontal: 18 } : null;
  const footerBottomPadding = 0;

  const body = scroll ? (
    <ScrollView
      style={{ flex: 1, width: '100%', backgroundColor: background }}
      contentContainerStyle={[
        styles.scrollContent,
        gutter,
        {
          paddingBottom: hasNav
            ? 8 + (footer ? 8 : 0)
            : 24 + navInset + (footer ? 12 : (insets.bottom > 0 ? insets.bottom : 16)),
        },
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={hideRefreshIndicator ? 'transparent' : colors.green}
            colors={hideRefreshIndicator ? ['transparent'] : [colors.green]}
            {...(hideRefreshIndicator
              ? { progressBackgroundColor: 'transparent', progressViewOffset: -1000 }
              : {})}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View
      style={[
        { flex: 1, width: '100%', backgroundColor: background },
        styles.scrollContent,
        gutter,
        {
          paddingBottom: footer ? 0 : hasNav ? 4 : (insets.bottom > 0 ? insets.bottom : 12),
        },
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, width: '100%', backgroundColor: background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {headerProps ? <Header {...headerProps} /> : header}
      {body}
      {footer ? (
        <View style={[styles.footer, gutter, { paddingBottom: footerBottomPadding }]}>{footer}</View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, width: '100%', backgroundColor: colors.bg },
  scrollContent: { paddingTop: 4, flexGrow: 1, width: '100%' },
  footer: {
    backgroundColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 6,
  },
});
