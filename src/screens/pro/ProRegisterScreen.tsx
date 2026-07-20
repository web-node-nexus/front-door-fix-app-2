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
import AuthBackground from '../../components/auth/AuthBackground';
import AuthButton from '../../components/auth/AuthButton';
import AuthCard from '../../components/auth/AuthCard';
import AuthInput from '../../components/auth/AuthInput';
import AuthTitle from '../../components/auth/AuthTitle';
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import { AUTH_REGISTER_IMAGE } from '../../constants/assets';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function ProRegisterScreen() {
  const navigation = useNavigation();
  const { registerProfessional, submitting } = useAuth();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleRegister() {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !address.trim() ||
      !pincode.trim() ||
      !experience.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert('Missing fields', 'Please fill all required fields');
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
    const years = parseInt(experience, 10);
    if (Number.isNaN(years) || years < 0 || years > 50) {
      Alert.alert('Invalid experience', 'Enter experience between 0 and 50 years');
      return;
    }
    try {
      const message = await registerProfessional({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        password_confirmation: confirmPassword,
        city: city.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        bio: bio.trim() || undefined,
        experience_years: years,
      });
      Alert.alert(
        'Application submitted',
        message || 'We will notify you when your profile is approved.',
      );
    } catch (e) {
      Alert.alert('Registration failed', e instanceof Error ? e.message : 'Please try again');
    }
  }

  return (
    <View style={styles.root}>
      <AuthBackground accent="#1A1A2E" />

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
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <AuthCard heroImage={AUTH_REGISTER_IMAGE} heroBadge="🚀 Grow with us">
            <AuthTitle
              title="Join as Professional"
              subtitle="Register to offer your services on FrontDoor. Our team will verify your profile."
            />

            <AuthInput label="Full name" icon="person-outline" value={name} onChangeText={setName} placeholder="Your name" />
            <AuthInput
              label="Phone"
              icon="call-outline"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="10-digit mobile"
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
            <AuthInput label="City" icon="location-outline" value={city} onChangeText={setCity} placeholder="Your city" />
            <AuthInput
              label="Service address"
              icon="home-outline"
              value={address}
              onChangeText={setAddress}
              placeholder="Area / locality"
            />
            <AuthInput
              label="Pincode"
              icon="navigate-outline"
              value={pincode}
              onChangeText={setPincode}
              keyboardType="number-pad"
              placeholder="6-digit pincode"
            />
            <AuthInput
              label="Experience (years)"
              icon="time-outline"
              value={experience}
              onChangeText={setExperience}
              keyboardType="number-pad"
              placeholder="e.g. 3"
            />
            <AuthInput
              label="Bio (optional)"
              icon="document-text-outline"
              value={bio}
              onChangeText={setBio}
              placeholder="Brief about your skills"
            />
            <AuthInput
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              secure={!showPass}
              showToggle
              onToggle={() => setShowPass((v) => !v)}
              placeholder="Min 6 characters"
            />
            <AuthInput
              label="Confirm password"
              icon="lock-closed-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secure={!showConfirm}
              showToggle
              onToggle={() => setShowConfirm((v) => !v)}
              placeholder="Re-enter password"
            />

            <AuthButton label="Submit Application" onPress={handleRegister} loading={submitting} />

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>Already registered?</Text>
              <Pressable onPress={() => navigation.navigate('ProLogin' as never)}>
                <Text style={styles.loginLink}>Pro Login</Text>
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
  scroll: { paddingHorizontal: 20 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  backText: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  loginHint: { fontSize: 14, color: BRAND.muted, fontWeight: '500' },
  loginLink: { fontSize: 14, color: '#1A1A2E', fontWeight: '800' },
});
