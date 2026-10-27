import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LoadingState, ToastProvider, colors, hydrateStorage } from '@dairy/shared';
import { configureDeliveryApp } from '../bootstrap';
import { DeliveryAuthProvider } from '../auth/delivery-auth.context';

/** Root layout: configure transport/storage, hydrate the session, then mount
 *  providers and the Expo Router stack (headers off — screens draw their own). */
export default function DeliveryRootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    try {
      configureDeliveryApp();
    } catch {
      /* transport can be reconfigured later */
    }
    void hydrateStorage()
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <View style={styles.boot}>
          <LoadingState label="Preparing rider app…" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <DeliveryAuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 280,
            }}
          />
        </ToastProvider>
      </DeliveryAuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
});
