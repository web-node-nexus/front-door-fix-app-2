import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SavedLocation = {
  latitude: number;
  longitude: number;
  label: string;
  city: string;
  pincode: string;
  addressLine: string;
};

const STORAGE_KEY = '@frontdoor_location';

export const DEFAULT_LOCATION: SavedLocation = {
  latitude: 19.1176,
  longitude: 72.906,
  label: 'Powai, Mumbai',
  city: 'Mumbai',
  pincode: '400001',
  addressLine: '',
};

type LocationPatch = Partial<Omit<SavedLocation, 'latitude' | 'longitude'>> & {
  latitude?: number;
  longitude?: number;
};

type LocationContextValue = {
  location: SavedLocation;
  loading: boolean;
  setLocation: (loc: SavedLocation) => Promise<void>;
  updateLocation: (patch: LocationPatch) => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function normalizeLocation(raw: Partial<SavedLocation> | null | undefined): SavedLocation {
  if (!raw?.latitude || !raw?.longitude) return DEFAULT_LOCATION;
  const label = raw.label?.trim() || DEFAULT_LOCATION.label;
  const city = raw.city?.trim() || DEFAULT_LOCATION.city;
  let pincode = raw.pincode?.trim() || '';
  // Migrate old suburb pins (e.g. Powai 400076) to the metro hub used by pros.
  if (!/^\d{6}$/.test(pincode) || pincode === '400076') {
    pincode = pincodeForCity(city, label);
  }
  return {
    latitude: raw.latitude,
    longitude: raw.longitude,
    label,
    city,
    pincode,
    addressLine: raw.addressLine?.trim() || '',
  };
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<SavedLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        setLocationState(normalizeLocation(JSON.parse(raw) as Partial<SavedLocation>));
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: SavedLocation) => {
    setLocationState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      location,
      loading,
      async setLocation(loc: SavedLocation) {
        await persist(normalizeLocation(loc));
      },
      async updateLocation(patch: LocationPatch) {
        setLocationState((prev) => {
          const next = normalizeLocation({ ...prev, ...patch });
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [location, loading],
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within LocationProvider');
  return ctx;
}

export function pincodeForCity(city: string, label = ''): string {
  const haystack = `${city} ${label}`.toLowerCase();
  const map: Record<string, string> = {
    mumbai: '400001',
    powai: '400001',
    andheri: '400001',
    bandra: '400001',
    delhi: '110001',
    bangalore: '560001',
    bengaluru: '560001',
    pune: '411001',
    hyderabad: '500001',
  };
  for (const [key, pin] of Object.entries(map)) {
    if (haystack.includes(key)) return pin;
  }
  return '400001';
}

export function parseLocationLabel(label: string): { address: string; city: string } {
  const parts = label.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      address: parts.slice(0, -1).join(', '),
      city: parts[parts.length - 1],
    };
  }
  return { address: label, city: label };
}
