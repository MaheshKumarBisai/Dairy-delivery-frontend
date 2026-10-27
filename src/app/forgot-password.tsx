import { PublicOnly } from '../auth/delivery-guard';
import { DeliveryForgotPasswordScreen } from '../screens/delivery-forgot-password';

export default function DeliveryForgotPasswordScreenRoute() {
  return (
    <PublicOnly>
      <DeliveryForgotPasswordScreen />
    </PublicOnly>
  );
}
