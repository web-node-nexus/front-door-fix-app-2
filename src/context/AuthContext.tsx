import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, isProfessionalUser, User } from '../api/client';

type LoginOptions = {
  expectProfessional?: boolean;
  expectCustomer?: boolean;
};

type AuthContextValue = {
  user: User | null;
  /** True only while restoring session on app launch */
  initializing: boolean;
  /** True during login, register, or logout */
  submitting: boolean;
  isAuthenticated: boolean;
  isProfessional: boolean;
  login: (email: string, password: string, options?: LoginOptions) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  registerProfessional: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    city: string;
    address: string;
    pincode: string;
    bio?: string;
    experience_years: number;
  }) => Promise<string | undefined>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name: string; phone?: string }) => Promise<User>;
  updateAvatar: (photo: {
    uri: string;
    name: string;
    type: string;
    base64?: string;
    ext?: string;
  }) => Promise<User>;
  refreshProProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function assertAccountType(user: User, options?: LoginOptions) {
  const isPro = isProfessionalUser(user);
  if (options?.expectProfessional && !isPro) {
    throw new Error('This account is not a professional account. Use customer login.');
  }
  if (options?.expectCustomer && isPro) {
    throw new Error('Please use Professional Login for this account.');
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const restored = await api.restoreSession();
        if (!active || !restored) return;
        if (isProfessionalUser(restored)) {
          try {
            const proUser = await api.proProfile();
            if (active) setUser(proUser);
            return;
          } catch {
            // Fall back to basic restored user
          }
        }
        if (active) setUser(restored);
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      submitting,
      isAuthenticated: !!user,
      isProfessional: isProfessionalUser(user),
      async login(email: string, password: string, options?: LoginOptions) {
        setSubmitting(true);
        try {
          const { user: loggedIn } = await api.login(email, password);
          assertAccountType(loggedIn, options);
          if (isProfessionalUser(loggedIn)) {
            try {
              const proUser = await api.proProfile();
              setUser(proUser);
              return;
            } catch {
              // Use login payload if profile fetch fails
            }
          }
          setUser(loggedIn);
        } catch (e) {
          await api.logout();
          throw e;
        } finally {
          setSubmitting(false);
        }
      },
      async register(payload: {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
      }) {
        setSubmitting(true);
        try {
          const { user: registered } = await api.register(payload);
          setUser(registered);
        } finally {
          setSubmitting(false);
        }
      },
      async registerProfessional(payload: {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
        city: string;
        address: string;
        pincode: string;
        bio?: string;
        experience_years: number;
      }) {
        setSubmitting(true);
        try {
          const { user: registered, message } = await api.registerProfessional(payload);
          setUser(registered);
          return message;
        } finally {
          setSubmitting(false);
        }
      },
      async logout() {
        setSubmitting(true);
        setUser(null);
        try {
          await api.logout();
        } catch {
          // Token clear is best-effort; user stays logged out in app state
        } finally {
          setSubmitting(false);
        }
      },
      async updateProfile(payload: { name: string; phone?: string }) {
        const res = await api.updateProfile(payload);
        setUser(res.user);
        return res.user;
      },
      async updateAvatar(photo: {
        uri: string;
        name: string;
        type: string;
        base64?: string;
        ext?: string;
      }) {
        const res = await api.uploadAvatar(photo);
        setUser(res.user);
        return res.user;
      },
      async refreshProProfile() {
        const proUser = await api.proProfile();
        setUser(proUser);
      },
    }),
    [user, initializing, submitting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
