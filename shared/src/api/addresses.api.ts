import { apiRequest } from './http';
import type { Address, AddressInput } from '../types/commerce';

/** GET /api/v1/addresses */
export function listAddresses(signal?: AbortSignal): Promise<Address[]> {
  return apiRequest<Address[]>('/addresses', { signal });
}

/** POST /api/v1/addresses */
export function createAddress(input: AddressInput): Promise<Address> {
  return apiRequest<Address>('/addresses', { method: 'POST', body: input });
}

/** PATCH /api/v1/addresses/:addressId */
export function updateAddress(addressId: string, input: Partial<AddressInput>): Promise<Address> {
  return apiRequest<Address>(`/addresses/${encodeURIComponent(addressId)}`, {
    method: 'PATCH',
    body: input,
  });
}

/** DELETE /api/v1/addresses/:addressId */
export function deleteAddress(addressId: string): Promise<Address> {
  return apiRequest<Address>(`/addresses/${encodeURIComponent(addressId)}`, { method: 'DELETE' });
}
