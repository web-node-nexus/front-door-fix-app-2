import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProRequest } from '../../api/client';
import { proApi } from '../../api/pro';
import { BRAND } from '../../config';

function Countdown({ expiresAt }: { expiresAt?: number }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setLeft(Math.max(0, expiresAt - Math.floor(Date.now() / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (!expiresAt || left <= 0) return null;
  const m = Math.floor(left / 60);
  const s = left % 60;
  return <Text style={styles.timer}>Expires in {m}:{s.toString().padStart(2, '0')}</Text>;
}

type Props = {
  request: ProRequest;
  onAccepted?: () => void;
  onRejected?: () => void;
};

export default function ProRequestCard({ request, onAccepted, onRejected }: Props) {
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);

  async function accept() {
    setBusy('accept');
    try {
      const res = await proApi.accept(request.id);
      Alert.alert('Accepted', res.message);
      onAccepted?.();
    } catch (e) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Could not accept');
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    Alert.alert('Decline request', 'Are you sure you want to decline this job?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          setBusy('reject');
          try {
            const res = await proApi.reject(request.id);
            Alert.alert('Declined', res.message);
            onRejected?.();
          } catch (e) {
            Alert.alert('Failed', e instanceof Error ? e.message : 'Could not decline');
          } finally {
            setBusy(null);
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <Text style={styles.service}>{request.service}</Text>
        <Text style={styles.earnings}>₹{Number(request.earnings ?? 0).toFixed(0)}</Text>
      </View>
      <Text style={styles.meta}>
        {request.customer} · {request.date} · {request.time_slot}
      </Text>
      <Text style={styles.address} numberOfLines={2}>
        {request.address}
        {request.pincode ? ` · ${request.pincode}` : ''}
      </Text>
      {request.distance ? <Text style={styles.distance}>{request.distance} away</Text> : null}
      <Countdown expiresAt={request.expires_at} />
      <View style={styles.actions}>
        <Pressable style={[styles.rejectBtn, busy && styles.disabled]} onPress={reject} disabled={!!busy}>
          {busy === 'reject' ? <ActivityIndicator color={BRAND.muted} /> : <Text style={styles.rejectText}>Decline</Text>}
        </Pressable>
        <Pressable style={[styles.acceptBtn, busy && styles.disabled]} onPress={accept} disabled={!!busy}>
          {busy === 'accept' ? (
            <ActivityIndicator color="#1A1A2E" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#1A1A2E" />
              <Text style={styles.acceptText}>Accept</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  service: { flex: 1, fontSize: 16, fontWeight: '800', color: BRAND.ink },
  earnings: { fontSize: 16, fontWeight: '800', color: '#059669' },
  meta: { fontSize: 12, color: BRAND.muted, marginTop: 6, fontWeight: '600' },
  address: { fontSize: 13, color: BRAND.ink, marginTop: 6, lineHeight: 18 },
  distance: { fontSize: 12, color: BRAND.primary, marginTop: 6, fontWeight: '700' },
  timer: { fontSize: 11, color: '#B45309', marginTop: 8, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  rejectText: { fontWeight: '700', color: BRAND.muted },
  acceptBtn: {
    flex: 1.4,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFD600',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: { fontWeight: '800', color: '#1A1A2E' },
  disabled: { opacity: 0.6 },
});
