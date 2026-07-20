import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
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
import KeyboardAwareScroll from '../../components/KeyboardAwareScroll';
import KeyboardTextInput from '../../components/KeyboardTextInput';
import { BRAND } from '../../config';
import { useActiveBooking } from '../../context/ActiveBookingContext';
import { useFeedback } from '../../context/FeedbackContext';
import { pincodeForCity, useLocation } from '../../context/LocationContext';
import { nextDates, TIME_SLOTS } from '../../data/bookingSlots';
import { useScreenPadding } from '../../hooks/useScreenPadding';
import { durationLabel, serviceImageUrl } from '../../utils/serviceImagery';

export default function BookServiceScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const { location, updateLocation } = useLocation();
  const { showError, showWarning } = useFeedback();
  const { refresh: refreshActiveBooking } = useActiveBooking();
  const service: Service = route.params?.service;
  const dates = nextDates();
  const pickingLocation = useRef(false);

  const [date, setDate] = useState(dates[1]?.value || dates[0].value);
  const [slot, setSlot] = useState(TIME_SLOTS[1]);
  const [addressLine, setAddressLine] = useState(location.addressLine);
  const [city, setCity] = useState(location.city || 'Mumbai');
  const [pincode, setPincode] = useState(location.pincode || pincodeForCity(location.city, location.label));
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi'>('cod');
  const [saving, setSaving] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const syncFromLocation = useCallback(() => {
    setAddressLine(location.addressLine);
    setCity(location.city || 'Mumbai');
    setPincode(location.pincode || pincodeForCity(location.city, location.label));
  }, [location.addressLine, location.city, location.pincode, location.label]);

  useFocusEffect(
    useCallback(() => {
      if (pickingLocation.current) {
        pickingLocation.current = false;
      }
      syncFromLocation();
    }, [location.label, location.city, location.pincode, location.addressLine, syncFromLocation]),
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

  const onCityChange = (value: string) => {
    setCity(value);
    const nextPin = pincodeForCity(value, location.label);
    setPincode(nextPin);
    updateLocation({ city: value, pincode: nextPin });
  };

  const onPincodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setPincode(digits);
    updateLocation({ pincode: digits });
  };

  const onAddressLineChange = (value: string) => {
    setAddressLine(value);
    updateLocation({ addressLine: value });
  };

  const confirm = async () => {
    if (!service?.id) {
      showWarning('Service missing', 'Please go back and select a service again.');
      return;
    }

    const address = fullAddress();
    if (!address.trim()) {
      showWarning('Address required', 'Please select location on map or enter your address.');
      return;
    }
    if (!city.trim()) {
      showWarning('City required', 'Please enter your city.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      showWarning('Invalid pincode', 'Please enter a valid 6-digit pincode.');
      return;
    }
    if (!date || !slot) {
      showWarning('Schedule required', 'Please select date and time slot.');
      return;
    }

    const method = paymentMethod === 'upi' ? 'upi' : 'cod';
    await updateLocation({ city: city.trim(), pincode: pincode.trim(), addressLine: addressLine.trim() });

    setSaving(true);
    try {
      const res = await api.storeBooking({
        service_id: service.id,
        address,
        city: city.trim(),
        pincode: pincode.trim(),
        booking_date: date,
        time_slot: slot,
        payment_method: method,
      });
      setConfirmedBooking(res.booking);
      refreshActiveBooking();
    } catch (e) {
      showError('Booking failed', e instanceof Error ? e.message : 'Could not complete booking. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const viewBooking = () => {
    if (!confirmedBooking) return;
    const booking = confirmedBooking;
    setConfirmedBooking(null);
    nav.navigate('BookingDetail', { booking });
  };

  const viewAllBookings = () => {
    setConfirmedBooking(null);
    nav.navigate('Tabs', { screen: 'Bookings', params: { tab: 'Upcoming' } });
  };

  return (
    <>
    <KeyboardAwareScroll
      containerStyle={styles.root}
      contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}
      extraScrollOffset={72}
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
        <KeyboardTextInput
          style={styles.input}
          placeholder="Flat no., building, landmark (optional)"
          placeholderTextColor={BRAND.light}
          value={addressLine}
          onChangeText={onAddressLineChange}
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
            onChangeText={onCityChange}
            autoCapitalize="words"
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <TextInput
            style={styles.inputPlain}
            placeholder="Pincode"
            placeholderTextColor={BRAND.light}
            value={pincode}
            onChangeText={onPincodeChange}
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
        <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={[styles.btn, saving && styles.btnDisabled]}>
          <Ionicons name="checkmark-circle" size={20} color="#fff" />
          <Text style={styles.btnText}>{saving ? 'Booking...' : 'Confirm Booking'}</Text>
        </LinearGradient>
      </Pressable>
    </KeyboardAwareScroll>

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
  inputPlain: { flex: 1, fontSize: 15, color: BRAND.ink, paddingVertical: 2 },
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
  btnDisabled: { opacity: 0.75 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
