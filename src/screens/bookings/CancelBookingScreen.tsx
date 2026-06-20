import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, Booking } from '../../api/client';
import { BRAND } from '../../config';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const REASONS = [
  'Change of plans',
  'Booked wrong service',
  'Found better price elsewhere',
  'Professional not available',
  'Other',
];

export default function CancelBookingScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const booking: Booking = route.params?.booking;
  const [reason, setReason] = useState(REASONS[0]);
  const [cancelling, setCancelling] = useState(false);

  const confirm = () => {
    Alert.alert(
      'Confirm Cancellation',
      `Cancel ${booking?.service} on ${booking?.date}?\n\nFree cancellation up to 4 hours before scheduled time.`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await api.cancelBooking(booking.id);
              Alert.alert('Cancelled', 'Your booking has been cancelled.', [
                { text: 'OK', onPress: () => nav.navigate('Bookings' as never) },
              ]);
            } catch (e) {
              Alert.alert('Error', e instanceof Error ? e.message : 'Could not cancel booking');
            } finally {
              setCancelling(false);
            }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <View style={styles.warn}>
        <Ionicons name="warning-outline" size={28} color="#EA580C" />
        <Text style={styles.warnTitle}>Cancel this booking?</Text>
        <Text style={styles.warnSub}>This action cannot be undone. Refund will be processed in 5-7 days if applicable.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.service}>{booking?.service}</Text>
        <Text style={styles.meta}>#{booking?.booking_code} · {booking?.date} · {booking?.time_slot}</Text>
        <Text style={styles.amount}>₹{Number(booking?.amount).toLocaleString('en-IN')}</Text>
      </View>

      <Text style={styles.label}>Reason for cancellation</Text>
      {REASONS.map((r) => (
        <Pressable key={r} style={[styles.reason, reason === r && styles.reasonActive]} onPress={() => setReason(r)}>
          <Ionicons name={reason === r ? 'radio-button-on' : 'radio-button-off'} size={20} color={BRAND.primary} />
          <Text style={styles.reasonText}>{r}</Text>
        </Pressable>
      ))}

      <Pressable onPress={confirm} disabled={cancelling}>
        <View style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</Text>
        </View>
      </Pressable>

      <Pressable style={styles.keepBtn} onPress={() => nav.goBack()}>
        <Text style={styles.keepText}>Keep My Booking</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  warn: { backgroundColor: '#FFF7ED', borderRadius: 18, padding: 20, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#FED7AA' },
  warnTitle: { fontSize: 18, fontWeight: '800', marginTop: 10 },
  warnSub: { fontSize: 13, color: BRAND.muted, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  card: { backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: BRAND.border },
  service: { fontSize: 17, fontWeight: '800' },
  meta: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  amount: { fontSize: 20, fontWeight: '800', color: BRAND.primary, marginTop: 8 },
  label: { fontSize: 15, fontWeight: '800', marginBottom: 10 },
  reason: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: BRAND.canvas, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: BRAND.border },
  reasonActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  reasonText: { fontSize: 14, fontWeight: '600' },
  cancelBtn: { backgroundColor: '#EF4444', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 16 },
  cancelText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  keepBtn: { alignItems: 'center', padding: 16, marginTop: 8 },
  keepText: { color: BRAND.primary, fontWeight: '800', fontSize: 15 },
});
