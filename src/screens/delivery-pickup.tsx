import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Button,
  Card,
  deliveryApi,
  ErrorState,
  Icon,
  LoadingState,
  Notice,
  TextAreaField,
  useToast,
  colors,
  radius,
  spacing,
  typography,
} from '@dairy/shared';
import { DeliveryShell } from '../components/delivery-shell';
import { deliveryPath } from '../delivery-routes';
import { useNavigate, useParams } from '../router';
import { useDeliveryOrder } from '../hooks/use-delivery-order';

/** 7. Pickup confirmation — item checklist, then `PATCH .../status` → PICKED_UP. */
export function DeliveryPickupScreen() {
  const { orderId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { status, assigned, error, reload } = useDeliveryOrder(orderId);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  const items = useMemo(() => assigned?.order?.items ?? [], [assigned]);

  const allChecked = items.length > 0 && items.every((item) => checked[item.id]);
  const deliveryStatus = assigned?.status ?? 'AVAILABLE';

  const toggle = (id: string) => setChecked((current) => ({ ...current, [id]: !current[id] }));

  const confirmPickup = async () => {
    if (!allChecked || busy) return;
    setBusy(true);
    try {
      await deliveryApi.updateDeliveryStatus(orderId, { status: 'PICKED_UP' });
      toast.success('Pickup confirmed');
      navigate(deliveryPath('navigation', { orderId }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not confirm the pickup.');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'loading') {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Confirm pickup', onBack: () => navigate(-1) }}
      >
        <LoadingState label="Loading items…" />
      </DeliveryShell>
    );
  }

  if (status === 'error' || !assigned) {
    return (
      <DeliveryShell
        nav={false}
        headerProps={{ title: 'Confirm pickup', onBack: () => navigate(-1) }}
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

  return (
    <DeliveryShell
      nav={false}
      headerProps={{
        title: 'Confirm pickup',
        subtitle: `#${orderId}`,
        onBack: () => navigate(-1),
      }}
      footer={
        <View style={styles.footer}>
          <Button
            size="lg"
            block
            loading={busy}
            disabled={!allChecked || (deliveryStatus !== 'ASSIGNED' && deliveryStatus !== 'ACCEPTED')}
            onPress={() => void confirmPickup()}
          >
            Confirm Pickup
          </Button>
        </View>
      }
    >
      <Card>
        <Text style={styles.micro}>Collect from</Text>
        <Text style={styles.merchantName}>
          {assigned.merchant?.businessName ?? 'Fresh Dairy Store'}
        </Text>
        <Text style={styles.caption}>{assigned.merchant?.address}</Text>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.h3}>Items to pick up</Text>
          <Text style={styles.caption}>
            {Object.values(checked).filter(Boolean).length}/{items.length} checked
          </Text>
        </View>
        <View style={styles.stack}>
          {items.map((item) => {
            const done = Boolean(checked[item.id]);
            return (
              <Pressable
                key={item.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: done }}
                onPress={() => toggle(item.id)}
                style={({ pressed }) => [
                  styles.checkItem,
                  done && styles.checkItemDone,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <View style={[styles.checkBox, done && styles.checkBoxDone]}>
                  {done ? <Icon name="check" size={14} strokeWidth={3} color={colors.white} /> : null}
                </View>
                <View style={styles.checkMain}>
                  <Text style={styles.checkName}>{item.productName}</Text>
                  <Text style={styles.caption}>
                    {item.quantity} × {item.product?.unit ?? 'unit'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <TextAreaField
          label="Add notes (optional)"
          placeholder="e.g. Items collected and packed"
          numberOfLines={3}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      {deliveryStatus !== 'ASSIGNED' && deliveryStatus !== 'ACCEPTED' ? (
        <View style={styles.notice}>
          <Notice tone="muted" icon="info">
            Current status is {deliveryStatus} — pickup can only be confirmed once the order is
            accepted at the store.
          </Notice>
        </View>
      ) : !allChecked ? (
        <View style={styles.notice}>
          <Notice tone="amber" icon="info">
            Check every item before confirming the pickup.
          </Notice>
        </View>
      ) : null}
    </DeliveryShell>
  );
}

const styles = StyleSheet.create({
  micro: { ...typography.micro, textTransform: 'uppercase', letterSpacing: 0.6 },
  merchantName: { fontWeight: '700', color: colors.ink, fontSize: 16, marginTop: 6 },
  caption: { ...typography.caption, lineHeight: 17 },
  section: { marginTop: spacing.xl },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  h3: { ...typography.h3 },
  stack: { gap: spacing.sm },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  checkItemDone: { backgroundColor: '#F3F4F6', borderColor: '#141518' },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxDone: { backgroundColor: '#141518', borderColor: '#141518' },
  checkMain: { flex: 1, minWidth: 0 },
  checkName: { fontWeight: '700', color: colors.ink, fontSize: 15 },
  notice: { marginTop: 14 },
  footer: { paddingHorizontal: 18, gap: spacing.sm },
});
