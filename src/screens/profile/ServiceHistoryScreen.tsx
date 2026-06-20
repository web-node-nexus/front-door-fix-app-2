import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { api, Booking } from '../../api/client';
import { BRAND } from '../../config';
import { useScreenPadding } from '../../hooks/useScreenPadding';
import { downloadBookingInvoice } from '../../utils/invoiceDownload';

export default function ServiceHistoryScreen() {
  const pad = useScreenPadding();
  const nav = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useFocusEffect(useCallback(() => {
    setLoading(true);
    api.bookings().then(setBookings).catch(() => setBookings([])).finally(() => setLoading(false));
  }, []));

  const completed = bookings.filter((b) => b.tab === 'Completed' || b.status === 'completed' || b.invoice_available);

  const handleDownload = async (booking: Booking) => {
    setDownloadingId(booking.id);
    try {
      await downloadBookingInvoice(booking.id);
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={BRAND.primary} /></View>;

  return (
    <FlatList
      data={completed}
      keyExtractor={(b) => String(b.id)}
      contentContainerStyle={[styles.list, { paddingBottom: pad.paddingBottom }]}
      ListEmptyComponent={<Text style={styles.empty}>No completed services yet</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Pressable onPress={() => nav.navigate('BookingDetail', { booking: item })}>
            <Text style={styles.service}>{item.service}</Text>
            <Text style={styles.meta}>{item.date} · {item.time_slot}</Text>
            <View style={styles.row}>
              <Text style={styles.amount}>₹{Number(item.amount).toLocaleString('en-IN')}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>Completed</Text></View>
            </View>
          </Pressable>
          <Pressable style={styles.invoiceBtn} onPress={() => handleDownload(item)} disabled={downloadingId === item.id}>
            {downloadingId === item.id ? (
              <ActivityIndicator color={BRAND.primary} size="small" />
            ) : (
              <Ionicons name="download-outline" size={16} color={BRAND.primary} />
            )}
            <Text style={styles.invoiceBtnText}>Download Invoice</Text>
          </Pressable>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  service: { fontSize: 16, fontWeight: '800' },
  meta: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  amount: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  badge: { backgroundColor: BRAND.lavender, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700', color: BRAND.primary, textTransform: 'capitalize' },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: BRAND.lavender,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  invoiceBtnText: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 40 },
});
