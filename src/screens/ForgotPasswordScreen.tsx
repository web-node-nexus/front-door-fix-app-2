import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>();
  const { t } = useLocale();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const clean = email.trim().toLowerCase();
    if (!clean) {
      Alert.alert(t('forgot.missingEmail'));
      return;
    }
    setSending(true);
    try {
      await api.forgotPassword(clean);
      Alert.alert(t('forgot.sentTitle'), t('forgot.sentBody'), [
        {
          text: t('common.ok'),
          onPress: () => navigation.navigate('ResetPassword', { email: clean }),
        },
      ]);
    } catch (e) {
      Alert.alert(t('forgot.failed'), e instanceof Error ? e.message : t('forgot.failed'));
    } finally {
      setSending(false);
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
        extraScrollOffset={120}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={20} color={BRAND.ink} />
          <Text style={styles.backText}>{t('login.backToLogin')}</Text>
        </Pressable>

        <AuthCard heroImage={AUTH_LOGIN_IMAGE} heroBadge={`🔑 ${t('forgot.title')}`}>
          <AuthTitle title={t('forgot.title')} subtitle={t('forgot.subtitle')} />
          <AuthInput
            label={t('forgot.email')}
            icon="mail-outline"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@email.com"
          />
          <AuthButton label={t('forgot.send')} onPress={handleSend} loading={sending} />
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
