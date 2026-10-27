import { RequirePartner } from '../auth/delivery-guard';
import { DeliveryHomeScreen } from '../screens/delivery-home';

export default function DeliveryHomeScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryHomeScreen />
    </RequirePartner>
  );
}
