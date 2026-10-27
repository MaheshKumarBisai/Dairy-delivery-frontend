import { configureHttp, createSessionStore, storageRead, storageWrite } from '@dairy/shared';
import { router } from 'expo-router';
import { configureAppStorage } from './storage';

/** Delivery app bootstrap — wires the shared transport to this app's own
 *  namespaced session. Only the public API base URL is configured here. */
export const deliverySession = createSessionStore('dairy.delivery');

/** Idempotent. Configures persistence (localStorage or AsyncStorage) and the
 *  HTTP layer; safe to call from the root layout effect. */
export function configureDeliveryApp(): void {
  configureAppStorage();
  configureHttp({
    session: deliverySession,
    onUnauthorized: () => {
      // Session died (expired/revoked) — drop the rider to login.
      try {
        router.replace('/login');
      } catch {
        /* router not mounted yet */
      }
    },
  });
}

export const DELIVERY_NOTIFY_KEY = 'dairy.delivery.notify';
export const DELIVERY_DUTY_KEY = 'dairy.delivery.duty_status';

export function deliveryPref(key: string, fallback = true): boolean {
  const raw = storageRead(key);
  if (raw === null) return fallback;
  return raw === 'on';
}

export function setDeliveryPref(key: string, value: boolean): void {
  storageWrite(key, value ? 'on' : 'off');
}

type DutyListener = (isOnline: boolean) => void;
const dutyListeners = new Set<DutyListener>();

export function subscribeDutyStatus(listener: DutyListener): () => void {
  dutyListeners.add(listener);
  return () => {
    dutyListeners.delete(listener);
  };
}

export function getStoredDutyStatus(): boolean | null {
  const raw = storageRead(DELIVERY_DUTY_KEY);
  if (raw === 'off') return false;
  if (raw === 'on') return true;
  return null;
}

export function setStoredDutyStatus(isOnline: boolean): void {
  storageWrite(DELIVERY_DUTY_KEY, isOnline ? 'on' : 'off');
  dutyListeners.forEach((fn) => {
    try {
      fn(isOnline);
    } catch {
      /* ignore */
    }
  });
}

