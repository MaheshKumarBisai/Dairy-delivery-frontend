import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, authApi, type UserProfile, type UserRole } from '@dairy/shared';
import { router } from 'expo-router';
import { deliverySession } from '../bootstrap';

const REQUIRED_ROLE: UserRole = 'DELIVERY_PARTNER';

interface DeliveryAuthValue {
  booting: boolean;
  authenticated: boolean;
  profile: UserProfile | null;
  roleMismatch: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  reloadProfile: () => Promise<void>;
}

const DeliveryAuthContext = createContext<DeliveryAuthValue | null>(null);

export function DeliveryAuthProvider({ children }: { children: ReactNode }) {
  const [booting, setBooting] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roleMismatch, setRoleMismatch] = useState(false);

  const logout = useCallback(() => {
    deliverySession.clear();
    setProfile(null);
    setRoleMismatch(false);
    router.replace('/login');
  }, []);

  const bootstrap = useCallback(async () => {
    if (!deliverySession.isAuthenticated()) {
      setProfile(null);
      setBooting(false);
      return;
    }
    try {
      const me = await authApi.getMe();
      if (me.role !== REQUIRED_ROLE) {
        deliverySession.clear();
        setProfile(null);
        setRoleMismatch(true);
      } else {
        setProfile(me);
        deliverySession.setUser(me);
      }
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        deliverySession.clear();
        setProfile(null);
      }
    } finally {
      setBooting(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const session = await authApi.login({ email, password });
    deliverySession.setTokens({
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    });
    const me = await authApi.getMe();
    if (me.role !== REQUIRED_ROLE) {
      deliverySession.clear();
      throw new ApiError(
        403,
        'ROLE_MISMATCH',
        'This account is not a Delivery Partner account. Sign in with your rider credentials.',
      );
    }
    deliverySession.setUser(me);
    setProfile(me);
    setRoleMismatch(false);
    return me;
  }, []);

  const reloadProfile = useCallback(async () => {
    const me = await authApi.getMe();
    setProfile(me);
    deliverySession.setUser(me);
  }, []);

  const value = useMemo<DeliveryAuthValue>(
    () => ({ booting, authenticated: Boolean(profile), profile, roleMismatch, login, logout, reloadProfile }),
    [booting, profile, roleMismatch, login, logout, reloadProfile],
  );

  return <DeliveryAuthContext.Provider value={value}>{children}</DeliveryAuthContext.Provider>;
}

export function useDeliveryAuth(): DeliveryAuthValue {
  const context = useContext(DeliveryAuthContext);
  if (!context) throw new Error('useDeliveryAuth must be used inside DeliveryAuthProvider');
  return context;
}
