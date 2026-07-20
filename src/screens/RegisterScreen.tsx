import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
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
import { AUTH_REGISTER_IMAGE } from '../constants/assets';
import { BRAND } from '../config';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, submitting } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Password and confirm password must match');
      return;
    }
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
      });
    } catch (e) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Please try again');
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
      >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="arrow-back" size={20} color={BRAND.ink} />
            <Text style={styles.backText}>Back to login</Text>
          </Pressable>

          <AuthCard heroImage={AUTH_REGISTER_IMAGE} heroBadge="🛡️ Safe & secure">
            <AuthTitle
              title="Create account"
              subtitle="Join Front Door to book trusted home services near you."
            />

            <AuthInput
              label="Full name"
              icon="person-outline"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              placeholder="Your full name"
            />
            <AuthInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoComplete="email"
              placeholder="you@email.com"
            />
            <AuthInput
              label="Phone"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              placeholder="10-digit mobile"
            />
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secure={!showPass}
              showToggle
              onToggle={() => setShowPass((v) => !v)}
              autoComplete="password-new"
              placeholder="Min. 6 characters"
            />
            <AuthInput
              label="Confirm password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure={!showConfirm}
              showToggle
              onToggle={() => setShowConfirm((v) => !v)}
              autoComplete="password-new"
              placeholder="Re-enter password"
              style={styles.lastField}
            />

            <Text style={styles.terms}>
              By creating an account you agree to our Terms of Service and Privacy Policy.
            </Text>

            <AuthButton label="Create account" onPress={handleRegister} loading={submitting} />

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>Already have an account?</Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Login</Text>
              </Pressable>
            </View>
          </AuthCard>
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
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingRight: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.ink,
  },
  lastField: { marginBottom: 12 },
  terms: {
    fontSize: 12,
    lineHeight: 18,
    color: BRAND.muted,
    marginBottom: 18,
    paddingHorizontal: 2,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  loginHint: { fontSize: 14, color: BRAND.muted, fontWeight: '500' },
  loginLink: { fontSize: 14, color: BRAND.primary, fontWeight: '800' },
});
