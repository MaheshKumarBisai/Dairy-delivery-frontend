import type { ReactNode } from 'react';
import { Redirect } from 'expo-router';
import { LoadingState } from '@dairy/shared';
import { deliveryRoutes } from '../delivery-routes';
import { useDeliveryAuth } from './delivery-auth.context';

/** Private delivery routes: wait for the session check, then gate on auth. */
export function RequirePartner({ children }: { children: ReactNode }) {
  const { booting, authenticated } = useDeliveryAuth();

  if (booting) {
    return <LoadingState label="Checking your rider session…" />;
  }
  if (!authenticated) {
    return <Redirect href={deliveryRoutes.login} />;
  }
  return <>{children}</>;
}

/** Public-only routes (login): bounce signed-in riders home. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const { booting, authenticated } = useDeliveryAuth();

  if (booting) {
    return <LoadingState label="Checking your rider session…" />;
  }
  if (authenticated) {
    return <Redirect href={deliveryRoutes.home} />;
  }
  return <>{children}</>;
}
