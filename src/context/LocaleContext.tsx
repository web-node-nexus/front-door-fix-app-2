import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type AppLanguage = 'en' | 'hi' | 'mr';

export const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
];

const STORAGE_KEY = '@frontdoor_language';

type LocaleContextValue = {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => Promise<void>;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STRINGS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'settings.title': 'App Settings',
    'settings.push': 'Push Notifications',
    'settings.pushSub': 'Booking updates & offers',
    'settings.sms': 'SMS Alerts',
    'settings.smsSub': 'OTP and reminders via SMS',
    'settings.language': 'Language',
    'settings.version': 'App Version',
    'settings.change': 'Change',
    'settings.languageSaved': 'Language updated',
    'settings.languageSavedSub': 'App language has been changed successfully.',
    'common.ok': 'OK',
    'common.cancel': 'Cancel',
    'login.tagline': 'Premium home services at your doorstep',
    'login.title': 'Login',
    'login.subtitle': 'Sign in to book services, track bookings, and manage your account.',
    'login.email': 'Email or phone',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Enter password',
    'login.button': 'Login',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign up',
    'login.or': 'or',
    'login.proLogin': 'Professional Login',
    'login.joinPro': 'Join as Pro',
    'login.demoTitle': 'Demo account',
    'login.missingTitle': 'Missing fields',
    'login.missingBody': 'Please enter email and password',
    'login.failedTitle': 'Login failed',
    'login.failedBody': 'Please try again',
    'login.heroBadge': 'Quick response',
    'login.trust.secure': 'Secure',
    'login.trust.booking': 'Quick booking',
    'login.trust.verified': 'Verified',
    'login.trust.support': '24/7 support',
  },
  hi: {
    'settings.title': 'ऐप सेटिंग्स',
    'settings.push': 'पुश नोटिफिकेशन',
    'settings.pushSub': 'बुकिंग अपडेट और ऑफ़र',
    'settings.sms': 'SMS अलर्ट',
    'settings.smsSub': 'OTP और रिमाइंडर SMS पर',
    'settings.language': 'भाषा',
    'settings.version': 'ऐप वर्जन',
    'settings.change': 'बदलें',
    'settings.languageSaved': 'भाषा अपडेट हो गई',
    'settings.languageSavedSub': 'ऐप की भाषा सफलतापूर्वक बदल दी गई है।',
    'common.ok': 'ठीक है',
    'common.cancel': 'रद्द करें',
    'login.tagline': 'प्रीमियम होम सर्विस आपके दरवाज़े पर',
    'login.title': 'लॉगिन',
    'login.subtitle': 'सर्विस बुक करें, बुकिंग ट्रैक करें और अपना अकाउंट मैनेज करें।',
    'login.email': 'ईमेल या फ़ोन',
    'login.password': 'पासवर्ड',
    'login.passwordPlaceholder': 'पासवर्ड दर्ज करें',
    'login.button': 'लॉगिन',
    'login.noAccount': 'अकाउंट नहीं है?',
    'login.signUp': 'साइन अप',
    'login.or': 'या',
    'login.proLogin': 'प्रोफेशनल लॉगिन',
    'login.joinPro': 'प्रो बनें',
    'login.demoTitle': 'डेमो अकाउंट',
    'login.missingTitle': 'फ़ील्ड खाली हैं',
    'login.missingBody': 'कृपया ईमेल और पासवर्ड दर्ज करें',
    'login.failedTitle': 'लॉगिन असफल',
    'login.failedBody': 'कृपया फिर से कोशिश करें',
    'login.heroBadge': 'तेज़ रिस्पॉन्स',
    'login.trust.secure': 'सुरक्षित',
    'login.trust.booking': 'तेज़ बुकिंग',
    'login.trust.verified': 'वेरिफाइड',
    'login.trust.support': '24/7 सपोर्ट',
  },
  mr: {
    'settings.title': 'अॅप सेटिंग्ज',
    'settings.push': 'पुश सूचना',
    'settings.pushSub': 'बुकिंग अपडेट आणि ऑफर',
    'settings.sms': 'SMS अलर्ट',
    'settings.smsSub': 'OTP आणि रिमाइंडर SMS वर',
    'settings.language': 'भाषा',
    'settings.version': 'अॅप आवृत्ती',
    'settings.change': 'बदला',
    'settings.languageSaved': 'भाषा अपडेट झाली',
    'settings.languageSavedSub': 'अॅपची भाषा यशस्वीरित्या बदलली.',
    'common.ok': 'ठीक आहे',
    'common.cancel': 'रद्द करा',
    'login.tagline': 'प्रीमियम होम सर्व्हिसेस तुमच्या दारात',
    'login.title': 'लॉगिन',
    'login.subtitle': 'सर्व्हिस बुक करा, बुकिंग ट्रॅक करा आणि खाते व्यवस्थापित करा.',
    'login.email': 'ईमेल किंवा फोन',
    'login.password': 'पासवर्ड',
    'login.passwordPlaceholder': 'पासवर्ड टाका',
    'login.button': 'लॉगिन',
    'login.noAccount': 'खाते नाही?',
    'login.signUp': 'साइन अप',
    'login.or': 'किंवा',
    'login.proLogin': 'प्रोफेशनल लॉगिन',
    'login.joinPro': 'प्रो व्हा',
    'login.demoTitle': 'डेमो खाते',
    'login.missingTitle': 'फील्ड रिकामी आहेत',
    'login.missingBody': 'कृपया ईमेल आणि पासवर्ड टाका',
    'login.failedTitle': 'लॉगिन अयशस्वी',
    'login.failedBody': 'कृपया पुन्हा प्रयत्न करा',
    'login.heroBadge': 'जलद प्रतिसाद',
    'login.trust.secure': 'सुरक्षित',
    'login.trust.booking': 'जलद बुकिंग',
    'login.trust.verified': 'व्हेरिफाइड',
    'login.trust.support': '24/7 सपोर्ट',
  },
};

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw === 'hi' || raw === 'mr' || raw === 'en') {
        setLanguageState(raw);
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      language,
      async setLanguage(lang: AppLanguage) {
        setLanguageState(lang);
        await AsyncStorage.setItem(STORAGE_KEY, lang);
      },
      t(key: string) {
        return STRINGS[language][key] ?? STRINGS.en[key] ?? key;
      },
    }),
    [language],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function languageLabel(code: AppLanguage): string {
  return LANGUAGES.find((l) => l.code === code)?.native ?? 'English';
}
