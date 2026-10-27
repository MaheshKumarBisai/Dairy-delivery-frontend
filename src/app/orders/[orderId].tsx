import { RequirePartner } from '../../auth/delivery-guard';
import { DeliveryOrderDetailsScreen } from '../../screens/delivery-order-details';

export default function DeliveryOrderDetailsScreenRoute() {
  return (
    <RequirePartner>
      <DeliveryOrderDetailsScreen />
    </RequirePartner>
  );
}
