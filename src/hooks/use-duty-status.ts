import { useCallback, useEffect, useState } from 'react';
import { deliveryApi, useAsync, useToast } from '@dairy/shared';
import { getStoredDutyStatus, setStoredDutyStatus, subscribeDutyStatus } from '../bootstrap';

export function useDutyStatus() {
  const toast = useToast();
  const partner = useAsync((signal) => deliveryApi.getPartnerProfile(signal), []);
  const [toggling, setToggling] = useState(false);

  // Read stored duty status synchronously from memory mirror
  const stored = getStoredDutyStatus();
  const [localOnline, setLocalOnline] = useState<boolean>(
    stored !== null ? stored : (partner.data?.isAvailable ?? false),
  );

  // Keep state in sync with partner profile data or stored status
  useEffect(() => {
    if (stored !== null) {
      setLocalOnline(stored);
      // If server doesn't match stored choice, sync server to match stored choice
      if (partner.data && partner.data.isAvailable !== stored) {
        void deliveryApi.setAvailability(stored).catch(() => undefined);
      }
    } else if (partner.data) {
      setLocalOnline(partner.data.isAvailable);
      setStoredDutyStatus(partner.data.isAvailable);
    }
  }, [partner.data, stored]);

  // Subscribe to changes triggered by other screens/components
  useEffect(() => {
    return subscribeDutyStatus((next) => {
      setLocalOnline(next);
    });
  }, []);

  const toggleDuty = useCallback(async () => {
    if (toggling) return;
    const next = !localOnline;
    setToggling(true);
    setLocalOnline(next);
    setStoredDutyStatus(next);

    try {
      await deliveryApi.setAvailability(next);
      partner.reload();
      toast.success(next ? 'You’re online — ready for orders' : 'You’re offline — paused');
    } catch (err) {
      // Revert if API failed
      setLocalOnline(!next);
      setStoredDutyStatus(!next);
      toast.error(err instanceof Error ? err.message : 'Could not update your status.');
    } finally {
      setToggling(false);
    }
  }, [localOnline, partner, toggling, toast]);

  return {
    isOnline: localOnline,
    toggling,
    toggleDuty,
    partner,
  };
}
