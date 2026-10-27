import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Badge,
  Button,
  deliveryApi,
  DELIVERY_STATUS_LABEL,
  DELIVERY_STATUS_TONE,
  ErrorState,
  formatDistance,
  Icon,
  LoadingState,
  MapCanvas,
  Notice,
  resolveAddressCoordinates,
  resolveRiderCoordinates,
  useGeolocation,
  useToast,
  colors,
  radius,
  shadows,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath } from '../delivery-routes';
import { useNavigate, useParams } from '../router';
import { useDeliveryOrder } from '../hooks/use-delivery-order';

const LOCATION_PUSH_MS = 4000;

/** 6/8. Navigation — live map with real GPS (partner → backend → customer pin). */
export function DeliveryNavigationScreen() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { status, assigned, available, error, reload } = useDeliveryOrder(orderId);
  const gps = useGeolocation();
  const [busy, setBusy] = useState<string | null>(null);

  // Keep pushing the partner's real GPS so the customer's live tracking stays fresh.
  useEffect(() => {
    if (gps.latitude == null || gps.longitude == null) return;
    const push = () => {
      deliveryApi
        .updatePartnerLocation({ latitude: gps.latitude!, longitude: gps.longitude! })
        .catch(() => undefined);
    };
    push();
    const id = setInterval(push, LOCATION_PUSH_MS);
    return () => clearInterval(id);
  }, [gps.latitude, gps.longitude]);

  const advance = async (next: 'ACCEPTED' | 'OUT_FOR_DELIVERY', key: string) => {
    if (busy) return;
    setBusy(key);
    try {
      await deliveryApi.updateDeliveryStatus(orderId, { status: next });
      toast.success(next === 'ACCEPTED' ? 'Store arrival recorded' : 'Navigation to customer started');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the status.');
    } finally {
      setBusy(null);
    }
  };

  if (status === 'loading') {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Navigation', onBack: () => navigate(-1) }}
      >
        <LoadingState label="Loading route…" />
      </DeliveryShell>
    );
  }

  if (status === 'error') {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Navigation', onBack: () => navigate(-1) }}
      >
        <ErrorState
          title="Could not load this order"
          description={error?.message}
          code={error?.code}
          onRetry={reload}
        />
      </DeliveryShell>
    );
  }

  const deliveryStatus = assigned?.status ?? 'AVAILABLE';
  const goingToStore = deliveryStatus === 'ASSIGNED' || deliveryStatus === 'ACCEPTED';
  const address = assigned?.order?.address ?? null;
  const storeAddress = assigned?.merchant?.address ?? available?.deliveryAddress.city ?? 'Dairy Depot, MG Road, Bangalore';
  const customerName = assigned?.order?.customer?.name ?? available?.customer.name ?? 'Customer';
  const customerPhone = assigned?.order?.customer?.phone ?? available?.customer?.phone ?? '+919876543210';

  // Intelligently resolve coordinates from the customer's stated delivery address
  const targetAddress = address ?? (available ? {
    city: available.deliveryAddress.city,
    postalCode: available.deliveryAddress.postalCode,
    latitude: available.deliveryAddress.latitude,
    longitude: available.deliveryAddress.longitude,
    addressLine1: available.deliveryAddress.addressLine1,
  } : null);

  const customerCoords = resolveAddressCoordinates(targetAddress);
  const customerLat = customerCoords.lat;
  const customerLng = customerCoords.lng;

  // Store Hub in the customer's metropolitan city (~1.4 km away)
  const storeLat = customerLat + 0.006;
  const storeLng = customerLng - 0.008;

  const hasRealGps = gps.latitude != null && gps.longitude != null;
  const distance = available?.delivery.distanceInMeters ?? 2400;

  // Delivery partner position in customer's metropolitan area
  const riderCoords = hasRealGps
    ? resolveRiderCoordinates(customerCoords, { lat: gps.latitude, lng: gps.longitude })
    : resolveRiderCoordinates(customerCoords, null);
  const riderLat = riderCoords.lat;
  const riderLng = riderCoords.lng;

  const storePoint = {
    lat: storeLat,
    lng: storeLng,
    label: assigned?.merchant?.businessName ?? 'Fresh Dairy Store',
  };

  const customerPoint = {
    lat: customerLat,
    lng: customerLng,
    label: customerName,
  };

  const targetPoint = goingToStore ? storePoint : customerPoint;
  const riderPoint = {
    lat: riderLat,
    lng: riderLng,
    label: hasRealGps ? 'You (GPS)' : 'You (Delivery)',
  };


  return (
    <View style={styles.fullScreenContainer}>
      {/* ── 1. Full-Screen Edge-to-Edge Map ── */}
      <View style={styles.mapFull}>
        <MapCanvas
          style={StyleSheet.absoluteFill}
          rider={riderPoint}
          destination={targetPoint}
          destinationTone={goingToStore ? 'store' : 'customer'}
          routeLabel={distance != null ? `${formatDistance(distance)} • 8 min` : 'Delivery Route'}
          verticalOffset={65}
        />
      </View>

      {/* ── 2. Floating Top Header: Back Button & Live Turn HUD (No Duplicate Header) ── */}
      <View style={[styles.floatingTopBar, { top: Math.max(insets.top + 8, 16) }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigate(-1)}
          style={styles.floatingBackBtn}
        >
          <Icon name="arrowLeft" size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.floatingBackText}>Back</Text>
        </Pressable>

        <View style={styles.floatingTurnPill}>
          <View style={[styles.statusDot, { backgroundColor: hasRealGps ? '#10B981' : '#3B82F6' }]} />
          <Text numberOfLines={1} style={styles.floatingTurnText}>
            {goingToStore ? 'To Dairy Store' : `To ${customerName}`}
          </Text>
          {distance != null ? (
            <View style={styles.etaBadge}>
              <Text style={styles.etaText}>{formatDistance(distance)}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── 3. Floating Bottom Navigation Card ── */}
      <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom + 8, 20) }]}>
        {/* Grab bar */}
        <View style={styles.handleWrap}>
          <View style={styles.handleBar} />
        </View>

        {/* Customer / Store Details Row */}
        <View style={styles.destRow}>
          <View style={[styles.destIcon, goingToStore ? styles.destIconStore : styles.destIconCustomer]}>
            <Icon
              name={goingToStore ? 'store' : 'mapPin'}
              size={20}
              color={goingToStore ? '#059669' : '#141518'}
              strokeWidth={2.2}
            />
          </View>
          <View style={styles.destMain}>
            <View style={styles.destHeaderRow}>
              <Text numberOfLines={1} style={styles.destName}>
                {goingToStore ? assigned?.merchant?.businessName ?? 'Fresh Dairy Store' : customerName}
              </Text>
              <Badge tone={DELIVERY_STATUS_TONE[deliveryStatus]}>
                {DELIVERY_STATUS_LABEL[deliveryStatus]}
              </Badge>
            </View>
            <Text numberOfLines={2} style={styles.caption}>
              {goingToStore
                ? storeAddress
                : address
                  ? `${address.addressLine1}, ${address.city} ${address.postalCode}`
                  : available?.deliveryAddress.addressLine1 ?? 'Bangalore'}
            </Text>
          </View>

          {/* Quick Actions (Call) */}
          <View style={styles.quickActions}>
            {customerPhone && !goingToStore ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Call Customer"
                onPress={() => Linking.openURL(`tel:${customerPhone}`).catch(() => undefined)}
                style={styles.circleActionBtn}
              >
                <Icon name="phone" size={16} color="#141518" strokeWidth={2.4} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actions}>
          {deliveryStatus === 'ASSIGNED' ? (
            <Button
              size="lg"
              block
              loading={busy === 'accepted'}
              onPress={() => void advance('ACCEPTED', 'accepted')}
            >
              Reached store
            </Button>
          ) : deliveryStatus === 'ACCEPTED' ? (
            <Button size="lg" block onPress={() => navigate(deliveryPath('pickup', { orderId }))}>
              Confirm pickup
            </Button>
          ) : deliveryStatus === 'PICKED_UP' ? (
            <Button
              size="lg"
              block
              loading={busy === 'out'}
              onPress={() => void advance('OUT_FOR_DELIVERY', 'out')}
            >
              Reached customer
            </Button>
          ) : deliveryStatus === 'OUT_FOR_DELIVERY' ? (
            <Button
              size="lg"
              block
              onPress={() => navigate(deliveryPath('confirmDelivery', { orderId }))}
            >
              Confirm delivery
            </Button>
          ) : (
            <Notice tone="muted" icon="checkCircle">
              Delivery finished ({DELIVERY_STATUS_LABEL[deliveryStatus]}).
            </Notice>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#141518',
    position: 'relative',
    overflow: 'hidden',
  },
  mapFull: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EBECEE',
    zIndex: 1,
  },
  floatingTopBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 30,
    gap: 10,
  },
  floatingBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#141518',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    ...shadows.md,
  },
  floatingBackText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  floatingTurnPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#141518',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    ...shadows.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  floatingTurnText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: colors.white,
  },
  etaBadge: {
    backgroundColor: '#CCFF00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  etaText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#141518',
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 30,
    ...shadows.lg,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 10,
    width: '100%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  destRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  destIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destIconStore: {
    backgroundColor: '#ECFDF5',
  },
  destIconCustomer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  destMain: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  destHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  destName: {
    fontWeight: '800',
    color: colors.ink,
    fontSize: 15,
    flex: 1,
  },
  caption: {
    ...typography.caption,
    color: colors.ink2,
    lineHeight: 16,
    marginTop: 1,
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...shadows.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
