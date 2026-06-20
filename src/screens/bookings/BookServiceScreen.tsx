import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
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
import { api, Booking, Service } from '../../api/client';
import BookingSuccessModal from '../../components/BookingSuccessModal';
import { BRAND } from '../../config';
import { useActiveBooking } from '../../context/ActiveBookingContext';
import { useLocation } from '../../context/LocationContext';
import { nextDates, TIME_SLOTS } from '../../data/bookingSlots';
import { useScreenPadding } from '../../hooks/useScreenPadding';
import { durationLabel, serviceImageUrl } from '../../utils/serviceImagery';

function parseLocationLabel(label: string): { address: string; city: string } {
  const parts = label.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return {
      address: parts.slice(0, -1).join(', '),
      city: parts[parts.length - 1],
    };
  }
  return { address: label, city: label };
}

const SERVICEABLE_PINCODES: Record<string, string> = {
  mumbai: '400001',
  powai: '400001',
  andheri: '400001',
  delhi: '110001',
  bangalore: '560001',
  bengaluru: '560001',
  pune: '411001',
  hyderabad: '500001',
};

function pincodeForLocation(city: string, label: string): string {
  const haystack = `${city} ${label}`.toLowerCase();
  for (const [key, pin] of Object.entries(SERVICEABLE_PINCODES)) {
    if (haystack.includes(key)) return pin;
  }
  return '400001';
}

export default function BookServiceScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const { location } = useLocation();
  const { refresh: refreshActiveBooking } = useActiveBooking();
  const service: Service = route.params?.service;
  const dates = nextDates();
  const pickingLocation = useRef(false);

  const parsed = parseLocationLabel(location.label);

  const [date, setDate] = useState(dates[1]?.value || dates[0].value);
  const [slot, setSlot] = useState(TIME_SLOTS[1]);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState(parsed.city);
  const [pincode, setPincode] = useState(pincodeForLocation(parsed.city, location.label));
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [saving, setSaving] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const applyLocation = useCallback((label: string) => {
    const next = parseLocationLabel(label);
    setCity(next.city);
    setPincode(pincodeForLocation(next.city, label));
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (pickingLocation.current) {
        applyLocation(location.label);
        pickingLocation.current = false;
      }
    }, [location.label, applyLocation]),
  );

  const openLocationPicker = () => {
    pickingLocation.current = true;
    nav.navigate('LocationPicker');
  };

  const fullAddress = () => {
    const base = location.label.trim();
    const extra = addressLine.trim();
    if (extra && base) return `${extra}, ${base}`;
    return extra || base;
  };

  const confirm = async () => {
    const address = fullAddress();
    if (!address.trim()) {
      Alert.alert('Address required', 'Please select location on map or enter your address.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('City required', 'Please enter your city.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert('Invalid pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.storeBooking({
        service_id: service.id,
        address,
        city: city.trim(),
        pincode: pincode.trim(),
        booking_date: date,
        time_slot: slot,
        payment_method: paymentMethod,
      });
      setConfirmedBooking(res.booking);
      refreshActiveBooking();
    } catch (e) {
      Alert.alert('Booking failed', e instanceof Error ? e.message : 'Could not complete booking');
    } finally {
      setSaving(false);
    }
  };

  const viewBooking = () => {
    if (!confirmedBooking) return;
    setConfirmedBooking(null);
    nav.navigate('LiveTracking', { booking: confirmedBooking });
  };

  const viewAllBookings = () => {
    setConfirmedBooking(null);
    nav.navigate('Tabs', { screen: 'Bookings', params: { tab: 'Upcoming' } });
  };

  return (
    <>
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.serviceCard}>
        <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceCat}>{service.category?.name}</Text>
          <View style={styles.serviceMeta}>
            <Text style={styles.duration}>{durationLabel(service.duration_hours)}</Text>
            <Text style={styles.price}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Service Address</Text>

      <Pressable style={styles.locationCard} onPress={openLocationPicker}>
        <View style={styles.locationIconWrap}>
          <Ionicons name="location" size={22} color={BRAND.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.locationLabel}>Service location</Text>
          <Text style={styles.locationValue} numberOfLines={2}>
            {location.label || 'Tap to select on map'}
          </Text>
        </View>
        <View style={styles.changeBtn}>
          <Ionicons name="map-outline" size={16} color={BRAND.primary} />
          <Text style={styles.changeText}>Map</Text>
        </View>
      </Pressable>

      <View style={styles.field}>
        <Ionicons name="home-outline" size={18} color={BRAND.primary} />
        <TextInput
          style={styles.input}
          placeholder="Flat no., building, landmark (optional)"
          placeholderTextColor={BRAND.light}
          value={addressLine}
          onChangeText={setAddressLine}
          multiline
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <TextInput
            style={styles.inputPlain}
            placeholder="City"
            placeholderTextColor={BRAND.light}
            value={city}
            onChangeText={setCity}
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <TextInput
            style={styles.inputPlain}
            placeholder="Pincode"
            placeholderTextColor={BRAND.light}
            value={pincode}
            onChangeText={setPincode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </View>
      <Text style={styles.pinHint}>
        Service available: Mumbai 400001 · Delhi 110001 · Bangalore 560001 · Pune 411001 · Hyderabad 500001
      </Text>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
        {dates.map((d) => (
          <Pressable key={d.value} onPress={() => setDate(d.value)}>
            {date === d.value ? (
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.dateActive}>
                <Text style={styles.dateTextActive}>{d.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.dateChip}>
                <Text style={styles.dateText}>{d.label}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Select Time Slot</Text>
      {TIME_SLOTS.map((s) => (
        <Pressable key={s} style={[styles.slot, slot === s && styles.slotActive]} onPress={() => setSlot(s)}>
          <Ionicons name="time-outline" size={18} color={slot === s ? BRAND.primary : BRAND.muted} />
          <Text style={[styles.slotText, slot === s && styles.slotTextActive]}>{s}</Text>
          {slot === s && <Ionicons name="checkmark-circle" size={20} color={BRAND.primary} />}
        </Pressable>
      ))}

      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.payRow}>
        <Pressable
          style={[styles.payOption, paymentMethod === 'cod' && styles.payOptionActive]}
          onPress={() => setPaymentMethod('cod')}
        >
          <Ionicons name="cash-outline" size={22} color={paymentMethod === 'cod' ? BRAND.primary : BRAND.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.payTitle, paymentMethod === 'cod' && styles.payTitleActive]}>Cash on Delivery</Text>
            <Text style={styles.paySub}>Pay after service completion</Text>
          </View>
          {paymentMethod === 'cod' && <Ionicons name="checkmark-circle" size={20} color={BRAND.primary} />}
        </Pressable>
        <Pressable
          style={[styles.payOption, paymentMethod === 'upi' && styles.payOptionActive]}
          onPress={() => setPaymentMethod('upi')}
        >
          <Ionicons name="phone-portrait-outline" size={22} color={paymentMethod === 'upi' ? BRAND.primary : BRAND.muted} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.payTitle, paymentMethod === 'upi' && styles.payTitleActive]}>Pay Online (UPI)</Text>
            <Text style={styles.paySub}>Pay now · shows as Paid Online</Text>
          </View>
          {paymentMethod === 'upi' && <Ionicons name="checkmark-circle" size={20} color={BRAND.primary} />}
        </Pressable>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Amount to pay</Text>
        <Text style={styles.summaryAmount}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
        <Text style={styles.summaryNote}>
          {paymentMethod === 'cod' ? 'Pay after service completion (Cash on Delivery)' : 'Online payment · marked as Paid Online in My Bookings'}
        </Text>
      </View>

      <Pressable onPress={confirm} disabled={saving}>
        <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>{saving ? 'Booking...' : 'Confirm Booking'}</Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>

    <BookingSuccessModal
      visible={!!confirmedBooking}
      booking={confirmedBooking}
      onViewBooking={viewBooking}
      onViewAll={viewAllBookings}
      onClose={() => setConfirmedBooking(null)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  content: { padding: 20 },
  serviceCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  image: { width: 88, height: 88, borderRadius: 14 },
  serviceInfo: { flex: 1, justifyContent: 'center' },
  serviceName: { fontSize: 17, fontWeight: '800', color: BRAND.ink },
  serviceCat: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  serviceMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  duration: { fontSize: 12, fontWeight: '600', color: BRAND.primary },
  price: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 10, marginTop: 4 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    marginBottom: 10,
  },
  locationIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '600' },
  locationValue: { fontSize: 15, fontWeight: '700', color: BRAND.ink, marginTop: 3, lineHeight: 20 },
  changeBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: BRAND.lavender,
    gap: 2,
  },
  changeText: { fontSize: 11, fontWeight: '800', color: BRAND.primary },
  field: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
  },
  input: { flex: 1, fontSize: 15, color: BRAND.ink, minHeight: 44 },
  inputPlain: { flex: 1, fontSize: 15, color: BRAND.ink },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  pinHint: { fontSize: 11, color: BRAND.muted, lineHeight: 16, marginBottom: 8, marginTop: -2 },
  dateRow: { gap: 8, marginBottom: 16 },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: BRAND.canvas,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginRight: 8,
  },
  dateActive: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginRight: 8 },
  dateText: { fontWeight: '600', color: BRAND.muted, fontSize: 13 },
  dateTextActive: { fontWeight: '800', color: '#fff', fontSize: 13 },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  slotActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  slotText: { flex: 1, fontWeight: '600', fontSize: 15, color: BRAND.ink },
  slotTextActive: { color: BRAND.primary, fontWeight: '800' },
  payRow: { gap: 10, marginBottom: 12 },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BRAND.border,
  },
  payOptionActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  payTitle: { fontSize: 15, fontWeight: '700', color: BRAND.ink },
  payTitleActive: { color: BRAND.primary },
  paySub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  summary: {
    backgroundColor: BRAND.lavender,
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  summaryAmount: { fontSize: 24, fontWeight: '800', color: BRAND.ink, marginTop: 4 },
  summaryNote: { fontSize: 12, color: BRAND.muted, marginTop: 6 },
  btn: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
