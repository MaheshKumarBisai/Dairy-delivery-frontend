import { RequirePartner } from '../auth/delivery-guard';
import { DeliveryProfileScreen } from '../screens/delivery-profile';

export default function DeliveryProfileScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryProfileScreen />
    </RequirePartner>
  );
}
