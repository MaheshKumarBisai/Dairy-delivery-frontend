import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { AppShell, Screen, type HeaderProps } from '@dairy/shared';
import { DeliveryBottomNav } from './delivery-bottom-nav';

/** Delivery screen frame: safe-area chrome + header + scroll area + bottom nav. */
export function DeliveryShell({
  children,
  header,
  headerProps,
  nav = true,
  statusLight = false,
  padded = true,
  scroll = true,
  footer,
  style,
  onRefresh,
  refreshing,
}: {
  children: ReactNode;
  header?: ReactNode;
  headerProps?: HeaderProps;
  nav?: boolean;
  statusLight?: boolean;
  padded?: boolean;
  scroll?: boolean;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  return (
    <AppShell
      statusLight={statusLight}
      edges={nav ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
    >
      <View style={[styles.body, style]}>
        <Screen
          headerProps={headerProps}
          header={header}
          padded={padded}
          scroll={scroll}
          footer={footer}
          hasNav={nav}
          onRefresh={onRefresh}
          refreshing={refreshing}
        >
          {children}
        </Screen>
        {nav ? <DeliveryBottomNav /> : null}
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, width: '100%' },
});
