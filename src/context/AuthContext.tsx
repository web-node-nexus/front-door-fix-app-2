import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, User } from '../api/client';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: { name: string; phone?: string }) => Promise<User>;
  updateAvatar: (photo: { uri: string; name: string; type: string }) => Promise<User>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.restoreSession()
      .then((restored) => {
        if (active && restored) setUser(restored);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(email: string, password: string) {
        setLoading(true);
        try {
          const { user: loggedIn } = await api.login(email, password);
          setUser(loggedIn);
        } finally {
          setLoading(false);
        }
      },
      async register(payload: {
        name: string;
        email: string;
        phone: string;
        password: string;
        password_confirmation: string;
      }) {
        setLoading(true);
        try {
          const { user: registered } = await api.register(payload);
          setUser(registered);
        } finally {
          setLoading(false);
        }
      },
      async logout() {
        await api.logout();
        setUser(null);
      },
      async updateProfile(payload: { name: string; phone?: string }) {
        const res = await api.updateProfile(payload);
        setUser(res.user);
        return res.user;
      },
      async updateAvatar(photo: { uri: string; name: string; type: string }) {
        const res = await api.uploadAvatar(photo);
        setUser(res.user);
        return res.user;
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
