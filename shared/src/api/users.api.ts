import { apiRequest } from './http';
import type { ChangePasswordInput, UpdateProfileInput, UserProfile } from '../types/auth';

/** GET /api/v1/users/me */
export function getProfile(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me');
}

/** PATCH /api/v1/users/me */
export function updateProfile(input: UpdateProfileInput): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me', { method: 'PATCH', body: input });
}

/** PUT /api/v1/users/me/password */
export function changePassword(input: ChangePasswordInput): Promise<{ ok: true }> {
  return apiRequest<{ ok: true }>('/users/me/password', { method: 'PUT', body: input });
}
