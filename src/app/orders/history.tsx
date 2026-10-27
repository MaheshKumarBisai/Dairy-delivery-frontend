import { RequirePartner } from '../../auth/delivery-guard';
import { DeliveryHistoryScreen } from '../../screens/delivery-history';

export default function DeliveryHistoryScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryHistoryScreen />
    </RequirePartner>
  );
}
