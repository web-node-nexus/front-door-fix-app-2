import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Booking, TrackingPayload } from '../api/client';
import { BRAND } from '../config';
import { useLocation } from '../context/LocationContext';
import { isBookingCompleted } from '../utils/bookingLifecycle';
import { useActiveBooking } from '../context/ActiveBookingContext';

const POLL_MS = 3000;
const PANEL_MAX = Math.round(Dimensions.get('window').height * 0.52);

function toCoord(pair: [number, number] | undefined, fallback: { latitude: number; longitude: number }) {
  if (!pair || pair.length < 2) return fallback;
  return { latitude: pair[0], longitude: pair[1] };
}

function TimelineRow({ timeline }: { timeline: TrackingPayload['timeline'] }) {
  if (!timeline?.length) return null;
  const visible = timeline.filter((t) => t.key !== 'awaiting_payment').slice(0, 6);

  return (
    <View style={styles.timelineWrap}>
      <Text style={styles.sectionTitle}>Service Status</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timelineRow}>
        {visible.map((step, i) => (
          <View key={step.key} style={styles.timelineItem}>
            <View style={[styles.timelineDot, step.done && styles.timelineDone, step.active && styles.timelineActive]}>
              {step.done ? (
                <Ionicons name="checkmark" size={12} color="#fff" />
              ) : step.active ? (
                <View style={styles.timelinePulse} />
              ) : (
                <Ionicons name="ellipse" size={8} color={BRAND.light} />
              )}
            </View>
            <Text style={[styles.timelineLabel, step.active && styles.timelineLabelActive]} numberOfLines={2}>
              {step.label}
            </Text>
            {step.time ? <Text style={styles.timelineTime}>{step.time}</Text> : null}
            {i < visible.length - 1 && <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export default function LiveTrackingScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { location: savedLoc } = useLocation();
  const { showServiceComplete } = useActiveBooking();
  const mapRef = useRef<MapView>(null);

  const booking: Booking = route.params?.booking;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tracking, setTracking] = useState<TrackingPayload | null>(null);
  const [proPos, setProPos] = useState<{ latitude: number; longitude: number } | null>(null);

  const customerFallback = { latitude: savedLoc.latitude, longitude: savedLoc.longitude };

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await api.bookingTracking(booking.id);
      setTracking(data);
      setError(null);

      if (isBookingCompleted({ ...booking, status: data.status, workflow_stage: data.workflow_stage })) {
        await showServiceComplete({
          ...booking,
          status: data.status,
          workflow_stage: data.workflow_stage,
          tab: 'Completed',
        });
        return;
      }

      const worker = toCoord(data.worker_location, customerFallback);
      setProPos(worker);
      const customer = toCoord(data.customer_location, customerFallback);
      const coords = data.searching ? [customer] : [worker, customer];
      mapRef.current?.fitToCoordinates(coords, {
        edgePadding: { top: 120, right: 60, bottom: PANEL_MAX + 40, left: 60 },
        animated: true,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tracking');
    } finally {
      setLoading(false);
    }
  }, [booking, savedLoc.latitude, savedLoc.longitude, showServiceComplete]);

  useEffect(() => {
    load();
    const timer = setInterval(() => load(true), POLL_MS);
    return () => clearInterval(timer);
  }, [load]);

  const customer = toCoord(tracking?.customer_location, customerFallback);
  const pro = proPos || toCoord(tracking?.worker_location, customerFallback);

  const callPro = () => {
    const phone = tracking?.professional?.phone || booking.professional_phone;
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const stage = tracking?.workflow_stage || 'received';
  const searching = tracking == null
    ? !booking.professional
    : Boolean(tracking.searching);
  const isMoving = stage === 'on_the_way' || stage === 'accepted';
  const arrived = ['arrived', 'otp_verified', 'work_started', 'awaiting_payment', 'completed'].includes(stage);
  const showPro = tracking?.professional && !searching;

  if (loading && !tracking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <Text style={styles.loadingText}>Loading your booking...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: customer.latitude,
          longitude: customer.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        <Marker coordinate={customer} title="Your Location">
          <View style={styles.homeMarker}>
            <Ionicons name="home" size={18} color="#fff" />
          </View>
        </Marker>

        {showPro && (
          <Marker coordinate={pro} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={[styles.proMarker, arrived && styles.proArrived]}>
              <Ionicons name={arrived ? 'construct' : 'bicycle'} size={20} color="#fff" />
            </View>
          </Marker>
        )}

        {showPro && isMoving && !arrived && (
          <Polyline coordinates={[pro, customer]} strokeColor={BRAND.primary} strokeWidth={3} lineDashPattern={[8, 6]} />
        )}
      </MapView>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.topPill}>
          <View style={[styles.liveDot, !searching && styles.liveOn]} />
          <Text style={styles.topText} numberOfLines={1}>
            {tracking?.status_label || (searching ? 'Waiting for partner to accept' : stage === 'accepted' || stage === 'on_the_way' ? 'Service partner on the way' : 'Live tracking')}
          </Text>
        </View>
        <Pressable style={styles.refreshBtn} onPress={() => load()}>
          <Ionicons name="refresh" size={20} color={BRAND.primary} />
        </Pressable>
      </View>

      {error && (
        <View style={styles.errorBubble}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => load()}><Text style={styles.retryText}>Retry</Text></Pressable>
        </View>
      )}

      {!searching && isMoving && (tracking?.eta_minutes ?? 0) > 0 && (
        <View style={styles.etaBubble}>
          <Ionicons name="time-outline" size={16} color={BRAND.primary} />
          <Text style={styles.etaText}>{tracking?.eta_minutes} min · {tracking?.distance_km} km away</Text>
        </View>
      )}

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 12, maxHeight: PANEL_MAX }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.bottomScroll}>
          <View style={styles.bookingCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bookingService}>{tracking?.service || booking.service}</Text>
              <Text style={styles.bookingMeta}>
                {tracking?.booking_code || `#${booking.booking_code}`} · {tracking?.date || booking.date} · {tracking?.time || booking.time_slot}
              </Text>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={14} color={BRAND.muted} />
                <Text style={styles.bookingAddress} numberOfLines={2}>
                  {tracking?.address || booking.address}
                </Text>
              </View>
            </View>
            <View style={styles.amountChip}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amountValue}>₹{Number(tracking?.payment?.amount || booking.amount).toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {searching ? (
            <View style={styles.searchingBox}>
              <ActivityIndicator color={BRAND.primary} size="large" />
              <Text style={styles.searchTitle}>Waiting for partner to accept</Text>
              <Text style={styles.searchSub}>
                Your booking is sent to nearby pros. Live tracking starts after they accept.
              </Text>
              <View style={styles.pulseRow}>
                <View style={styles.pulse} /><View style={[styles.pulse, styles.pulse2]} /><View style={[styles.pulse, styles.pulse3]} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.proCard}>
                <View style={styles.proAvatar}>
                  <Text style={styles.proInit}>{tracking?.professional?.initials?.[0] || tracking?.professional?.name?.[0] || 'P'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.proNameRow}>
                    <Text style={styles.proName}>{tracking?.professional?.name || booking.professional}</Text>
                    {tracking?.professional?.verified && (
                      <View style={styles.verifiedBadge}>
                        <Ionicons name="shield-checkmark" size={12} color="#fff" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.proMeta}>
                    ⭐ {tracking?.professional?.rating || 4.8}
                    {tracking?.professional?.experience ? ` · ${tracking.professional.experience}` : ''}
                    {tracking?.professional?.jobs ? ` · ${tracking.professional.jobs} jobs` : ''}
                  </Text>
                  {tracking?.professional?.vehicle ? (
                    <Text style={styles.proVehicle}>
                      <Ionicons name="bicycle" size={12} color={BRAND.primary} /> {tracking.professional.vehicle}
                      {tracking.professional.vehicle_plate ? ` · ${tracking.professional.vehicle_plate}` : ''}
                    </Text>
                  ) : null}
                </View>
                <Pressable style={styles.callBtn} onPress={callPro}>
                  <Ionicons name="call" size={20} color="#fff" />
                </Pressable>
              </View>

              <View style={styles.stats}>
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{arrived ? 'Arrived' : `${tracking?.eta_minutes || '--'}m`}</Text>
                  <Text style={styles.statLbl}>ETA</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{tracking?.distance_km ?? '--'} km</Text>
                  <Text style={styles.statLbl}>Distance</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.stat}>
                  <Text style={styles.statVal}>{(tracking?.payment?.method || 'COD').toUpperCase()}</Text>
                  <Text style={styles.statLbl}>Payment</Text>
                </View>
              </View>
            </>
          )}

          <TimelineRow timeline={tracking?.timeline} />

          {tracking?.show_otp && tracking.otp && !tracking.otp_verified && (
            <LinearGradient colors={['#FFF7ED', '#FFFFFF']} style={styles.otpCard}>
              <View style={styles.otpHeader}>
                <Ionicons name="key-outline" size={20} color="#EA580C" />
                <Text style={styles.otpTitle}>Your Service OTP</Text>
              </View>
              <Text style={styles.otpCode}>{tracking.otp}</Text>
              <Text style={styles.otpMsg}>
                {tracking.otp_message || 'Share this OTP with your professional. They will enter it to start the service.'}
              </Text>
            </LinearGradient>
          )}

          {tracking?.work_progress?.in_progress && (
            <View style={styles.workCard}>
              <View style={styles.workHeader}>
                <Ionicons name="construct-outline" size={20} color="#6D28D9" />
                <Text style={styles.workTitle}>Service in progress</Text>
                <Text style={styles.workTimer}>
                  {tracking.work_progress.seconds_left >= 60
                    ? `${Math.ceil(tracking.work_progress.seconds_left / 60)}m`
                    : `${tracking.work_progress.seconds_left}s`}
                </Text>
              </View>
              <View style={styles.workBarTrack}>
                <View style={[styles.workBarFill, { width: `${tracking.work_progress.percent}%` }]} />
              </View>
              <Text style={styles.workSub}>Service auto-completes ~2 min after pro accepts. Payment opens for pro when done.</Text>
            </View>
          )}

          {stage === 'awaiting_payment' && (
            <Pressable
              style={styles.payCard}
              onPress={() => nav.navigate('ServicePayment', { booking })}
            >
              <Ionicons name="wallet-outline" size={22} color={BRAND.primary} />
              <View style={{ flex: 1 }}>
                <Text style={styles.payTitle}>Service complete — pay now</Text>
                <Text style={styles.paySub}>₹{Number(tracking?.payment?.amount || booking.amount).toLocaleString('en-IN')} · Tap to pay via UPI or cash</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={BRAND.primary} />
            </Pressable>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: BRAND.surface },
  loadingText: { color: BRAND.muted, fontWeight: '600' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  topPill: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#fff', borderRadius: 14, padding: 12, elevation: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.light },
  liveOn: { backgroundColor: BRAND.success },
  topText: { fontSize: 13, fontWeight: '700', flex: 1 },
  refreshBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  errorBubble: { position: 'absolute', top: '28%', alignSelf: 'center', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, flexDirection: 'row', gap: 10, alignItems: 'center' },
  errorText: { fontSize: 12, color: '#B91C1C' },
  retryText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  etaBubble: { position: 'absolute', top: '36%', alignSelf: 'center', flexDirection: 'row', gap: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 4 },
  etaText: { fontSize: 13, fontWeight: '700' },
  homeMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  proMarker: { width: 42, height: 42, borderRadius: 21, backgroundColor: BRAND.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  proArrived: { backgroundColor: '#9333EA' },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: BRAND.border, marginTop: 10, marginBottom: 8 },
  bottomScroll: { paddingHorizontal: 20, paddingBottom: 8 },
  bookingCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  bookingService: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  bookingMeta: { fontSize: 12, color: BRAND.muted, marginTop: 4, fontWeight: '600' },
  addressRow: { flexDirection: 'row', gap: 6, marginTop: 8, alignItems: 'flex-start' },
  bookingAddress: { flex: 1, fontSize: 12, color: BRAND.muted, lineHeight: 18 },
  amountChip: { backgroundColor: BRAND.lavender, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, alignItems: 'center', minWidth: 72 },
  amountLabel: { fontSize: 10, color: BRAND.muted, fontWeight: '600' },
  amountValue: { fontSize: 14, fontWeight: '800', color: BRAND.primary, marginTop: 2 },
  searchingBox: { alignItems: 'center', gap: 10, paddingVertical: 12, marginBottom: 8 },
  searchTitle: { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  searchSub: { fontSize: 13, color: BRAND.muted, textAlign: 'center', lineHeight: 20 },
  pulseRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  pulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: BRAND.primary, opacity: 0.9 },
  pulse2: { opacity: 0.5 },
  pulse3: { opacity: 0.25 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  proAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  proInit: { fontSize: 20, fontWeight: '800', color: BRAND.primary },
  proNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  proName: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: BRAND.success, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  verifiedText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  proMeta: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  proVehicle: { fontSize: 12, color: BRAND.primary, marginTop: 4, fontWeight: '600' },
  callBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: BRAND.success, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', backgroundColor: BRAND.surface, borderRadius: 14, padding: 12, marginBottom: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  statLbl: { fontSize: 10, color: BRAND.muted, marginTop: 2 },
  divider: { width: 1, backgroundColor: BRAND.border },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink, marginBottom: 10 },
  timelineWrap: { marginBottom: 12 },
  timelineRow: { gap: 4, paddingRight: 12 },
  timelineItem: { width: 88, alignItems: 'center', position: 'relative' },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  timelineDone: { backgroundColor: '#9333EA' },
  timelineActive: { backgroundColor: BRAND.primary },
  timelinePulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
  timelineLabel: { fontSize: 10, color: BRAND.muted, textAlign: 'center', fontWeight: '600', lineHeight: 13 },
  timelineLabelActive: { color: BRAND.primary, fontWeight: '800' },
  timelineTime: { fontSize: 9, color: BRAND.light, marginTop: 2 },
  timelineLine: {
    position: 'absolute',
    top: 14,
    left: '62%',
    width: 56,
    height: 2,
    backgroundColor: BRAND.border,
  },
  timelineLineDone: { backgroundColor: '#9333EA' },
  otpCard: { borderRadius: 16, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#FED7AA' },
  otpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  otpTitle: { fontSize: 14, fontWeight: '800', color: '#EA580C' },
  otpCode: { fontSize: 32, fontWeight: '800', color: BRAND.ink, letterSpacing: 8, textAlign: 'center', marginVertical: 8 },
  otpMsg: { fontSize: 12, color: BRAND.muted, textAlign: 'center', lineHeight: 18 },
  workCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  workHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  workTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: '#6D28D9' },
  workTimer: { fontSize: 12, fontWeight: '800', color: '#6D28D9' },
  workBarTrack: { height: 8, backgroundColor: '#EDE9FE', borderRadius: 4, overflow: 'hidden' },
  workBarFill: { height: '100%', backgroundColor: '#9333EA', borderRadius: 4 },
  workSub: { fontSize: 12, color: BRAND.muted, marginTop: 8, lineHeight: 18 },
  payCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BRAND.lavender,
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.primary,
  },
  payTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  paySub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
});
