import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Address = {
  id: string;
  label: string;
  line: string;
  isDefault: boolean;
};

export type PaymentMethod = {
  id: string;
  type: 'upi' | 'card' | 'wallet';
  label: string;
  detail: string;
  active: boolean;
};

const KEYS = {
  wallet: '@fd_wallet',
  cashback: '@fd_cashback',
  favorites: '@fd_favorites',
  premium: '@fd_premium',
  addresses: '@fd_addresses',
  settings: '@fd_settings',
};

const DEFAULT_ADDRESSES: Address[] = [
  { id: '1', label: 'Home', line: 'A-402, Hiranandani Gardens, Powai, Mumbai - 400076', isDefault: true },
  { id: '2', label: 'Office', line: 'WeWork, BKC, Bandra Kurla Complex, Mumbai - 400051', isDefault: false },
];

type Settings = {
  pushNotifications: boolean;
  smsAlerts: boolean;
  biometric: boolean;
  faceId: boolean;
  twoFactor: boolean;
};

type ProfileContextValue = {
  walletBalance: number;
  cashbackEarned: number;
  rewardPoints: number;
  isPremium: boolean;
  favorites: number[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  settings: Settings;
  toggleFavorite: (serviceId: number) => void;
  isFavorite: (serviceId: number) => boolean;
  addAddress: (label: string, line: string) => void;
  upgradePremium: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(1250);
  const [cashbackEarned, setCashbackEarned] = useState(320);
  const [rewardPoints] = useState(1840);
  const [isPremium, setIsPremium] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [addresses, setAddresses] = useState<Address[]>(DEFAULT_ADDRESSES);
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    smsAlerts: true,
    biometric: false,
    faceId: false,
    twoFactor: false,
  });

  const paymentMethods: PaymentMethod[] = useMemo(
    () => [
      { id: '1', type: 'upi', label: 'UPI', detail: 'yashi@upi', active: true },
      { id: '2', type: 'card', label: 'Credit Card', detail: '•••• 4242', active: true },
      { id: '3', type: 'card', label: 'Debit Card', detail: '•••• 8910', active: false },
      { id: '4', type: 'wallet', label: 'Front Door Wallet', detail: `₹${walletBalance}`, active: true },
    ],
    [walletBalance],
  );

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.wallet),
      AsyncStorage.getItem(KEYS.cashback),
      AsyncStorage.getItem(KEYS.favorites),
      AsyncStorage.getItem(KEYS.premium),
      AsyncStorage.getItem(KEYS.addresses),
      AsyncStorage.getItem(KEYS.settings),
    ]).then(([w, c, f, p, a, s]) => {
      if (w) setWalletBalance(Number(w));
      if (c) setCashbackEarned(Number(c));
      if (f) setFavorites(JSON.parse(f));
      if (p) setIsPremium(p === '1');
      if (a) setAddresses(JSON.parse(a));
      if (s) setSettings(JSON.parse(s));
    });
  }, []);

  const value = useMemo(
    () => ({
      walletBalance,
      cashbackEarned,
      rewardPoints,
      isPremium,
      favorites,
      addresses,
      paymentMethods,
      settings,
      toggleFavorite(serviceId: number) {
        setFavorites((prev) => {
          const next = prev.includes(serviceId)
            ? prev.filter((id) => id !== serviceId)
            : [...prev, serviceId];
          AsyncStorage.setItem(KEYS.favorites, JSON.stringify(next));
          return next;
        });
      },
      isFavorite(serviceId: number) {
        return favorites.includes(serviceId);
      },
      addAddress(label: string, line: string) {
        setAddresses((prev) => {
          const next = [...prev, { id: String(Date.now()), label, line, isDefault: false }];
          AsyncStorage.setItem(KEYS.addresses, JSON.stringify(next));
          return next;
        });
      },
      upgradePremium() {
        setIsPremium(true);
        AsyncStorage.setItem(KEYS.premium, '1');
      },
      updateSettings(patch: Partial<Settings>) {
        setSettings((prev) => {
          const next = { ...prev, ...patch };
          AsyncStorage.setItem(KEYS.settings, JSON.stringify(next));
          return next;
        });
      },
    }),
    [walletBalance, cashbackEarned, rewardPoints, isPremium, favorites, addresses, paymentMethods, settings],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
