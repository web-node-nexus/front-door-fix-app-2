import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ProCompletionPayload, proApi } from '../../api/pro';
import { BRAND } from '../../config';

export default function ProCompletionDetailScreen() {
  const route = useRoute<any>();
  const bookingId: number = route.params?.bookingId;
  const [data, setData] = useState<ProCompletionPayload | null>(null);
  const [method, setMethod] = useState<'cod' | 'online' | null>(null);
  const [cashAmount, setCashAmount] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const payload = await proApi.completionShow(bookingId);
    setData(payload);
    if (payload.collection_method === 'cod' || payload.collection_method === 'online') {
      setMethod(payload.collection_method);
    }
  }, [bookingId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  async function selectMethod(m: 'cod' | 'online') {
    setBusy(true);
    try {
      const res = await proApi.completionMethod(bookingId, m);
      setData(res.data);
      setMethod(m);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  async function confirmPayment() {
    setBusy(true);
    try {
      const cash = method === 'cod' ? parseFloat(cashAmount) || data?.amount : undefined;
      const res = await proApi.completionConfirm(bookingId, cash);
      Alert.alert('Done', res.message);
      setData(res.data);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }

  async function finalize() {
    setBusy(true);
    try {
      const res = await proApi.completionFinalize(bookingId);
      Alert.alert('Completed', res.message);
      load();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <View style={styles.center}><Text>Loading...</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.card}>
        <Text style={styles.code}>{data.booking_code}</Text>
        <Text style={styles.service}>{data.service}</Text>
        <Text style={styles.meta}>{data.customer} · {data.date} · {data.time}</Text>
        <Text style={styles.address}>{data.address}</Text>
        <Text style={styles.amount}>₹{data.amount}</Text>
        <Text style={styles.earn}>Your earnings: ₹{data.earnings ?? 0}</Text>
      </View>

      {data.is_completed ? (
        <View style={styles.doneBox}>
          <Text style={styles.doneText}>Job completed ✓</Text>
          {data.review ? <Text style={styles.review}>Customer rated {data.review.rating}★</Text> : null}
        </View>
      ) : (
        <>
          <Text style={styles.section}>Payment method</Text>
          <View style={styles.methodRow}>
            <Pressable style={[styles.methodBtn, method === 'cod' && styles.methodOn]} onPress={() => selectMethod('cod')} disabled={busy}>
              <Text style={[styles.methodText, method === 'cod' && styles.methodTextOn]}>Cash (COD)</Text>
            </Pressable>
            <Pressable style={[styles.methodBtn, method === 'online' && styles.methodOn]} onPress={() => selectMethod('online')} disabled={busy}>
              <Text style={[styles.methodText, method === 'online' && styles.methodTextOn]}>Online / UPI</Text>
            </Pressable>
          </View>

          {method === 'online' && data.qr_image_url ? (
            <View style={styles.qrWrap}>
              <Text style={styles.section}>Scan to pay</Text>
              <Image source={{ uri: data.qr_image_url }} style={styles.qr} resizeMode="contain" />
              <Text style={styles.upi}>UPI: {data.upi_id}</Text>
            </View>
          ) : null}

          {method === 'cod' ? (
            <TextInput
              style={styles.input}
              value={cashAmount}
              onChangeText={setCashAmount}
              keyboardType="numeric"
              placeholder={`Cash collected (₹${data.amount})`}
              placeholderTextColor={BRAND.light}
            />
          ) : null}

          {data.needs_collection && method ? (
            <Pressable style={styles.primaryBtn} onPress={confirmPayment} disabled={busy}>
              <Text style={styles.primaryText}>Confirm payment received</Text>
            </Pressable>
          ) : null}

          {!data.needs_collection && !data.is_completed ? (
            <Pressable style={styles.primaryBtn} onPress={finalize} disabled={busy}>
              <Text style={styles.primaryText}>Finalize & complete job</Text>
            </Pressable>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, backgroundColor: '#F5F5F7' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  code: { fontSize: 12, fontWeight: '700', color: BRAND.muted },
  service: { fontSize: 20, fontWeight: '800', color: BRAND.ink, marginTop: 4 },
  meta: { fontSize: 13, color: BRAND.muted, marginTop: 6 },
  address: { fontSize: 13, color: BRAND.ink, marginTop: 8, lineHeight: 18 },
  amount: { fontSize: 28, fontWeight: '800', color: '#059669', marginTop: 12 },
  earn: { fontSize: 13, color: BRAND.muted, marginTop: 4 },
  section: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 10 },
  methodRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  methodBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  methodOn: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  methodText: { fontWeight: '700', color: BRAND.muted },
  methodTextOn: { color: '#FFD600' },
  qrWrap: { alignItems: 'center', marginBottom: 16 },
  qr: { width: 220, height: 220, backgroundColor: '#fff', borderRadius: 12 },
  upi: { marginTop: 8, fontSize: 12, color: BRAND.muted },
  input: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, marginBottom: 12 },
  primaryBtn: { backgroundColor: '#FFD600', borderRadius: 14, padding: 16, alignItems: 'center' },
  primaryText: { fontWeight: '800', color: '#1A1A2E' },
  doneBox: { backgroundColor: '#ECFDF5', padding: 16, borderRadius: 14, alignItems: 'center' },
  doneText: { fontWeight: '800', color: '#059669', fontSize: 16 },
  review: { marginTop: 8, color: BRAND.muted },
});
