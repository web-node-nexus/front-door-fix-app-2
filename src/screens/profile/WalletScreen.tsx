import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const TXNS = [
  { id: '1', title: 'AC Service Booking', amount: -1299, date: '12 Jun 2026' },
  { id: '2', title: 'Cashback Credited', amount: 200, date: '10 Jun 2026' },
  { id: '3', title: 'Wallet Top-up', amount: 500, date: '5 Jun 2026' },
];

export default function WalletScreen() {
  const pad = useScreenPadding();
  const { walletBalance, cashbackEarned, rewardPoints } = useProfile();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.hero}>
        <Text style={styles.heroLabel}>Wallet Balance</Text>
        <Text style={styles.heroAmount}>₹{walletBalance.toLocaleString('en-IN')}</Text>
        <View style={styles.heroRow}>
          <View><Text style={styles.subLabel}>Cashback Earned</Text><Text style={styles.subVal}>₹{cashbackEarned}</Text></View>
          <View><Text style={styles.subLabel}>Reward Points</Text><Text style={styles.subVal}>{rewardPoints}</Text></View>
        </View>
      </LinearGradient>

      <Text style={styles.section}>Recent Transactions</Text>
      {TXNS.map((t) => (
        <View key={t.id} style={styles.txn}>
          <View style={styles.txnIcon}>
            <Ionicons name={t.amount > 0 ? 'arrow-down' : 'arrow-up'} size={18} color={t.amount > 0 ? BRAND.success : BRAND.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.txnTitle}>{t.title}</Text>
            <Text style={styles.txnDate}>{t.date}</Text>
          </View>
          <Text style={[styles.txnAmt, { color: t.amount > 0 ? BRAND.success : BRAND.ink }]}>
            {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  hero: { borderRadius: 24, padding: 24, marginBottom: 24 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  heroRow: { flexDirection: 'row', gap: 32, marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.25)' },
  subLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  subVal: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 2 },
  section: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  txn: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BRAND.canvas, padding: 14, borderRadius: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  txnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontWeight: '700', fontSize: 14 },
  txnDate: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  txnAmt: { fontWeight: '800', fontSize: 15 },
});
