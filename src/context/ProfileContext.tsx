import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PLATFORM_PAYMENT } from '../constants/payment';

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

export type PremiumPlanId = 'monthly' | 'yearly';

export type PremiumPayMethod = 'upi' | 'card' | 'wallet';

export type PurchasePremiumInput = {
  planId: PremiumPlanId;
  amount: number;
  method: PremiumPayMethod;
};

export type PurchasePremiumResult =
  | { ok: true; expiresAt: string; planId: PremiumPlanId }
  | { ok: false; error: string };

const KEYS = {
  wallet: '@fd_wallet',
  cashback: '@fd_cashback',
  favorites: '@fd_favorites',
  premium: '@fd_premium',
  premiumMeta: '@fd_premium_meta',
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

type PremiumMeta = {
  planId: PremiumPlanId;
  expiresAt: string;
  paidAmount: number;
  method: PremiumPayMethod;
};

type ProfileContextValue = {
  walletBalance: number;
  cashbackEarned: number;
  rewardPoints: number;
  isPremium: boolean;
  premiumPlan: PremiumPlanId | null;
  premiumExpiresAt: string | null;
  favorites: number[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  settings: Settings;
  toggleFavorite: (serviceId: number) => void;
  isFavorite: (serviceId: number) => boolean;
  addAddress: (label: string, line: string) => void;
  /** @deprecated use purchasePremium */
  upgradePremium: () => void;
  purchasePremium: (input: PurchasePremiumInput) => Promise<PurchasePremiumResult>;
  updateSettings: (patch: Partial<Settings>) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

function expiryForPlan(planId: PremiumPlanId): string {
  const d = new Date();
  if (planId === 'yearly') d.setFullYear(d.getFullYear() + 1);
  else d.setMonth(d.getMonth() + 1);
  return d.toISOString();
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [walletBalance, setWalletBalance] = useState(1250);
  const [cashbackEarned, setCashbackEarned] = useState(320);
  const [rewardPoints] = useState(1840);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumPlan, setPremiumPlan] = useState<PremiumPlanId | null>(null);
  const [premiumExpiresAt, setPremiumExpiresAt] = useState<string | null>(null);
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
      {
        id: '1',
        type: 'upi',
        label: 'Front Door Fix UPI',
        detail: PLATFORM_PAYMENT.upiId,
        active: true,
      },
      {
        id: '2',
        type: 'wallet',
        label: 'Bank Transfer',
        detail: `${PLATFORM_PAYMENT.bankName} · ${PLATFORM_PAYMENT.accountNumber}`,
        active: true,
      },
      { id: '3', type: 'wallet', label: 'Front Door Wallet', detail: `₹${walletBalance}`, active: true },
    ],
    [walletBalance],
  );

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.wallet),
      AsyncStorage.getItem(KEYS.cashback),
      AsyncStorage.getItem(KEYS.favorites),
      AsyncStorage.getItem(KEYS.premium),
      AsyncStorage.getItem(KEYS.premiumMeta),
      AsyncStorage.getItem(KEYS.addresses),
      AsyncStorage.getItem(KEYS.settings),
    ]).then(([w, c, f, p, meta, a, s]) => {
      if (w) setWalletBalance(Number(w));
      if (c) setCashbackEarned(Number(c));
      if (f) setFavorites(JSON.parse(f));
      if (a) setAddresses(JSON.parse(a));
      if (s) setSettings(JSON.parse(s));

      let active = p === '1';
      if (meta) {
        try {
          const parsed = JSON.parse(meta) as PremiumMeta;
          if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() > Date.now()) {
            active = true;
            setPremiumPlan(parsed.planId);
            setPremiumExpiresAt(parsed.expiresAt);
          } else if (parsed.expiresAt) {
            active = false;
            AsyncStorage.setItem(KEYS.premium, '0');
            AsyncStorage.removeItem(KEYS.premiumMeta);
          }
        } catch {
          /* ignore */
        }
      }
      setIsPremium(active);
    });
  }, []);

  const value = useMemo(
    () => ({
      walletBalance,
      cashbackEarned,
      rewardPoints,
      isPremium,
      premiumPlan,
      premiumExpiresAt,
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
        const expiresAt = expiryForPlan('yearly');
        setIsPremium(true);
        setPremiumPlan('yearly');
        setPremiumExpiresAt(expiresAt);
        AsyncStorage.setItem(KEYS.premium, '1');
        AsyncStorage.setItem(
          KEYS.premiumMeta,
          JSON.stringify({ planId: 'yearly', expiresAt, paidAmount: 0, method: 'upi' } satisfies PremiumMeta),
        );
      },
      async purchasePremium(input: PurchasePremiumInput): Promise<PurchasePremiumResult> {
        const { planId, amount, method } = input;
        if (amount <= 0) return { ok: false, error: 'Invalid amount' };

        if (method === 'wallet') {
          if (walletBalance < amount) {
            return {
              ok: false,
              error: `Wallet balance ₹${walletBalance} is low. Add money or pay via UPI/Card.`,
            };
          }
          const nextBal = walletBalance - amount;
          setWalletBalance(nextBal);
          await AsyncStorage.setItem(KEYS.wallet, String(nextBal));
        }

        // Simulate UPI / card gateway settle
        await new Promise((r) => setTimeout(r, method === 'wallet' ? 400 : 900));

        const expiresAt = expiryForPlan(planId);
        const meta: PremiumMeta = { planId, expiresAt, paidAmount: amount, method };
        setIsPremium(true);
        setPremiumPlan(planId);
        setPremiumExpiresAt(expiresAt);
        await AsyncStorage.setItem(KEYS.premium, '1');
        await AsyncStorage.setItem(KEYS.premiumMeta, JSON.stringify(meta));
        return { ok: true, expiresAt, planId };
      },
      updateSettings(patch: Partial<Settings>) {
        setSettings((prev) => {
          const next = { ...prev, ...patch };
          AsyncStorage.setItem(KEYS.settings, JSON.stringify(next));
          return next;
        });
      },
    }),
    [
      walletBalance,
      cashbackEarned,
      rewardPoints,
      isPremium,
      premiumPlan,
      premiumExpiresAt,
      favorites,
      addresses,
      paymentMethods,
      settings,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
