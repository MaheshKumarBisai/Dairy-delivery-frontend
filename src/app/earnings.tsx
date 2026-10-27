import { RequirePartner } from '../auth/delivery-guard';
import { DeliveryEarningsScreen } from '../screens/delivery-earnings';

export default function DeliveryEarningsScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryEarningsScreen />
    </RequirePartner>
  );
}
