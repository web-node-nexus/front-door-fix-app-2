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
import AuthBackground from '../../components/auth/AuthBackground';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import AuthTitle from '../../components/auth/AuthTitle';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import { AUTH_LOGIN_IMAGE, LOGO } from '../../constants/assets';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function ProLoginScreen() {
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
      await login(email.trim(), password, { expectProfessional: true });
    } catch (e) {
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Please try again');
    }
  }

  return (
    <View style={styles.root}>
      <AuthBackground accent="#1A1A2E" />

      <KeyboardAwareScroll
        containerStyle={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
        ]}
        extraScrollOffset={120}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={BRAND.ink} />
            <Text style={styles.backText}>Customer login</Text>
          </Pressable>

          <View style={styles.logoRow}>
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
            <View style={styles.proBadge}>
              <Ionicons name="briefcase" size={12} color="#fff" />
              <Text style={styles.proBadgeText}>Professional Portal</Text>
            </View>
          </View>

          <AuthCard heroImage={AUTH_LOGIN_IMAGE} heroBadge="💼 Pro dashboard">
            <AuthTitle
              title="Professional Login"
              subtitle="Sign in to accept jobs, track earnings, and manage your service profile."
            />

            <AuthInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="pro@email.com"
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

            <AuthButton label="Login as Professional" onPress={handleLogin} loading={submitting} />

            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>New to FrontDoor?</Text>
              <Pressable onPress={() => navigation.navigate('ProRegister' as never)}>
                <Text style={styles.registerLink}>Join as Professional</Text>
              </Pressable>
            </View>
          </AuthCard>

          <View style={styles.demoBox}>
            <View style={styles.demoIcon}>
              <Ionicons name="construct" size={16} color="#fff" />
            </View>
            <View style={styles.demoTextWrap}>
              <Text style={styles.demoTitle}>Demo pro account</Text>
              <Text style={styles.demoText}>yashipro@frontdoor.in · Yashi@123</Text>
            </View>
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
  logoRow: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  logo: { width: 160, height: 64, marginBottom: 10 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proBadgeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
    paddingTop: 4,
  },
  registerHint: { fontSize: 14, color: BRAND.muted, fontWeight: '500' },
  registerLink: { fontSize: 14, color: '#1A1A2E', fontWeight: '800' },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#EEF0FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,26,46,0.12)',
  },
  demoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTextWrap: { flex: 1 },
  demoTitle: { fontSize: 12, fontWeight: '800', color: BRAND.ink },
  demoText: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
});
