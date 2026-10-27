import { RequirePartner } from '../auth/delivery-guard';
import { DeliveryRatingsScreen } from '../screens';

export default function DeliveryRatingsScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryRatingsScreen />
    </RequirePartner>
  );
}
