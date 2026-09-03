import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { APP_STRINGS } from '../i18n/strings';

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

const BASE_STRINGS: Record<AppLanguage, Record<string, string>> = {
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
    'login.forgot': 'Forgot Password?',
    'login.backToLogin': 'Back to login',
    'forgot.title': 'Forgot Password',
    'forgot.subtitle': 'Enter your email. We will send a 6-digit code to reset your password.',
    'forgot.email': 'Email',
    'forgot.send': 'Send reset code',
    'forgot.sentTitle': 'Check your email',
    'forgot.sentBody': 'If this email is registered, we sent a 6-digit code. It expires in 15 minutes.',
    'forgot.missingEmail': 'Please enter your email',
    'forgot.failed': 'Could not send reset code',
    'reset.title': 'Set new password',
    'reset.subtitle': 'Enter the 6-digit code from your email and choose a new password.',
    'reset.code': '6-digit code',
    'reset.newPassword': 'New password',
    'reset.confirmPassword': 'Confirm password',
    'reset.button': 'Reset password',
    'reset.successTitle': 'Password updated',
    'reset.successBody': 'You can log in with your new password.',
    'reset.failed': 'Could not reset password',
    'reset.mismatch': 'Passwords do not match',
    'reset.weak': 'Password must be at least 6 characters',
    'reset.missing': 'Please fill all fields',
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
    'login.forgot': 'पासवर्ड भूल गए?',
    'login.backToLogin': 'लॉगिन पर वापस जाएँ',
    'forgot.title': 'पासवर्ड भूल गए',
    'forgot.subtitle': 'अपना ईमेल दर्ज करें। हम पासवर्ड रीसेट करने के लिए 6 अंकों का कोड भेजेंगे।',
    'forgot.email': 'ईमेल',
    'forgot.send': 'रीसेट कोड भेजें',
    'forgot.sentTitle': 'ईमेल चेक करें',
    'forgot.sentBody': 'अगर यह ईमेल रजिस्टर्ड है, तो 6 अंकों का कोड भेजा गया है। यह 15 मिनट में खत्म हो जाएगा।',
    'forgot.missingEmail': 'कृपया अपना ईमेल दर्ज करें',
    'forgot.failed': 'रीसेट कोड नहीं भेज सके',
    'reset.title': 'नया पासवर्ड सेट करें',
    'reset.subtitle': 'ईमेल वाला 6 अंकों का कोड डालें और नया पासवर्ड चुनें।',
    'reset.code': '6 अंकों का कोड',
    'reset.newPassword': 'नया पासवर्ड',
    'reset.confirmPassword': 'पासवर्ड कन्फर्म करें',
    'reset.button': 'पासवर्ड रीसेट करें',
    'reset.successTitle': 'पासवर्ड अपडेट हो गया',
    'reset.successBody': 'अब नए पासवर्ड से लॉगिन कर सकते हैं।',
    'reset.failed': 'पासवर्ड रीसेट नहीं हो सका',
    'reset.mismatch': 'पासवर्ड मैच नहीं करते',
    'reset.weak': 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
    'reset.missing': 'कृपया सभी फ़ील्ड भरें',
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
    'login.forgot': 'पासवर्ड विसरलात?',
    'login.backToLogin': 'लॉगिनवर परत जा',
    'forgot.title': 'पासवर्ड विसरलात',
    'forgot.subtitle': 'तुमचा ईमेल टाका. पासवर्ड रीसेट करण्यासाठी आम्ही 6 अंकी कोड पाठवू.',
    'forgot.email': 'ईमेल',
    'forgot.send': 'रीसेट कोड पाठवा',
    'forgot.sentTitle': 'ईमेल तपासा',
    'forgot.sentBody': 'हा ईमेल नोंदणीकृत असेल तर 6 अंकी कोड पाठवला आहे. तो 15 मिनिटांत संपेल.',
    'forgot.missingEmail': 'कृपया तुमचा ईमेल टाका',
    'forgot.failed': 'रीसेट कोड पाठवता आला नाही',
    'reset.title': 'नवीन पासवर्ड सेट करा',
    'reset.subtitle': 'ईमेलमधील 6 अंकी कोड टाका आणि नवीन पासवर्ड निवडा.',
    'reset.code': '6 अंकी कोड',
    'reset.newPassword': 'नवीन पासवर्ड',
    'reset.confirmPassword': 'पासवर्ड कन्फर्म करा',
    'reset.button': 'पासवर्ड रीसेट करा',
    'reset.successTitle': 'पासवर्ड अपडेट झाला',
    'reset.successBody': 'आता नवीन पासवर्डने लॉगिन करू शकता.',
    'reset.failed': 'पासवर्ड रीसेट झाला नाही',
    'reset.mismatch': 'पासवर्ड जुळत नाहीत',
    'reset.weak': 'पासवर्ड किमान 6 अक्षरांचा असावा',
    'reset.missing': 'कृपया सर्व फील्ड भरा',
    'login.heroBadge': 'जलद प्रतिसाद',
    'login.trust.secure': 'सुरक्षित',
    'login.trust.booking': 'जलद बुकिंग',
    'login.trust.verified': 'व्हेरिफाइड',
    'login.trust.support': '24/7 सपोर्ट',
  },
};

const STRINGS: Record<AppLanguage, Record<string, string>> = {
  en: { ...BASE_STRINGS.en, ...APP_STRINGS.en },
  hi: { ...BASE_STRINGS.hi, ...APP_STRINGS.hi },
  mr: { ...BASE_STRINGS.mr, ...APP_STRINGS.mr },
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
