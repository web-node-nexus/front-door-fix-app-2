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
