import { StatusBar } from 'expo-status-bar';
import * as ExpoSplash from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/components/SplashScreen';
import { ActiveBookingProvider } from './src/context/ActiveBookingContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { FeedbackProvider } from './src/context/FeedbackContext';
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

  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  // Keep splash mounted until auth + onboarding flags are ready so we don't
  // remount RootNavigator (looks like a full app reload).
  const ready = splashDone && !initializing && onboardingDone !== null;

  if (!ready) {
    return <SplashScreen onFinish={onSplashFinish} />;
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
        <FeedbackProvider>
          <NotificationProvider>
            <ActiveBookingProvider>
              <ProfileProvider>
                <LocaleProvider>
                  <CartProvider>
                    <LocationProvider>
                      <AppShell />
                      <StatusBar style="dark" />
                    </LocationProvider>
                  </CartProvider>
                </LocaleProvider>
              </ProfileProvider>
            </ActiveBookingProvider>
          </NotificationProvider>
        </FeedbackProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
