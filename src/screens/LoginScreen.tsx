import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, submitting } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Please try again');
    }
  }

  return (
    <View style={styles.root}>
      <AuthBackground />

      <KeyboardAwareScroll
        containerStyle={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        extraScrollOffset={72}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
          <View style={styles.logoRow}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <Text style={styles.tagline}>Premium home services at your doorstep</Text>
          </View>

          <AuthCard heroImage={AUTH_LOGIN_IMAGE} heroBadge="⚡ Quick response">
            <AuthTitle
              title="Login"
              subtitle="Sign in to book services, track bookings, and manage your account."
            />

            <AuthInput
              label="Email or phone"
              icon="person-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@email.com"
            />
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secure={!showPass}
              showToggle
              onToggle={() => setShowPass((v) => !v)}
              autoComplete="password"
              placeholder="Enter password"
            />

            <AuthButton label="Login" onPress={handleLogin} loading={submitting} />

            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.registerLink}>Sign up</Text>
              </Pressable>
            </View>

            <View style={styles.proDivider}>
              <View style={styles.proDividerLine} />
              <Text style={styles.proDividerText}>or</Text>
              <View style={styles.proDividerLine} />
            </View>

            <View style={styles.proRow}>
              <Pressable
                style={styles.proBtn}
                onPress={() => navigation.navigate('ProLogin' as never)}
              >
                <Ionicons name="briefcase-outline" size={16} color="#1A1A2E" />
                <Text style={styles.proBtnText}>Professional Login</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('ProRegister' as never)}>
                <Text style={styles.proLink}>Join as Pro</Text>
              </Pressable>
            </View>
          </AuthCard>

          <View style={styles.demoBox}>
            <View style={styles.demoIcon}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
            </View>
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoTitle}>Demo account</Text>
              <Text style={styles.demoText}>customer@frontdoor.in · password</Text>
            </View>
          </View>

          <View style={styles.trustRow}>
            {[
              { icon: 'shield-outline' as const, label: 'Secure' },
              { icon: 'calendar-outline' as const, label: 'Quick booking' },
              { icon: 'checkmark-circle-outline' as const, label: 'Verified' },
              { icon: 'headset-outline' as const, label: '24/7 support' },
            ].map((t) => (
              <View key={t.label} style={styles.trustItem}>
                <Ionicons name={t.icon} size={16} color={BRAND.primary} />
                <Text style={styles.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
      </KeyboardAwareScroll>
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
});
