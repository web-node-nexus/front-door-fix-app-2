import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Booking, PaymentPayload } from '../../api/client';
import { BRAND } from '../../config';
import { useActiveBooking } from '../../context/ActiveBookingContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';
import { isBookingCompleted } from '../../utils/bookingLifecycle';

const POLL_MS = 3000;

function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ServicePaymentScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding();
  const booking: Booking = route.params?.booking;
  const { showServiceComplete } = useActiveBooking();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PaymentPayload | null>(null);
  const [method, setMethod] = useState<'cod' | 'online'>('online');
  const [showModal, setShowModal] = useState(false);
  const [methodConfirmed, setMethodConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [timer, setTimer] = useState('10:00');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const payload = await api.paymentPayload(booking.id);
      setData(payload);
      const m = (payload.collection_method as 'cod' | 'online') || 'online';
      setMethod(m);
      if (payload.is_completed || isBookingCompleted({
        ...booking,
        status: 'completed',
        workflow_stage: payload.workflow_stage || 'completed',
        tab: 'Completed',
      })) {
        await showServiceComplete({
          ...booking,
          status: 'completed',
          workflow_stage: 'completed',
          tab: 'Completed',
        });
        return;
      }
      // Popup sirf pehli load par — Continue ke baad poll se dubara nahi khulega
      if (!silent && !methodConfirmed && payload.needs_collection && !payload.already_paid_online && payload.collection_status !== 'received') {
        setShowModal(true);
      }
    } catch (e) {
      if (!silent) {
        Alert.alert('Error', e instanceof Error ? e.message : 'Could not load payment');
      }
    } finally {
      setLoading(false);
    }
  }, [booking, methodConfirmed, showServiceComplete]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!data || data.is_completed) return;
    const timerId = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(timerId);
  }, [data?.is_completed, load]);

  useEffect(() => {
    if (!data?.qr_expires_at || method !== 'online') return;
    const tick = () => {
      const left = Math.max(0, data.qr_expires_at! - Math.floor(Date.now() / 1000));
      setTimer(formatTimer(left));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.qr_expires_at, method]);

  const applyMethod = async (m: 'cod' | 'online') => {
    setSaving(true);
    try {
      const res = await api.selectPaymentMethod(booking.id, m);
      setData(res.data);
      setMethod(m);
      setMethodConfirmed(true);
      setShowModal(false);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save method');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = () => {
    setAcknowledged(true);
    Alert.alert(
      'Payment Submitted',
      method === 'cod'
        ? 'Cash payment noted. Your professional will confirm shortly.'
        : 'UPI payment noted. Waiting for professional to verify.',
    );
  };

  const callPro = () => {
    const phone = data?.professional_phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const paid = data?.collection_status === 'received' || data?.already_paid_online || data?.is_completed;

  if (loading && !data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <Text style={styles.loadingText}>Loading payment...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
        <View style={[styles.banner, paid && styles.bannerPaid]}>
          <Text style={styles.bannerEmoji}>{paid ? '✅' : '🔧'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>{paid ? 'Payment Successful' : 'Service Completed!'}</Text>
            <Text style={styles.bannerSub}>
              {paid
                ? `₹${Number(data?.amount).toLocaleString('en-IN')} paid · ${data?.collection_txn_id || 'Verified'}`
                : `Please pay ₹${Number(data?.amount).toLocaleString('en-IN')} to complete your booking`}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.step}><Text style={styles.stepText}>1</Text></View>
            <Text style={styles.cardTitle}>Job Summary</Text>
          </View>
          <Text style={styles.service}>{data?.service}</Text>
          <Row label="Booking ID" value={data?.booking_code || ''} />
          <Row label="Professional" value={data?.professional || '—'} />
          <Row label="Date & Time" value={`${data?.date} · ${data?.time}`} />
          <Row label="Address" value={data?.address || ''} />
          <Row label="Amount Due" value={`₹${Number(data?.amount).toLocaleString('en-IN')}`} highlight />
        </View>

        {!paid && data?.needs_collection && methodConfirmed && (
          <>
            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.step}><Text style={styles.stepText}>2</Text></View>
                <Text style={styles.cardTitle}>Payment Method Selected</Text>
              </View>
              <View style={[styles.method, styles.methodActive]}>
                <Text style={styles.methodIcon}>{method === 'cod' ? '💵' : '📱'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodTitle}>{method === 'cod' ? 'Cash Payment' : 'Online Payment (UPI)'}</Text>
                  <Text style={styles.methodSub}>
                    {method === 'cod' ? 'Pay cash to your professional' : 'Scan QR with GPay / PhonePe / Paytm'}
                  </Text>
                </View>
                <Pressable onPress={() => { setMethodConfirmed(false); setShowModal(true); }}>
                  <Text style={styles.changeText}>Change</Text>
                </Pressable>
              </View>
            </View>

            {method === 'online' && (
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={styles.step}><Text style={styles.stepText}>3</Text></View>
                  <Text style={styles.cardTitle}>Scan QR to Pay</Text>
                </View>
                <Text style={styles.qrHint}>Scan this QR code with any UPI app to pay securely</Text>
                <View style={styles.qrFrame}>
                  <Image
                    source={{ uri: data?.qr_fallback_url || data?.qr_image_url || '' }}
                    style={styles.qrImg}
                    resizeMode="contain"
                  />
                  <View style={styles.gpayBadge}>
                    <Text style={styles.gpayText}>GPay · PhonePe · Paytm</Text>
                  </View>
                </View>
                <View style={styles.upiRow}>
                  <Text style={styles.upiLabel}>Pay to: <Text style={styles.upiId}>{data?.upi_id}</Text></Text>
                  <Text style={styles.qrAmount}>₹{Number(data?.amount).toLocaleString('en-IN')}</Text>
                  <Text style={styles.qrCode}>{data?.booking_code}</Text>
                  <Text style={styles.qrTimer}>QR expires in <Text style={styles.timerStrong}>{timer}</Text></Text>
                </View>
              </View>
            )}

            {method === 'cod' && (
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={styles.step}><Text style={styles.stepText}>3</Text></View>
                  <Text style={styles.cardTitle}>Pay Cash to Professional</Text>
                </View>
                <Text style={styles.cashHint}>
                  Hand ₹{Number(data?.amount).toLocaleString('en-IN')} cash to {data?.professional}. They will confirm receipt in their app.
                </Text>
                <Pressable style={styles.callRow} onPress={callPro}>
                  <Ionicons name="call" size={18} color={BRAND.primary} />
                  <Text style={styles.callText}>Call {data?.professional}</Text>
                </Pressable>
              </View>
            )}

            <View style={styles.card}>
              <View style={styles.cardHead}>
                <View style={styles.step}><Text style={styles.stepText}>4</Text></View>
                <Text style={styles.cardTitle}>Payment Status</Text>
              </View>
              {acknowledged || data?.collection_status === 'pending' ? (
                <View style={styles.waiting}>
                  <ActivityIndicator color={BRAND.primary} />
                  <Text style={styles.waitingTitle}>Waiting for confirmation</Text>
                  <Text style={styles.waitingSub}>Professional is verifying your payment...</Text>
                </View>
              ) : (
                <Text style={styles.statusPending}>Payment pending — complete payment above</Text>
              )}
            </View>

            {!acknowledged && (
              <Pressable onPress={markPaid} disabled={saving}>
                <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.payBtn}>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.payBtnText}>
                    {method === 'cod' ? "I've Paid Cash" : "I've Completed UPI Payment"}
                  </Text>
                </LinearGradient>
              </Pressable>
            )}
          </>
        )}

        {!paid && data?.needs_collection && !methodConfirmed && (
          <View style={styles.hintCard}>
            <Ionicons name="information-circle-outline" size={20} color={BRAND.primary} />
            <Text style={styles.hintText}>Select payment method above to continue</Text>
          </View>
        )}

        {paid && (
          <Pressable onPress={() => nav.goBack()}>
            <LinearGradient colors={[BRAND.success, '#059669']} style={styles.payBtn}>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.payBtnText}>Back to My Bookings</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>

      <Modal visible={showModal && !methodConfirmed} transparent animationType="slide" onRequestClose={() => {}}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalStep}><Text style={styles.modalStepText}>2</Text></View>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <Text style={styles.modalSub}>How would you like to pay for this service?</Text>
            <Pressable style={[styles.modalOpt, method === 'cod' && styles.modalOptActive]} onPress={() => setMethod('cod')}>
              <Text style={styles.methodIcon}>💵</Text>
              <View>
                <Text style={styles.methodTitle}>Cash Payment</Text>
                <Text style={styles.methodSub}>Pay cash to your professional</Text>
              </View>
            </Pressable>
            <Pressable style={[styles.modalOpt, method === 'online' && styles.modalOptActive]} onPress={() => setMethod('online')}>
              <Text style={styles.methodIcon}>📱</Text>
              <View>
                <Text style={styles.methodTitle}>Online Payment</Text>
                <Text style={styles.methodSub}>Scan UPI QR code</Text>
              </View>
            </Pressable>
            <Pressable onPress={() => applyMethod(method)} disabled={saving}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>{saving ? 'Please wait...' : 'Continue'}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight && styles.rowHighlight]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: BRAND.surface },
  loadingText: { color: BRAND.muted, fontWeight: '600' },
  content: { padding: 20, gap: 14 },
  banner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
  },
  bannerPaid: { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' },
  bannerEmoji: { fontSize: 32 },
  bannerTitle: { fontSize: 17, fontWeight: '800', color: BRAND.ink },
  bannerSub: { fontSize: 13, color: BRAND.muted, marginTop: 4, lineHeight: 18 },
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  step: { width: 28, height: 28, borderRadius: 14, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontWeight: '800', color: BRAND.primary, fontSize: 13 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  service: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: BRAND.border },
  rowLabel: { fontSize: 12, color: BRAND.muted, fontWeight: '600', flex: 1 },
  rowValue: { fontSize: 13, fontWeight: '700', flex: 1.2, textAlign: 'right' },
  rowHighlight: { color: BRAND.primary, fontSize: 16 },
  method: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
  },
  methodActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  methodIcon: { fontSize: 24 },
  methodTitle: { fontSize: 14, fontWeight: '800' },
  methodSub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  changeText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BRAND.lavender,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  hintText: { flex: 1, fontSize: 13, color: BRAND.muted, fontWeight: '600' },
  qrHint: { fontSize: 13, color: BRAND.muted, marginBottom: 12, textAlign: 'center' },
  qrFrame: {
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: BRAND.border,
  },
  qrImg: { width: 220, height: 220, borderRadius: 12, backgroundColor: '#fff' },
  gpayBadge: { marginTop: 10, backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: BRAND.border },
  gpayText: { fontSize: 11, fontWeight: '700', color: BRAND.muted },
  upiRow: { alignItems: 'center', marginTop: 14, gap: 4 },
  upiLabel: { fontSize: 13, color: BRAND.muted },
  upiId: { fontWeight: '800', color: BRAND.ink },
  qrAmount: { fontSize: 28, fontWeight: '800', color: BRAND.primary },
  qrCode: { fontSize: 12, color: BRAND.muted },
  qrTimer: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  timerStrong: { fontWeight: '800', color: '#EA580C' },
  cashHint: { fontSize: 14, color: BRAND.muted, lineHeight: 22 },
  callRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, alignSelf: 'flex-start' },
  callText: { color: BRAND.primary, fontWeight: '700' },
  waiting: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  waitingTitle: { fontSize: 15, fontWeight: '800' },
  waitingSub: { fontSize: 12, color: BRAND.muted, textAlign: 'center' },
  statusPending: { fontSize: 13, color: '#EA580C', fontWeight: '600' },
  payBtn: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    marginTop: 4,
  },
  payBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  modalStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalStepText: { fontWeight: '800', color: BRAND.primary },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 14, color: BRAND.muted, marginTop: 6, marginBottom: 16 },
  modalOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
  },
  modalOptActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  modalBtn: { borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 8 },
  modalBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
