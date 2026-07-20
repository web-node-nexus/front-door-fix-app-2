import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const PERKS = ['Exclusive Offers', 'Priority Support', 'Special Discounts', 'Free Cancellation', '2x Reward Points'];

export default function SubscriptionScreen() {
  const pad = useScreenPadding();
  const { isPremium, upgradePremium } = useProfile();
  const { showSuccess } = useFeedback();

  const upgrade = () => {
    upgradePremium();
    showSuccess('Premium Activated', 'Welcome to Front Door Premium. Enjoy exclusive benefits.');
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <LinearGradient colors={['#F3E8FF', '#FDF4FF']} style={styles.banner}>
        <Ionicons name="diamond" size={40} color={BRAND.purple} />
        <Text style={styles.title}>{isPremium ? 'Premium Member' : 'Become a Premium Member'}</Text>
        <Text style={styles.sub}>Unlock exclusive benefits and priority service</Text>
      </LinearGradient>

      {PERKS.map((p) => (
        <View key={p} style={styles.perk}>
          <Ionicons name="checkmark-circle" size={20} color={BRAND.success} />
          <Text style={styles.perkText}>{p}</Text>
        </View>
      ))}

      {!isPremium && (
        <Pressable onPress={upgrade}>
          <LinearGradient colors={[BRAND.purple, BRAND.primary]} style={styles.btn}>
            <Text style={styles.btnText}>Upgrade Now →</Text>
          </LinearGradient>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  banner: { borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#E9D5FF' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12, color: BRAND.ink },
  sub: { fontSize: 14, color: BRAND.muted, marginTop: 6, textAlign: 'center' },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  perkText: { fontSize: 15, fontWeight: '600' },
  btn: { marginTop: 24, borderRadius: 16, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
