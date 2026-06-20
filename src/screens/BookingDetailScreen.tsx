import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Booking } from '../api/client';
import { ASSET_BASE_URL, BRAND } from '../config';
import { useScreenPadding } from '../hooks/useScreenPadding';
import { getPaymentDisplay } from '../utils/bookingPayment';
import { downloadBookingInvoice } from '../utils/invoiceDownload';
import { serviceImageUrl } from '../utils/serviceImagery';

export default function BookingDetailScreen() {
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const booking: Booking = route.params?.booking;
  const [downloading, setDownloading] = useState(false);
  const payment = getPaymentDisplay(booking);
  const paymentStyles = {
    paid: { bg: '#ECFDF5', color: '#059669' },
    pending: { bg: '#FFFBEB', color: '#B45309' },
    cod: { bg: '#FFF7ED', color: '#C2410C' },
  }[payment.tone];

  const canDownloadInvoice = booking?.invoice_available
    || booking?.tab === 'Completed'
    || booking?.status === 'completed'
    || booking?.is_paid;

  const imageUri = booking?.service_image
    ? (booking.service_image.startsWith('http') ? booking.service_image : `${ASSET_BASE_URL}/storage/${booking.service_image}`)
    : serviceImageUrl({ id: booking?.id, name: booking?.service || '', slug: booking?.service_slug || '', price: booking?.amount } as any);

  const rows = [
    { icon: 'calendar-outline', label: 'Date & Time', value: `${booking?.date} · ${booking?.time_slot}` },
    { icon: 'location-outline', label: 'Address', value: booking?.address },
    { icon: 'person-outline', label: 'Professional', value: booking?.professional || 'Assigning soon...' },
    { icon: 'receipt-outline', label: 'Booking ID', value: `#${booking?.booking_code}` },
  ];

  const handleDownload = async () => {
    if (!booking?.id || downloading) return;
    setDownloading(true);
    try {
      await downloadBookingInvoice(booking.id);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <Image source={{ uri: imageUri }} style={styles.hero} resizeMode="cover" />
      <Text style={styles.service}>{booking?.service}</Text>
      <Text style={styles.amount}>₹{Number(booking?.amount).toLocaleString('en-IN')}</Text>

      {rows.map((r) => (
        <View key={r.label} style={styles.row}>
          <View style={styles.rowIcon}><Ionicons name={r.icon as any} size={18} color={BRAND.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>{r.label}</Text>
            <Text style={styles.rowValue}>{r.value}</Text>
          </View>
        </View>
      ))}

      <View style={[styles.paymentCard, { backgroundColor: paymentStyles.bg }]}>
        <View style={styles.paymentIconWrap}>
          <Ionicons name={payment.icon} size={22} color={paymentStyles.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.paymentCardLabel}>Payment</Text>
          <Text style={[styles.paymentCardValue, { color: paymentStyles.color }]}>{payment.label}</Text>
          <Text style={styles.paymentCardSub}>{payment.sublabel}</Text>
        </View>
        {booking?.is_paid ? (
          <Ionicons name="checkmark-circle" size={24} color={paymentStyles.color} />
        ) : null}
      </View>

      {canDownloadInvoice ? (
        <Pressable onPress={handleDownload} disabled={downloading}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.invoice}>
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="download-outline" size={24} color="#fff" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.invoiceText}>Download Invoice</Text>
              <Text style={styles.invoiceSub}>#{booking?.booking_code}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      ) : (
        <Pressable onPress={() => Alert.alert('Invoice pending', 'Invoice will be available after your service is completed and payment is received.')}>
          <View style={[styles.invoice, styles.invoiceDisabled]}>
            <Ionicons name="document-text-outline" size={24} color={BRAND.muted} />
            <Text style={styles.invoiceDisabledText}>Invoice available after payment</Text>
          </View>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  hero: { width: '100%', height: 180, borderRadius: 20, marginBottom: 16 },
  service: { fontSize: 24, fontWeight: '800' },
  amount: { fontSize: 28, fontWeight: '800', color: BRAND.primary, marginTop: 4, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  rowIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '600' },
  rowValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  paymentIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentCardLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '600' },
  paymentCardValue: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  paymentCardSub: { fontSize: 12, color: BRAND.muted, marginTop: 2, fontWeight: '600' },
  invoice: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 16, padding: 16, marginTop: 12 },
  invoiceText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  invoiceSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  invoiceDisabled: { backgroundColor: BRAND.canvas, borderWidth: 1, borderColor: BRAND.border },
  invoiceDisabledText: { color: BRAND.muted, fontWeight: '700', fontSize: 14 },
});
