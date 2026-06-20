import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import { useAuth } from '../context/AuthContext';

function GlassInput({
  label,
  icon,
  value,
  onChangeText,
  secure,
  showToggle,
  onToggle,
  keyboardType,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.glassInput}>
        <Ionicons name={icon} size={20} color={BRAND.primary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize={keyboardType === 'email-address' ? 'none' : 'words'}
          keyboardType={keyboardType}
          placeholderTextColor={BRAND.light}
          placeholder={label}
        />
        {showToggle && (
          <Pressable onPress={onToggle} hitSlop={12}>
            <Ionicons name={secure ? 'eye-off-outline' : 'eye-outline'} size={20} color={BRAND.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { register, loading } = useAuth();
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
      const msg = e instanceof Error ? e.message : 'Please try again';
      Alert.alert('Registration failed', msg);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFF5F9', '#FDF4FF', '#F8F9FC', '#FFF0F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
          </Pressable>

          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="person-add-outline" size={36} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>Create account</Text>
          <Text style={styles.tagline}>Join {BRAND.name} and book trusted home services</Text>

          <View style={styles.glassCard}>
            <GlassInput label="Full name" icon="person-outline" value={name} onChangeText={setName} />
            <GlassInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <GlassInput
              label="Phone"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <GlassInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secure={!showPass}
              showToggle
              onToggle={() => setShowPass((v) => !v)}
            />
            <GlassInput
              label="Confirm password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure={!showConfirm}
              showToggle
              onToggle={() => setShowConfirm((v) => !v)}
            />

            <Pressable
              style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.92 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <LinearGradient
                colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.registerGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerText}>Register</Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginHint}>Already have an account?</Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24, alignItems: 'center' },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 200, height: 200, top: -60, right: -50, backgroundColor: 'rgba(255,45,122,0.14)' },
  orb2: { width: 160, height: 160, top: '18%', left: -70, backgroundColor: 'rgba(232,121,249,0.12)' },
  orb3: { width: 120, height: 120, bottom: 80, right: -30, backgroundColor: 'rgba(255,107,157,0.1)' },
  logoWrap: { marginBottom: 12 },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BRAND.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  glassCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  fieldWrap: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: BRAND.ink, marginBottom: 8 },
  glassInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontWeight: '600', color: BRAND.ink },
  registerBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  registerGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  loginHint: { fontSize: 14, color: BRAND.muted, fontWeight: '600' },
  loginLink: { fontSize: 14, color: BRAND.primary, fontWeight: '800' },
});
