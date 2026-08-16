import { StatusBar } from 'expo-status-bar';
import * as ExpoSplash from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
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
import LanguageSelectScreen from './src/screens/LanguageSelectScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { BRAND } from './src/config';

ExpoSplash.preventAutoHideAsync().catch(() => {});

const ONBOARDING_KEY = '@frontdoor_onboarding_done';
const LANGUAGE_PICKED_KEY = '@frontdoor_language_picked';

function AppShell() {
  const { initializing } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [languagePicked, setLanguagePicked] = useState<boolean | null>(null);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(LANGUAGE_PICKED_KEY),
      AsyncStorage.getItem(ONBOARDING_KEY),
    ])
      .then(([lang, onboard]) => {
        setLanguagePicked(lang === '1');
        setOnboardingDone(onboard === '1');
      })
      .catch(() => {
        setLanguagePicked(false);
        setOnboardingDone(false);
      });
  }, []);

  useEffect(() => {
    if (splashDone) {
      ExpoSplash.hideAsync().catch(() => {});
    }
  }, [splashDone]);

  const onSplashFinish = useCallback(() => setSplashDone(true), []);

  // Never remount splash after it finishes — remounting looks like infinite loading.
  if (!splashDone) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  // Avoid blank white screen while auth/onboarding hydrate.
  if (initializing || languagePicked === null || onboardingDone === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  // Fresh install: language first, then onboarding.
  if (!languagePicked) {
    return (
      <LanguageSelectScreen
        onDone={async () => {
          await AsyncStorage.setItem(LANGUAGE_PICKED_KEY, '1');
          setLanguagePicked(true);
        }}
      />
    );
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
