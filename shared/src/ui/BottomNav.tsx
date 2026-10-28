import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from './tokens';
import { Icon, type IconName } from './icons';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
  badge?: number;
}

export function BottomNav({
  items,
  activeKey,
  onSelect,
}: {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();
  // Tight, seamless bottom inset that keeps navigation accessible without creating excessive white gap.
  const bottomInset = insets.bottom > 0 ? Math.max(insets.bottom - 4, 4) : 2;

  return (
    <View
      style={[
        styles.nav,
        {
          paddingBottom: bottomInset,
        },
      ]}
      accessibilityRole="tablist"
    >
      <View style={styles.navRow}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.65 : 1 }]}
              onPress={() => {
                if (active || item.key === activeKey) return;
                onSelect(item.key);
              }}
            >
              <View style={styles.iconWrap}>
                <Icon
                  name={item.icon}
                  size={22}
                  strokeWidth={active ? 2.4 : 1.9}
                  color={active ? colors.ink : colors.muted}
                />
                {item.badge && item.badge > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge > 9 ? '9+' : item.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text numberOfLines={1} style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    borderTopWidth: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    backgroundColor: colors.white,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingTop: 0,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 34, height: 26, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 11, fontWeight: '600', color: colors.muted, maxWidth: '100%' },
  labelActive: { color: colors.ink, fontWeight: '800' },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
