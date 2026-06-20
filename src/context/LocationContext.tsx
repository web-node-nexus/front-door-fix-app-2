import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type SavedLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

const STORAGE_KEY = '@frontdoor_location';

export const DEFAULT_LOCATION: SavedLocation = {
  latitude: 19.1176,
  longitude: 72.906,
  label: 'Powai, Mumbai',
};

type LocationContextValue = {
  location: SavedLocation;
  loading: boolean;
  setLocation: (loc: SavedLocation) => Promise<void>;
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<SavedLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as SavedLocation;
        if (parsed?.latitude && parsed?.longitude && parsed?.label) {
          setLocationState(parsed);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      location,
      loading,
      async setLocation(loc: SavedLocation) {
        setLocationState(loc);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
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
