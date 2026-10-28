/** Mirrors prisma/schema.prisma enums — the backend is the source of truth for roles. */

export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'DELIVERY_PARTNER' | 'ADMIN';

/** Shape returned inside `data` by POST /api/v1/auth/login and /auth/register/*. */
export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  merchantId?: string | null;
  deliveryPartnerId?: string | null;
  businessName?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthSession extends TokenPair {
  user: AuthUser;
}

/** GET /api/v1/users/me */
export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterCustomerInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface UpdateProfileInput {
  name?: string;
  phone?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface VerifyResetOtpInput {
  email: string;
  otp: string;
}

export interface ResetPasswordInput {
  email: string;
  resetToken: string;
  newPassword: string;
}


