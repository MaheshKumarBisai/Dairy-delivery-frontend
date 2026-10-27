import { RequirePartner } from '../../../auth/delivery-guard';
import { DeliveryConfirmDeliveryScreen } from '../../../screens/delivery-confirm-delivery';

export default function DeliveryConfirmDeliveryScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryConfirmDeliveryScreen />
    </RequirePartner>
  );
}
