import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const CODE = 'YASHI500';

export default function ReferEarnScreen() {
  const pad = useScreenPadding();

  const invite = async () => {
    try {
      await Share.share({
        message: `Join Front Door home services! Use my code ${CODE} and get ₹500 cashback. Download: https://frontdoor.in`,
      });
    } catch {
      Alert.alert('Invite', `Share code: ${CODE}`);
    }
  };

  return (
    <View style={[styles.root, { paddingBottom: pad.paddingBottom }]}>
      <LinearGradient colors={['#FDF4FF', '#FCE7F3']} style={styles.banner}>
        <Text style={styles.emoji}>🎁</Text>
        <Text style={styles.title}>Refer a Friend & Earn ₹500</Text>
        <Text style={styles.sub}>Your friend gets ₹200 off. You earn ₹500 cashback!</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <Text style={styles.code}>{CODE}</Text>
        </View>
        <Pressable onPress={invite}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
            <Ionicons name="share-social-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Invite Now</Text>
          </LinearGradient>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface, padding: 20 },
  banner: { borderRadius: 24, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: '#F9A8D4' },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: BRAND.ink, textAlign: 'center' },
  sub: { fontSize: 14, color: BRAND.muted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  codeBox: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 24, alignItems: 'center', width: '100%' },
  codeLabel: { fontSize: 12, color: BRAND.muted },
  code: { fontSize: 28, fontWeight: '800', color: BRAND.primary, marginTop: 4, letterSpacing: 4 },
  btn: { flexDirection: 'row', gap: 8, marginTop: 24, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
