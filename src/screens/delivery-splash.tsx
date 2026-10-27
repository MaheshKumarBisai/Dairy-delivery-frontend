import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AppShell, BrandLogo } from '@dairy/shared';
import { router } from 'expo-router';
import { useDeliveryAuth } from '../auth/delivery-auth.context';

/** 1. Delivery Partner Splash — Clean borderless branding. */
export function DeliverySplashScreen() {
  const { booting, authenticated } = useDeliveryAuth();

  const go = () => {
    router.replace(authenticated ? '/home' : '/login');
  };

  useEffect(() => {
    if (booting) return;
    const timer = setTimeout(
      () => {
        go();
      },
      authenticated ? 700 : 1200,
    );
    return () => clearTimeout(timer);
  }, [booting, authenticated]);

  return (
    <AppShell statusLight>
      <Pressable style={styles.container} onPress={go}>
        {/* Soft Ambient Brand Glows */}
        <View style={styles.ambientGlowTop} pointerEvents="none" />
        <View style={styles.ambientGlowCenter} pointerEvents="none" />

        {/* Center Hero Branding */}
        <View style={styles.heroSection}>
          <BrandLogo size={140} variant="transparent" />

          <View style={styles.titleWrap}>
            <Text style={styles.brandTitle}>
              Dairy<Text style={styles.brandTitleDark}>Fresh</Text>
            </Text>
            <View style={styles.badgeWrap}>
              <View style={styles.badgeDot} />
              <Text style={styles.brandSub}>RIDER & DELIVERY PARTNER</Text>
              <View style={styles.badgeDot} />
            </View>
          </View>
        </View>
      </Pressable>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  ambientGlowTop: {
    position: 'absolute',
    top: -100,
    width: 320,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(204, 255, 0, 0.14)',
  },
  ambientGlowCenter: {
    position: 'absolute',
    top: '32%',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(204, 255, 0, 0.08)',
  },
  heroSection: {
    alignItems: 'center',
    gap: 22,
  },
  logoCard: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 3,
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    color: '#141518',
    letterSpacing: -0.5,
  },
  brandTitleDark: {
    color: '#2C3E50',
  },
  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#141518',
  },
  brandSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#141518',
    letterSpacing: 1.2,
  },
});


