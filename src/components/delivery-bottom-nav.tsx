import { useLocation, useNavigate } from '../router';
import { BottomNav, type NavItem } from '@dairy/shared';
import { deliveryPath, deliveryRoutes } from '../delivery-routes';

/** Delivery-only bottom navigation (Home · Active · Available · History · Profile). */
export function DeliveryBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items: NavItem[] = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'active', label: 'Active', icon: 'truck' },
    { key: 'available', label: 'Available', icon: 'target' },
    { key: 'profile', label: 'Profile', icon: 'user' },
  ];

  const activeKey = pathname.startsWith(deliveryRoutes.home)
    ? 'home'
    : pathname.includes('/orders/active')
      ? 'active'
      : pathname.startsWith(deliveryRoutes.available)
        ? 'available'
        : pathname.startsWith(deliveryRoutes.profile) ||
            pathname.startsWith(deliveryRoutes.earnings) ||
            pathname.includes('/orders/history')
          ? 'profile'
          : 'home';

  const onSelect = (key: string) => {
    if (key === activeKey) return;
    switch (key) {
      case 'home':
        navigate(deliveryPath('home'));
        break;
      case 'active':
        navigate(deliveryPath('active'));
        break;
      case 'available':
        navigate(deliveryPath('available'));
        break;
      case 'profile':
        navigate(deliveryPath('profile'));
        break;
    }
  };

  return <BottomNav items={items} activeKey={activeKey} onSelect={onSelect} />;
}
