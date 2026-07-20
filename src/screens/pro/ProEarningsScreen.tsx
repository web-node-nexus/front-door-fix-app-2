import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { proApi } from '../../api/pro';
import ProHeader from '../../components/pro/ProHeader';
import { BRAND } from '../../config';

export default function ProEarningsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Awaited<ReturnType<typeof proApi.earnings>> | null>(null);
  const [amount, setAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await proApi.earnings());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function withdraw() {
    const val = parseFloat(amount);
    if (Number.isNaN(val) || val < 100) {
      Alert.alert('Invalid amount', 'Minimum withdrawal is ₹100');
      return;
    }
    setWithdrawing(true);
    try {
      const res = await proApi.withdraw(val);
      Alert.alert('Success', res.message);
      setAmount('');
      load();
    } catch (e) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  }

  const stats = data?.stats;
  const maxChart = Math.max(...(data?.chart.map((c) => c.amount) ?? [1]), 1);

  return (
    <View style={styles.root}>
      <ProHeader title="Earnings" />
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={styles.walletCard}>
          <Text style={styles.walletLabel}>Wallet balance</Text>
          <Text style={styles.walletValue}>₹{(stats?.wallet_balance ?? 0).toFixed(0)}</Text>
          <View style={styles.row}>
            <View style={styles.mini}>
              <Text style={styles.miniLabel}>Today</Text>
              <Text style={styles.miniVal}>₹{(stats?.today_earnings ?? 0).toFixed(0)}</Text>
            </View>
            <View style={styles.mini}>
              <Text style={styles.miniLabel}>This month</Text>
              <Text style={styles.miniVal}>₹{(stats?.monthly_earnings ?? 0).toFixed(0)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.section}>7-day earnings</Text>
        <View style={styles.chart}>
          {data?.chart.map((d) => (
            <View key={d.label} style={styles.barWrap}>
              <View style={[styles.bar, { height: Math.max(8, (d.amount / maxChart) * 80) }]} />
              <Text style={styles.barLabel}>{d.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.section}>Withdraw</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="Amount (min ₹100)"
          placeholderTextColor={BRAND.light}
        />
        <Pressable style={styles.withdrawBtn} onPress={withdraw} disabled={withdrawing}>
          <Text style={styles.withdrawText}>{withdrawing ? 'Processing...' : 'Request withdrawal'}</Text>
        </Pressable>

        <Text style={styles.section}>Recent payouts</Text>
        {data?.recent.map((r) => (
          <View key={r.id} style={styles.recentRow}>
            <View>
              <Text style={styles.recentService}>{r.service}</Text>
              <Text style={styles.recentMeta}>{r.customer} · {r.date}</Text>
            </View>
            <Text style={styles.recentAmt}>+₹{r.amount.toFixed(0)}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  scroll: { paddingHorizontal: 20 },
  walletCard: { backgroundColor: '#1A1A2E', borderRadius: 20, padding: 20, marginBottom: 20 },
  walletLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  walletValue: { color: '#FFD600', fontSize: 36, fontWeight: '800', marginTop: 4 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  mini: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 12 },
  miniLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11 },
  miniVal: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  section: { fontSize: 16, fontWeight: '800', color: BRAND.ink, marginBottom: 12, marginTop: 8 },
  chart: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100, marginBottom: 20, paddingHorizontal: 4 },
  barWrap: { alignItems: 'center', flex: 1 },
  bar: { width: 20, backgroundColor: '#7C3AED', borderRadius: 6 },
  barLabel: { fontSize: 10, color: BRAND.muted, marginTop: 6, fontWeight: '600' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  withdrawBtn: { backgroundColor: '#FFD600', borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 20 },
  withdrawText: { fontWeight: '800', color: '#1A1A2E' },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recentService: { fontWeight: '800', color: BRAND.ink },
  recentMeta: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  recentAmt: { fontWeight: '800', color: '#059669' },
});
