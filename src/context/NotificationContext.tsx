import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api, MobileNotification } from '../api/client';
import { useAuth } from './AuthContext';

const STORAGE_KEY = '@frontdoor_notifications_read';

export type AppNotification = MobileNotification;

type NotificationContextValue = {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [localReadIds, setLocalReadIds] = useState<Set<string>>(new Set());
  const localReadRef = useRef(localReadIds);
  localReadRef.current = localReadIds;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setLocalReadIds(new Set(JSON.parse(raw) as string[]));
      })
      .catch(() => {});
  }, []);

  const persistRead = async (ids: Set<string>) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    } catch {
      // ignore
    }
  };

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await api.notifications();
      setNotifications(
        data.notifications.map((n) => ({
          ...n,
          read: n.read || localReadRef.current.has(n.id),
        })),
      );
    } catch {
      // keep last list on blip
    }
  }, [user]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 10000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      refresh,
      markRead(id: string) {
        setLocalReadIds((prev) => {
          const next = new Set(prev);
          next.add(id);
          persistRead(next);
          return next;
        });
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        api.markNotificationRead(id).catch(() => {});
      },
      markAllRead() {
        const ids = new Set(notifications.map((n) => n.id));
        setLocalReadIds(ids);
        persistRead(ids);
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      },
    }),
    [notifications, unreadCount, refresh],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
