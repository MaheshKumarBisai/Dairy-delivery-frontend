import { PublicOnly } from '../auth/delivery-guard';
import { DeliveryResetPasswordScreen } from '../screens/delivery-reset-password';

export default function DeliveryResetPasswordScreenRoute() {
  return (
    <PublicOnly>
      <DeliveryResetPasswordScreen />
    </PublicOnly>
  );
}
