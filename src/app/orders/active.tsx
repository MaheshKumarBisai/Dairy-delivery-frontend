import { RequirePartner } from '../../auth/delivery-guard';
import { DeliveryActiveScreen } from '../../screens/delivery-active';

export default function DeliveryActiveScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryActiveScreen />
    </RequirePartner>
  );
}
