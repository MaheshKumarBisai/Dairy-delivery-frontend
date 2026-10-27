import { PublicOnly } from '../auth/delivery-guard';
import { DeliveryLoginScreen } from '../screens/delivery-login';

export default function DeliveryLoginScreenRoute() {
  return (
    <PublicOnly>
      <DeliveryLoginScreen />
    </PublicOnly>
  );
}
