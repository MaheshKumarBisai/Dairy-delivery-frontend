import { apiRequest } from './http';
import type {
  AuthSession,
  LoginInput,
  RegisterCustomerInput,
  UserProfile,
  TokenPair,
  ForgotPasswordInput,
  VerifyResetOtpInput,
  ResetPasswordInput,
} from '../types/auth';

/** POST /api/v1/auth/login — backend validates credentials and issues tokens. */
export function login(input: LoginInput): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

/** POST /api/v1/auth/register/customer */
export function registerCustomer(input: RegisterCustomerInput): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register/customer', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

/** POST /api/v1/auth/refresh */
export function refreshTokens(refreshToken: string): Promise<TokenPair> {
  return apiRequest<TokenPair>('/auth/refresh', {
    method: 'POST',
    body: { refreshToken },
    auth: false,
    skipRefresh: true,
  });
}

/** GET /api/v1/users/me — authoritative role/identity. Never trust locally stored roles. */
export function getMe(): Promise<UserProfile> {
  return apiRequest<UserProfile>('/users/me');
}

/** POST /api/v1/auth/forgot-password — send OTP to registered email */
export function sendResetOtp(input: ForgotPasswordInput): Promise<{ success: boolean; message: string; devOtp?: string }> {
  return apiRequest<{ success: boolean; message: string; devOtp?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

/** POST /api/v1/auth/verify-reset-otp — verify OTP and get reset token */
export function verifyResetOtp(input: VerifyResetOtpInput): Promise<{ success: boolean; message: string; resetToken: string }> {
  return apiRequest<{ success: boolean; message: string; resetToken: string }>('/auth/verify-reset-otp', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

/** POST /api/v1/auth/reset-password — set new password with validated reset token */
export function resetPassword(input: ResetPasswordInput): Promise<{ success: boolean; message: string }> {
  return apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: input,
    auth: false,
  });
}


