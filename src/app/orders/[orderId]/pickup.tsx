import { RequirePartner } from '../../../auth/delivery-guard';
import { DeliveryPickupScreen } from '../../../screens/delivery-pickup';

export default function DeliveryPickupScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryPickupScreen />
    </RequirePartner>
  );
}
