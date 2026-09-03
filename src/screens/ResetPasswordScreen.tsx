import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import AuthBackground from '../components/auth/AuthBackground';
import AuthButton from '../components/auth/AuthButton';
import AuthCard from '../components/auth/AuthCard';
import AuthInput from '../components/auth/AuthInput';
import AuthTitle from '../components/auth/AuthTitle';
import KeyboardAwareScroll from '../components/KeyboardAwareScroll';
import { AUTH_LOGIN_IMAGE } from '../constants/assets';
import { BRAND } from '../config';
import { useLocale } from '../context/LocaleContext';

export default function ResetPasswordScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(String(route.params?.email || ''));
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleReset() {
    const cleanEmail = email.trim().toLowerCase();
    const token = code.replace(/\D/g, '').slice(0, 6);
    if (!cleanEmail || token.length !== 6 || !password || !confirm) {
      Alert.alert(t('reset.missing'));
      return;
    }
    if (password.length < 6) {
      Alert.alert(t('reset.weak'));
      return;
    }
    if (password !== confirm) {
      Alert.alert(t('reset.mismatch'));
      return;
    }

    setSaving(true);
    try {
      await api.resetPassword({
        email: cleanEmail,
        token,
        password,
        password_confirmation: confirm,
      });
      Alert.alert(t('reset.successTitle'), t('reset.successBody'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Login') },
      ]);
    } catch (e) {
      Alert.alert(t('reset.failed'), e instanceof Error ? e.message : t('reset.failed'));
    } finally {
      setSaving(false);
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
        extraScrollOffset={140}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={BRAND.ink} />
          <Text style={styles.backText}>{t('login.backToLogin')}</Text>
        </Pressable>

        <AuthCard heroImage={AUTH_LOGIN_IMAGE} heroBadge={`🔐 ${t('reset.title')}`}>
          <AuthTitle title={t('reset.title')} subtitle={t('reset.subtitle')} />
          <AuthInput
            label={t('forgot.email')}
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />
          <AuthInput
            label={t('reset.code')}
            icon="keypad-outline"
            value={code}
            onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
          />
          <AuthInput
            label={t('reset.newPassword')}
            icon="lock-closed-outline"
            value={password}
            onChangeText={setPassword}
            secure={!showPass}
            showToggle
            onToggle={() => setShowPass((v) => !v)}
            autoComplete="password-new"
          />
          <AuthInput
            label={t('reset.confirmPassword')}
            icon="lock-closed-outline"
            value={confirm}
            onChangeText={setConfirm}
            secure
            autoComplete="password-new"
          />
          <AuthButton label={t('reset.button')} onPress={handleReset} loading={saving} />
        </AuthCard>
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 20, flexGrow: 1 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  backText: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
});
