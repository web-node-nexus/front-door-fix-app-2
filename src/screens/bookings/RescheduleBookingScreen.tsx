import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { api, Booking } from '../../api/client';
import { BRAND } from '../../config';
import { nextDates, TIME_SLOTS } from '../../data/bookingSlots';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function RescheduleBookingScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const booking: Booking = route.params?.booking;
  const dates = nextDates();

  const [date, setDate] = useState(dates[1]?.value || dates[0].value);
  const [slot, setSlot] = useState(booking?.time_slot || TIME_SLOTS[1]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await api.rescheduleBooking(booking.id, date, slot);
      Alert.alert('Rescheduled', 'Your booking has been rescheduled successfully.', [
        { text: 'OK', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not reschedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <View style={styles.card}>
        <Text style={styles.service}>{booking?.service}</Text>
        <Text style={styles.code}>#{booking?.booking_code}</Text>
        <Text style={styles.current}>Current: {booking?.date} · {booking?.time_slot}</Text>
      </View>

      <Text style={styles.label}>Select New Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dates.map((d) => (
          <Pressable key={d.value} onPress={() => setDate(d.value)}>
            {date === d.value ? (
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.dateActive}>
                <Text style={styles.dateTextActive}>{d.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.dateChip}><Text style={styles.dateText}>{d.label}</Text></View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.label}>Select Time Slot</Text>
      {TIME_SLOTS.map((s) => (
        <Pressable key={s} style={[styles.slot, slot === s && styles.slotActive]} onPress={() => setSlot(s)}>
          <Ionicons name="time-outline" size={18} color={slot === s ? BRAND.primary : BRAND.muted} />
          <Text style={[styles.slotText, slot === s && styles.slotTextActive]}>{s}</Text>
          {slot === s && <Ionicons name="checkmark-circle" size={20} color={BRAND.primary} />}
        </Pressable>
      ))}

      <Pressable onPress={save} disabled={saving}>
        <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Confirm Reschedule'}</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: BRAND.border },
  service: { fontSize: 18, fontWeight: '800' },
  code: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  current: { fontSize: 13, color: BRAND.primary, marginTop: 8, fontWeight: '600' },
  label: { fontSize: 15, fontWeight: '800', marginBottom: 12, marginTop: 8 },
  dateRow: { gap: 8, marginBottom: 20 },
  dateChip: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: BRAND.canvas, borderWidth: 1, borderColor: BRAND.border, marginRight: 8 },
  dateActive: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginRight: 8 },
  dateText: { fontWeight: '600', color: BRAND.muted },
  dateTextActive: { fontWeight: '800', color: '#fff' },
  slot: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: BRAND.canvas, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: BRAND.border },
  slotActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  slotText: { flex: 1, fontWeight: '600', fontSize: 15 },
  slotTextActive: { color: BRAND.primary, fontWeight: '800' },
  btn: { marginTop: 24, borderRadius: 16, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
