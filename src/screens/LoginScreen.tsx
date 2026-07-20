import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AuthBackground from '../components/auth/AuthBackground';
import AuthButton from '../components/auth/AuthButton';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthTitle from '../components/auth/AuthTitle';
import KeyboardAwareScroll from '../components/KeyboardAwareScroll';
import { AUTH_LOGIN_IMAGE, LOGO } from '../constants/assets';
import { BRAND } from '../config';
import { useAuth } from '../context/AuthContext';
import {
  AppLanguage,
  languageLabel,
  LANGUAGES,
  useLocale,
} from '../context/LocaleContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, submitting } = useAuth();
  const { language, setLanguage, t } = useLocale();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  async function applyLanguage(code: AppLanguage) {
    setLangOpen(false);
    await setLanguage(code);
  }

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert(t('login.missingTitle'), t('login.missingBody'));
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert(t('login.failedTitle'), e instanceof Error ? e.message : t('login.failedBody'));
    }
  }

  return (
    <View style={styles.root}>
      <AuthBackground />

      <KeyboardAwareScroll
        containerStyle={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
        ]}
        extraScrollOffset={72}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <Pressable style={styles.langChip} onPress={() => setLangOpen(true)} hitSlop={8}>
            <Ionicons name="language-outline" size={16} color={BRAND.primary} />
            <Text style={styles.langChipText}>{languageLabel(language)}</Text>
            <Ionicons name="chevron-down" size={14} color={BRAND.muted} />
          </Pressable>
        </View>

        <View style={styles.logoRow}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          <Text style={styles.tagline}>{t('login.tagline')}</Text>
        </View>

        <AuthCard heroImage={AUTH_LOGIN_IMAGE} heroBadge={`⚡ ${t('login.heroBadge')}`}>
          <AuthTitle title={t('login.title')} subtitle={t('login.subtitle')} />

          <AuthInput
            label={t('login.email')}
            icon="person-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@email.com"
          />
          <AuthInput
            label={t('login.password')}
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secure={!showPass}
            showToggle
            onToggle={() => setShowPass((v) => !v)}
            autoComplete="password"
            placeholder={t('login.passwordPlaceholder')}
          />

          <AuthButton label={t('login.button')} onPress={handleLogin} loading={submitting} />

          <View style={styles.registerRow}>
            <Text style={styles.registerHint}>{t('login.noAccount')}</Text>
            <Pressable onPress={() => navigation.navigate('Register' as never)}>
              <Text style={styles.registerLink}>{t('login.signUp')}</Text>
            </Pressable>
          </View>

          <View style={styles.proDivider}>
            <View style={styles.proDividerLine} />
            <Text style={styles.proDividerText}>{t('login.or')}</Text>
            <View style={styles.proDividerLine} />
          </View>

          <View style={styles.proRow}>
            <Pressable
              style={styles.proBtn}
              onPress={() => navigation.navigate('ProLogin' as never)}
            >
              <Ionicons name="briefcase-outline" size={16} color="#1A1A2E" />
              <Text style={styles.proBtnText}>{t('login.proLogin')}</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('ProRegister' as never)}>
              <Text style={styles.proLink}>{t('login.joinPro')}</Text>
            </Pressable>
          </View>
        </AuthCard>

        <View style={styles.demoBox}>
          <View style={styles.demoIcon}>
            <Ionicons name="shield-checkmark" size={16} color="#fff" />
          </View>
          <View style={styles.demoTextWrap}>
            <Text style={styles.demoTitle}>{t('login.demoTitle')}</Text>
            <Text style={styles.demoText}>customer@frontdoor.in · password</Text>
          </View>
        </View>

        <View style={styles.trustRow}>
          {[
            { icon: 'shield-outline' as const, label: t('login.trust.secure') },
            { icon: 'calendar-outline' as const, label: t('login.trust.booking') },
            { icon: 'checkmark-circle-outline' as const, label: t('login.trust.verified') },
            { icon: 'headset-outline' as const, label: t('login.trust.support') },
          ].map((item) => (
            <View key={item.label} style={styles.trustItem}>
              <Ionicons name={item.icon} size={16} color={BRAND.primary} />
              <Text style={styles.trustLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </KeyboardAwareScroll>

      <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLangOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langRow, active && styles.langRowActive]}
                  onPress={() => applyLanguage(lang.code)}
                >
                  <View>
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.native}</Text>
                    <Text style={styles.langSub}>{lang.label}</Text>
                  </View>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
            <Pressable style={styles.modalCancel} onPress={() => setLangOpen(false)}>
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,45,122,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  langChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND.ink,
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  logo: { width: 160, height: 64, marginBottom: 8 },
  tagline: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primary,
    textAlign: 'center',
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
    paddingTop: 4,
  },
  registerHint: { fontSize: 14, color: BRAND.muted, fontWeight: '500' },
  registerLink: { fontSize: 14, color: BRAND.primary, fontWeight: '800' },
  proDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    marginBottom: 14,
  },
  proDividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  proDividerText: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  proBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#EEF0FF',
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.12)',
  },
  proBtnText: { fontSize: 13, fontWeight: '800', color: '#1A1A2E' },
  proLink: { fontSize: 13, fontWeight: '800', color: '#1A1A2E' },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFF0F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.12)',
  },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextWrap: { flex: 1 },
  demoTitle: { fontSize: 12, fontWeight: '800', color: BRAND.ink },
  demoText: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 4,
  },
  trustItem: { alignItems: 'center', width: '23%' },
  trustLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: BRAND.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  langRowActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  langLabel: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  langLabelActive: { color: BRAND.primary },
  langSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  check: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  modalCancel: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { color: BRAND.muted, fontWeight: '700' },
});
