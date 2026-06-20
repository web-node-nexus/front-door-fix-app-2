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
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (t: string) => void;
  secure?: boolean;
  showToggle?: boolean;
  onToggle?: () => void;
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
          autoCapitalize="none"
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

export default function LoginScreen() {
  const navigation = useNavigation();
  const { login, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('customer@frontdoor.in');
  const [password, setPassword] = useState('password');
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Please try again';
      Alert.alert('Login failed', msg);
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

      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orb1]} />
      <View style={[styles.orb, styles.orb2]} />
      <View style={[styles.orb, styles.orb3]} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoCircle}
            >
              <Ionicons name="home" size={40} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={styles.title}>{BRAND.name}</Text>
          <Text style={styles.tagline}>Premium home services at your doorstep</Text>

          {/* Glass card */}
          <View style={styles.glassCard}>
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.welcomeSub}>Sign in to book & track services</Text>

            <GlassInput
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
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

            <Pressable
              style={({ pressed }) => [styles.loginBtn, pressed && { opacity: 0.92 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginText}>Login</Text>
                )}
              </LinearGradient>
            </Pressable>

            <View style={styles.registerRow}>
              <Text style={styles.registerHint}>Don't have an account?</Text>
              <Pressable onPress={() => navigation.navigate('Register' as never)}>
                <Text style={styles.registerLink}>Register Now</Text>
              </Pressable>
            </View>
          </View>

          {/* Demo chip */}
          <View style={styles.demoChip}>
            <Ionicons name="shield-checkmark-outline" size={16} color={BRAND.primary} />
            <Text style={styles.demoText}>Demo: customer@frontdoor.in · password</Text>
          </View>

          {/* Trust badges */}
          <View style={styles.trustRow}>
            {[
              { icon: 'shield-outline' as const, label: 'Secure' },
              { icon: 'flash-outline' as const, label: 'Fast booking' },
              { icon: 'star-outline' as const, label: '4.8★ rated' },
            ].map((t) => (
              <View key={t.label} style={styles.trustItem}>
                <Ionicons name={t.icon} size={13} color={BRAND.light} />
                <Text style={styles.trustLabel}>{t.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 24, alignItems: 'center' },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 200, height: 200, top: -60, right: -50, backgroundColor: 'rgba(255,45,122,0.14)' },
  orb2: { width: 160, height: 160, top: '18%', left: -70, backgroundColor: 'rgba(232,121,249,0.12)' },
  orb3: { width: 120, height: 120, bottom: 80, right: -30, backgroundColor: 'rgba(255,107,157,0.1)' },
  logoWrap: { marginBottom: 16 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: BRAND.ink,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    marginBottom: 32,
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
  welcome: { fontSize: 22, fontWeight: '800', color: BRAND.ink, marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: BRAND.muted, marginBottom: 22 },
  fieldWrap: { marginBottom: 16 },
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
  loginBtn: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
  },
  registerHint: { fontSize: 14, color: BRAND.muted, fontWeight: '600' },
  registerLink: { fontSize: 14, color: BRAND.primary, fontWeight: '800' },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(243,232,255,0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  demoText: { fontSize: 12, fontWeight: '600', color: BRAND.muted, flexShrink: 1 },
  trustRow: { flexDirection: 'row', marginTop: 20, gap: 16 },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trustLabel: { fontSize: 11, color: BRAND.light, fontWeight: '600' },
});
