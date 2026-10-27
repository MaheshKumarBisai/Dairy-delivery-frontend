import { describe, expect, it } from 'vitest';
import { deliveryPath, deliveryRoutes } from './delivery-routes';

describe('delivery routes', () => {
  it('exposes every delivery screen', () => {
    expect(Object.keys(deliveryRoutes)).toEqual(
      expect.arrayContaining([
        'splash',
        'login',
        'home',
        'available',
        'active',
        'history',
        'orderDetails',
        'navigation',
        'pickup',
        'confirmDelivery',
        'earnings',
        'ratings',
        'profile',
      ]),
    );
  });

  it('substitutes route params', () => {
    expect(deliveryPath('orderDetails', { orderId: 'o-1' })).toBe('/orders/o-1');
    expect(deliveryPath('navigation', { orderId: 'o-1' })).toBe('/orders/o-1/navigation');
    expect(deliveryPath('home')).toBe('/home');
  });
});
