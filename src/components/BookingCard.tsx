import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Booking } from '../api/client';
import { ASSET_BASE_URL, BRAND } from '../config';
import { navigateToRateReview } from '../navigation/navigationRef';
import { getPaymentDisplay } from '../utils/bookingPayment';
import { serviceImageUrl } from '../utils/serviceImagery';

type TabKey = 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string; priceBg: string }> = {
  Upcoming: { label: 'Upcoming', color: '#EA580C', bg: '#FFF7ED', priceBg: '#FCE7F3' },
  Active: { label: 'In Progress', color: '#2563EB', bg: '#DBEAFE', priceBg: '#EDE9FE' },
  Completed: { label: 'Completed', color: '#059669', bg: '#D1FAE5', priceBg: '#D1FAE5' },
  Cancelled: { label: 'Cancelled', color: '#DC2626', bg: '#FEE2E2', priceBg: '#FCE7F3' },
};

const STEPS = ['Reached', 'Cleaning', 'Checking', 'Completed'];

function getTab(b: Booking): TabKey {
  if (b.tab) return b.tab;
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'completed') return 'Completed';
  if (b.status === 'in_progress') return 'Active';
  return 'Upcoming';
}

function stepIndex(stage?: string): number {
  const map: Record<string, number> = {
    received: 0,
    accepted: 0,
    on_the_way: 0,
    arrived: 1,
    otp_verified: 1,
    work_started: 1,
    awaiting_payment: 2,
    completed: 3,
  };
  return map[stage || 'received'] ?? 0;
}

function bookingImage(b: Booking) {
  if (b.service_image?.startsWith('http')) return b.service_image;
  if (b.service_image) return `${ASSET_BASE_URL}/storage/${b.service_image}`;
  return serviceImageUrl({ id: b.id, name: b.service || '', slug: b.service_slug || '', price: b.amount } as any);
}

function jobCount(booking: Booking) {
  const seed = booking.id * 137;
  return 280 + (seed % 400);
}

function hasAssignedPro(booking: Booking): boolean {
  return Boolean(booking.professional?.trim());
}

function canTrack(booking: Booking, tab: TabKey): boolean {
  if (tab === 'Cancelled' || tab === 'Completed') return false;
  return hasAssignedPro(booking);
}

function isBookingConfirmed(booking: Booking): boolean {
  return booking.status === 'confirmed' || booking.status === 'in_progress' || booking.status === 'completed';
}

type Props = {
  booking: Booking;
  onPress: () => void;
  onRefresh: () => void;
  onTrack: (booking: Booking) => void;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onInvoice?: (booking: Booking) => void;
};

export default function BookingCard({ booking, onPress, onTrack, onReschedule, onCancel, onInvoice }: Props) {
  const tab = getTab(booking);
  const st = STATUS_STYLE[tab];
  const stepIdx = stepIndex(booking.workflow_stage);
  const jobs = jobCount(booking);
  const proAssigned = hasAssignedPro(booking);
  const showTrack = canTrack(booking, tab);
  const trackPro = () => onTrack(booking);
  const rateReview = () => navigateToRateReview(booking);
  const payment = getPaymentDisplay(booking);
  const paymentStyles = {
    paid: { bg: '#D1FAE5', color: '#059669', border: '#A7F3D0' },
    pending: { bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' },
    cod: { bg: '#FFF7ED', color: '#C2410C', border: '#FFEDD5' },
  }[payment.tone];

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.topSection}>
        <View style={styles.imageWrap}>
          <Image source={{ uri: bookingImage(booking) }} style={styles.image} resizeMode="cover" />
          <View style={[styles.statusPill, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>

        <View style={styles.mainCol}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.service} numberOfLines={1}>{booking.service}</Text>
              <Text style={styles.code}>#{booking.booking_code}</Text>
            </View>
            <View style={[styles.priceBox, { backgroundColor: st.priceBg }]}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.price}>₹{Number(booking.amount).toLocaleString('en-IN')}</Text>
              <Pressable
                style={[styles.viewBtn, (tab === 'Completed' || booking.invoice_available) && styles.viewInvoice]}
                onPress={(e) => {
                  e.stopPropagation?.();
                  if ((tab === 'Completed' || booking.invoice_available) && onInvoice) onInvoice(booking);
                  else onPress();
                }}
              >
                <Text style={[styles.viewBtnText, (tab === 'Completed' || booking.invoice_available) && styles.viewInvoiceText]}>
                  {(tab === 'Completed' || booking.invoice_available) ? 'View Invoice' : 'View Details'}
                </Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={BRAND.muted} />
            <Text style={styles.meta}>{booking.date} · {booking.time_slot}</Text>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={BRAND.muted} />
            <Text style={styles.meta} numberOfLines={1}>{booking.address}</Text>
          </View>
          <View style={[styles.paymentRow, { backgroundColor: paymentStyles.bg, borderColor: paymentStyles.border }]}>
            <Ionicons name={payment.icon} size={15} color={paymentStyles.color} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.paymentLabel, { color: paymentStyles.color }]}>{payment.label}</Text>
              <Text style={styles.paymentSub}>{payment.sublabel}</Text>
            </View>
            <View style={[styles.paymentTag, { backgroundColor: '#fff' }]}>
              <Text style={[styles.paymentTagText, { color: paymentStyles.color }]}>{payment.shortTag}</Text>
            </View>
          </View>
        </View>
      </View>

      {proAssigned && tab !== 'Cancelled' && (
        <View style={styles.proRow}>
          <View style={styles.proAvatar}>
            <Text style={styles.proInitial}>{booking.professional![0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proName}>{booking.professional}</Text>
            <Text style={styles.proMeta}>⭐ 4.{8 - (booking.id % 3)} · {jobs} Jobs</Text>
          </View>
        </View>
      )}

      {tab === 'Upcoming' && isBookingConfirmed(booking) && !proAssigned && (
        <View style={styles.waitingRow}>
          <Ionicons name="hourglass-outline" size={16} color="#EA580C" />
          <Text style={styles.waitingText}>
            {booking.status_message || 'Waiting for service partner to accept your booking...'}
          </Text>
        </View>
      )}

      {proAssigned && tab !== 'Cancelled' && tab !== 'Completed' && (
        <View style={styles.onWayRow}>
          <Ionicons
            name={
              booking.workflow_stage === 'awaiting_payment'
                ? 'wallet-outline'
                : booking.workflow_stage === 'work_started'
                  ? 'construct-outline'
                  : 'bicycle-outline'
            }
            size={16}
            color={BRAND.primary}
          />
          <Text style={styles.onWayText}>
            {booking.status_message
              || (booking.workflow_stage === 'on_the_way' || booking.workflow_stage === 'accepted'
                ? `${booking.professional} is on the way`
                : `${booking.professional} assigned to your service`)}
          </Text>
        </View>
      )}

      {tab === 'Active' && booking.show_otp && booking.otp && !booking.otp_verified && (
        <View style={styles.otpBanner}>
          <Ionicons name="key-outline" size={18} color="#EA580C" />
          <View style={{ flex: 1 }}>
            <Text style={styles.otpBannerTitle}>Share OTP with professional</Text>
            <Text style={styles.otpBannerCode}>{booking.otp}</Text>
            <Text style={styles.otpBannerSub}>Pro will enter this code to start your service</Text>
          </View>
        </View>
      )}

      {tab === 'Active' && booking.work_progress?.in_progress && (
        <View style={styles.workBanner}>
          <Text style={styles.workBannerTitle}>Service in progress</Text>
          <View style={styles.workBarTrack}>
            <View style={[styles.workBarFill, { width: `${booking.work_progress.percent}%` }]} />
          </View>
          <Text style={styles.workBannerSub}>
            Completes in ~{booking.work_progress.seconds_left >= 60
              ? `${Math.ceil(booking.work_progress.seconds_left / 60)} min`
              : `${booking.work_progress.seconds_left}s`}
          </Text>
        </View>
      )}

      {tab === 'Active' && booking.workflow_stage === 'awaiting_payment' && (
        <View style={styles.payBanner}>
          <Ionicons name="checkmark-circle" size={18} color="#059669" />
          <Text style={styles.payBannerText}>Service done — please pay your professional</Text>
        </View>
      )}

      {tab === 'Active' && proAssigned && (
        <View style={styles.stepper}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepDot, i < stepIdx ? styles.stepDone : i === stepIdx ? styles.stepActive : styles.stepInactive]}>
                {i < stepIdx ? (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                ) : i === stepIdx ? (
                  <Ionicons name={i === 1 ? 'water' : 'ellipse'} size={i === 1 ? 10 : 8} color="#fff" />
                ) : (
                  <Ionicons name="lock-closed" size={9} color={BRAND.light} />
                )}
              </View>
              <Text style={[styles.stepLabel, i === stepIdx && styles.stepLabelActive]}>{s}</Text>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, i < stepIdx && styles.stepLineActive]} />}
            </View>
          ))}
        </View>
      )}

      {tab === 'Cancelled' && (
        <Text style={styles.cancelledText}>Cancelled on {booking.cancelled_at || booking.date}</Text>
      )}

      <View style={styles.actions}>
        {tab === 'Upcoming' && (
          <>
            <Pressable style={styles.outlineBtn} onPress={() => onReschedule(booking)}>
              <Ionicons name="calendar-outline" size={14} color={BRAND.ink} />
              <Text style={styles.outlineText}>Reschedule</Text>
            </Pressable>
            <Pressable style={styles.outlineBtn} onPress={() => onCancel(booking)}>
              <Ionicons name="close-outline" size={14} color={BRAND.ink} />
              <Text style={styles.outlineText}>Cancel</Text>
            </Pressable>
            {showTrack && (
              <Pressable onPress={trackPro}>
                <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.primaryBtn}>
                  <Ionicons name="location" size={14} color="#fff" />
                  <Text style={styles.primaryText}>Track Pro</Text>
                </LinearGradient>
              </Pressable>
            )}
          </>
        )}
        {tab === 'Active' && showTrack && (
          <Pressable style={{ flex: 1 }} onPress={trackPro}>
            <LinearGradient colors={['#9333EA', BRAND.purple]} style={[styles.primaryBtn, { flex: 1 }]}>
              <Ionicons name="radio" size={14} color="#fff" />
              <Text style={styles.primaryText}>Track Live</Text>
            </LinearGradient>
          </Pressable>
        )}
        {tab === 'Active' && !showTrack && (
          <View style={styles.waitingRow}>
            <Ionicons name="hourglass-outline" size={16} color="#2563EB" />
            <Text style={styles.waitingText}>Waiting for professional assignment...</Text>
          </View>
        )}
        {tab === 'Completed' && (
          <Pressable style={styles.reviewBtn} onPress={rateReview}>
            <Ionicons name="star" size={14} color={BRAND.gold} />
            <Text style={styles.reviewText}>Rate & Review</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  topSection: { flexDirection: 'row', gap: 12 },
  imageWrap: { width: 88, height: 88, borderRadius: 16, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  statusPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    borderRadius: 8,
    paddingVertical: 3,
    alignItems: 'center',
  },
  statusText: { fontSize: 9, fontWeight: '800' },
  mainCol: { flex: 1 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' },
  titleBlock: { flex: 1 },
  service: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  code: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  priceBox: { borderRadius: 14, padding: 10, alignItems: 'center', minWidth: 96 },
  priceLabel: { fontSize: 9, color: BRAND.muted, fontWeight: '600' },
  price: { fontSize: 16, fontWeight: '800', color: BRAND.ink, marginTop: 2 },
  viewBtn: { marginTop: 8, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  viewBtnText: { fontSize: 9, fontWeight: '700', color: BRAND.primary },
  viewInvoice: { backgroundColor: BRAND.success },
  viewInvoiceText: { color: '#fff' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  meta: { fontSize: 12, color: BRAND.muted, flex: 1 },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentLabel: { fontSize: 12, fontWeight: '800' },
  paymentSub: { fontSize: 10, color: BRAND.muted, marginTop: 1, fontWeight: '600' },
  paymentTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  paymentTagText: { fontSize: 10, fontWeight: '800' },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  proAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInitial: { fontWeight: '800', color: BRAND.primary, fontSize: 16 },
  proName: { fontSize: 14, fontWeight: '700' },
  proMeta: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  stepper: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingHorizontal: 2 },
  stepItem: { flex: 1, alignItems: 'center', position: 'relative' },
  stepDot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepDone: { backgroundColor: '#9333EA' },
  stepActive: { backgroundColor: '#9333EA' },
  stepInactive: { backgroundColor: BRAND.border },
  stepLabel: { fontSize: 10, color: BRAND.light, marginTop: 5, fontWeight: '600' },
  stepLabelActive: { color: '#9333EA', fontWeight: '800' },
  stepLine: { position: 'absolute', top: 13, left: '55%', width: '90%', height: 2, backgroundColor: BRAND.border },
  stepLineActive: { backgroundColor: '#9333EA' },
  cancelledText: { fontSize: 12, color: '#EF4444', fontWeight: '600', marginTop: 12, textAlign: 'right' },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    padding: 12,
    borderRadius: 12,
    flex: 1,
  },
  waitingText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#92400E', lineHeight: 18 },
  onWayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FFF5F9',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FBCFE8',
  },
  onWayText: { flex: 1, fontSize: 12, fontWeight: '700', color: BRAND.primary, lineHeight: 18 },
  otpBanner: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },
  otpBannerTitle: { fontSize: 12, fontWeight: '800', color: '#EA580C' },
  otpBannerCode: { fontSize: 22, fontWeight: '800', color: BRAND.ink, letterSpacing: 6, marginTop: 4 },
  otpBannerSub: { fontSize: 11, color: BRAND.muted, marginTop: 4, lineHeight: 16 },
  workBanner: {
    marginTop: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  workBannerTitle: { fontSize: 12, fontWeight: '800', color: '#6D28D9' },
  workBarTrack: { height: 6, backgroundColor: '#EDE9FE', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  workBarFill: { height: '100%', backgroundColor: '#9333EA', borderRadius: 3 },
  workBannerSub: { fontSize: 11, color: BRAND.muted, marginTop: 6, fontWeight: '600' },
  payBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  payBannerText: { flex: 1, fontSize: 12, fontWeight: '700', color: '#059669', lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap' },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: { fontSize: 12, fontWeight: '700', color: BRAND.ink },
  primaryBtn: {
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  reviewBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    borderWidth: 1,
    borderColor: BRAND.gold,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewText: { fontSize: 12, fontWeight: '700', color: BRAND.ink },
});
