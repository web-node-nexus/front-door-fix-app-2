import { StatusBar } from 'expo-status-bar';
import * as ExpoSplash from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { ActiveBookingProvider } from './src/context/ActiveBookingContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ProfileProvider } from './src/context/ProfileContext';
import RootNavigator from './src/navigation/RootNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';

ExpoSplash.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = '@frontdoor_onboarding_done';

function AppShell() {
  const { initializing } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => setOnboardingDone(value === '1'))
      .catch(() => setOnboardingDone(false));
  }, []);

  useEffect(() => {
    if (splashDone) {
      ExpoSplash.hideAsync().catch(() => {});
    }
  }, [splashDone]);

  const ready = splashDone && !initializing && onboardingDone !== null;

  if (!ready) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
  }

  if (!onboardingDone) {
    return (
      <OnboardingScreen
        onDone={async () => {
          await AsyncStorage.setItem(ONBOARDING_KEY, '1');
          setOnboardingDone(true);
        }}
      />
    );
  }

  return <RootNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <ActiveBookingProvider>
            <ProfileProvider>
              <CartProvider>
                <LocationProvider>
                  <AppShell />
                  <StatusBar style="dark" />
                </LocationProvider>
              </CartProvider>
            </ProfileProvider>
          </ActiveBookingProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
