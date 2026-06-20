import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Booking } from '../api/client';
import { BRAND } from '../config';
import { getPaymentDisplay } from '../utils/bookingPayment';

type Props = {
  visible: boolean;
  booking: Booking | null;
  onViewBooking: () => void;
  onViewAll: () => void;
  onClose: () => void;
  title?: string;
};

export default function BookingSuccessModal({
  visible,
  booking,
  onViewBooking,
  onViewAll,
  onClose,
  title,
}: Props) {
  if (!booking) return null;

  const payment = getPaymentDisplay(booking);
  const paymentStyles = {
    paid: { bg: '#ECFDF5', color: '#059669' },
    pending: { bg: '#FFFBEB', color: '#B45309' },
    cod: { bg: '#FFF7ED', color: '#C2410C' },
  }[payment.tone];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient colors={['#FFF5F9', '#FFFFFF']} style={styles.cardInner}>
            <View style={styles.iconWrap}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.iconCircle}>
                <Ionicons name="checkmark" size={42} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.badge}>BOOKING CONFIRMED</Text>
            <Text style={styles.title}>{title || "You're all set!"}</Text>
            <Text style={styles.sub}>
              Your service has been booked successfully. A professional will be assigned soon.
            </Text>

            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Ionicons name="construct-outline" size={18} color={BRAND.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Service</Text>
                  <Text style={styles.summaryValue}>{booking.service}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Ionicons name="calendar-outline" size={18} color={BRAND.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Date & Time</Text>
                  <Text style={styles.summaryValue}>{booking.date} · {booking.time_slot}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Ionicons name="receipt-outline" size={18} color={BRAND.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.summaryLabel}>Booking ID</Text>
                  <Text style={styles.summaryValue}>#{booking.booking_code}</Text>
                </View>
              </View>
              <View style={styles.amountPill}>
                <Text style={styles.amountLabel}>Total</Text>
                <Text style={styles.amountValue}>₹{Number(booking.amount).toLocaleString('en-IN')}</Text>
              </View>
              <View style={[styles.payPill, { backgroundColor: paymentStyles.bg }]}>
                <Ionicons name={payment.icon} size={16} color={paymentStyles.color} />
                <Text style={[styles.payPillText, { color: paymentStyles.color }]}>{payment.label}</Text>
              </View>
            </View>

            <Pressable style={styles.primaryBtnWrap} onPress={onViewBooking}>
              <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.primaryBtn}>
                <Ionicons name="eye-outline" size={18} color="#fff" />
                <Text style={styles.primaryText}>View Booking</Text>
              </LinearGradient>
            </Pressable>

            <Pressable style={styles.secondaryBtnWrap} onPress={onViewAll}>
              <Ionicons name="calendar-outline" size={18} color={BRAND.primary} />
              <Text style={styles.secondaryText}>Go to My Bookings</Text>
            </Pressable>

            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.closeText}>Book another service</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: BRAND.primary,
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  cardInner: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: { marginBottom: 16 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: { fontSize: 26, fontWeight: '800', color: BRAND.ink },
  sub: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  summaryLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '600' },
  summaryValue: { fontSize: 14, fontWeight: '700', color: BRAND.ink, marginTop: 2 },
  divider: { height: 1, backgroundColor: BRAND.border, marginVertical: 12 },
  amountPill: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: BRAND.lavender,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  amountLabel: { fontSize: 13, fontWeight: '700', color: BRAND.muted },
  amountValue: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  payPill: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  payPillText: { fontSize: 13, fontWeight: '800' },
  primaryBtnWrap: { alignSelf: 'stretch', width: '100%', marginBottom: 10 },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 15,
  },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  secondaryBtnWrap: {
    alignSelf: 'stretch',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  secondaryText: { color: BRAND.primary, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  closeText: { fontSize: 13, fontWeight: '600', color: BRAND.muted },
});
