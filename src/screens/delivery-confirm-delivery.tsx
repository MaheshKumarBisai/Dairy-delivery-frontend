import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  deliveryApi,
  ErrorState,
  formatCurrency,
  Icon,
  KeyValue,
  LoadingState,
  Notice,
  TextAreaField,
  useToast,
  colors,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryRoutes } from '../delivery-routes';
import { useNavigate, useParams } from '../router';
import { useDeliveryOrder } from '../hooks/use-delivery-order';

/** 9. Delivery confirmation — notes + `PATCH .../status` → DELIVERED (or FAILED). */
export function DeliveryConfirmDeliveryScreen() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { status, assigned, error, reload } = useDeliveryOrder(orderId);

  const [notes, setNotes] = useState('');
  const [failedReason, setFailedReason] = useState('');
  const [showFail, setShowFail] = useState(false);
  const [busy, setBusy] = useState<'deliver' | 'fail' | null>(null);

  const update = async (next: 'DELIVERED' | 'FAILED') => {
    if (busy) return;
    setBusy(next === 'DELIVERED' ? 'deliver' : 'fail');
    try {
      await deliveryApi.updateDeliveryStatus(
        orderId,
        next === 'DELIVERED'
          ? { status: 'DELIVERED' }
          : { status: 'FAILED', failedReason: failedReason.trim() || 'Delivery attempt failed' },
      );
      toast.success(next === 'DELIVERED' ? 'Delivery completed' : 'Delivery marked as failed');
      navigate(deliveryRoutes.history, { replace: true });
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
        headerProps={{ title: 'Confirm delivery', onBack: () => navigate(-1) }}
      >
        <LoadingState label="Loading order…" />
      </DeliveryShell>
    );
  }

  if (status === 'error' || !assigned) {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Confirm delivery', onBack: () => navigate(-1) }}
      >
        <ErrorState
          title="Could not load this order"
          description={error?.message ?? 'This order is not assigned to you.'}
          code={error?.code}
          onRetry={reload}
        />
      </DeliveryShell>
    );
  }

  const customer = assigned.order?.customer;
  const items = assigned.order?.items ?? [];

  return (
    <DeliveryShell
      nav={false}
      headerProps={{
        title: 'Confirm delivery',
        subtitle: `#${orderId}`,
        onBack: () => navigate(-1),
      }}
      footer={
        <View style={styles.footer}>
          {showFail ? (
            <>
              <Button
                variant="danger-solid"
                size="lg"
                block
                loading={busy === 'fail'}
                disabled={!failedReason.trim()}
                onPress={() => void update('FAILED')}
              >
                Report failed delivery
              </Button>
              <Button
                variant="ghost"
                size="lg"
                block
                onPress={() => setShowFail(false)}
                disabled={busy !== null}
              >
                Back
              </Button>
            </>
          ) : (
            <>
              <Button
                size="lg"
                block
                leadingIcon={<Icon name="checkCircle" size={19} color={colors.white} />}
                loading={busy === 'deliver'}
                onPress={() => void update('DELIVERED')}
              >
                Mark as Delivered
              </Button>
              <Pressable
                accessibilityRole="button"
                disabled={busy !== null}
                onPress={() => setShowFail(true)}
                style={({ pressed }) => [styles.failLink, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.failLinkText}>Delivery didn’t happen?</Text>
              </Pressable>
            </>
          )}
        </View>
      }
    >
      <Card>
        <View style={styles.customerRow}>
          <Avatar name={customer?.name ?? 'Customer'} size={54} />
          <View style={styles.customerMain}>
            <Text style={styles.customerName}>{customer?.name ?? 'Customer'}</Text>
            <Text style={styles.caption}>
              {assigned.order?.address
                ? `${assigned.order.address.addressLine1}, ${assigned.order.address.city}`
                : 'Delivery address'}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <KeyValue label="Order" value={`#${orderId}`} />
        <KeyValue label="Items" value={`${items.length} products`} />
        <KeyValue label="Order value" value={formatCurrency(assigned.order?.total ?? 0)} />
        <KeyValue label="Payment" value={assigned.order?.payment?.status ?? 'PENDING'} />
      </Card>

      <View style={styles.section}>
        <TextAreaField
          label="Delivery notes (optional)"
          placeholder="e.g. Handed over to the customer at the gate"
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.section}>
        <Notice tone="muted" icon="info">
          Signature capture and proof-of-delivery photos need an upload endpoint that the backend
          doesn’t have yet — notes are the only delivery evidence we can send today.
        </Notice>
      </View>

      {showFail ? (
        <View style={styles.section}>
          <TextAreaField
            label="Why did the delivery fail?"
            placeholder="e.g. Customer unavailable, address not found"
            numberOfLines={3}
            value={failedReason}
            onChangeText={setFailedReason}
          />
        </View>
      ) : null}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  customerMain: { flex: 1, minWidth: 0, gap: 2 },
  customerName: { fontWeight: '800', color: colors.ink, fontSize: 17 },
  caption: { ...typography.caption, lineHeight: 17 },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: spacing.md },
  section: { marginTop: spacing.xl },
  failLink: { alignItems: 'center', paddingVertical: 10 },
  failLinkText: { ...typography.small, fontWeight: '700', color: colors.red },
  footer: { paddingHorizontal: 18, gap: spacing.sm },
});
