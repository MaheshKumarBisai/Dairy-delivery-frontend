import { RequirePartner } from '../auth/delivery-guard';
import { DeliveryAvailableScreen } from '../screens/delivery-available';

export default function DeliveryAvailableScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryAvailableScreen />
    </RequirePartner>
  );
}
