import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const SAFETY_POINTS = [
  { icon: 'shield-checkmark', title: 'Verified Professionals', desc: 'All service providers undergo background verification and skill checks.' },
  { icon: 'location', title: 'Live Tracking', desc: 'Track your professional in real-time from arrival to completion.' },
  { icon: 'call', title: 'Emergency Support', desc: '24/7 emergency helpline for urgent safety concerns during service.' },
  { icon: 'document-text', title: 'Insurance Coverage', desc: 'All services are covered under Front Door safety insurance policy.' },
  { icon: 'people', title: 'OTP Verification', desc: 'OTP required before service starts — ensures only verified pros enter your home.' },
];

export default function SafetyScreen() {
  const pad = useScreenPadding();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <View style={styles.hero}>
        <Ionicons name="shield-checkmark" size={40} color={BRAND.primary} />
        <Text style={styles.heroTitle}>Your Safety First</Text>
        <Text style={styles.heroSub}>Front Door is committed to keeping you and your family safe during every service.</Text>
      </View>
      {SAFETY_POINTS.map((p) => (
        <View key={p.title} style={styles.card}>
          <View style={styles.icon}><Ionicons name={p.icon as any} size={22} color={BRAND.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.desc}>{p.desc}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  hero: { backgroundColor: BRAND.lavender, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 20 },
  heroTitle: { fontSize: 22, fontWeight: '800', marginTop: 12 },
  heroSub: { fontSize: 14, color: BRAND.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  card: { flexDirection: 'row', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15 },
  desc: { fontSize: 13, color: BRAND.muted, marginTop: 4, lineHeight: 20 },
});
