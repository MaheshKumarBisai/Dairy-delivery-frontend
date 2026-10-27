/** Central route map for the Delivery app (file/screen names stay `delivery-*`). */
export const deliveryRoutes = {
  splash: '/',
  login: '/login',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  home: '/home',
  available: '/available',
  active: '/orders/active',
  history: '/orders/history',
  orderDetails: '/orders/:orderId',
  navigation: '/orders/:orderId/navigation',
  pickup: '/orders/:orderId/pickup',
  confirmDelivery: '/orders/:orderId/deliver',
  earnings: '/earnings',
  ratings: '/ratings',
  profile: '/profile',
} as const;

export function deliveryPath(
  route: keyof typeof deliveryRoutes,
  params?: Record<string, string>,
): string {
  let path: string = deliveryRoutes[route];
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    });
  }
  return path;
}
