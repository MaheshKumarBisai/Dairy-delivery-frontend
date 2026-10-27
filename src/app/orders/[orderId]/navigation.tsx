import { RequirePartner } from '../../../auth/delivery-guard';
import { DeliveryNavigationScreen } from '../../../screens/delivery-navigation';

export default function DeliveryNavigationScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryNavigationScreen />
    </RequirePartner>
  );
}
