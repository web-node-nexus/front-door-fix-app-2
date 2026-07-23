import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import { pincodeForCity, useLocation } from '../context/LocationContext';

function formatAddress(place: Location.LocationGeocodedAddress): {
  label: string;
  city: string;
  pincode: string;
  addressLine: string;
} {
  const city = place.city || place.subregion || place.district || place.region || 'Mumbai';
  const street = [place.name, place.street].filter(Boolean).join(', ');
  const area = street || place.district || '';
  const labelParts = [area, city].filter(Boolean);
  const unique: string[] = [];
  for (const part of labelParts) {
    if (!unique.some((u) => u.toLowerCase() === part.toLowerCase())) unique.push(part);
  }
  const label = unique.join(', ') || city;
  const pincode = place.postalCode?.trim() || pincodeForCity(city, label);
  return {
    label,
    city,
    pincode,
    addressLine: street || area || label,
  };
}

/**
 * Location picker without native Google Maps.
 * Android release builds crash if MapView is used without a Maps API key.
 */
export default function LocationPickerScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { location, setLocation } = useLocation();

  const [latitude, setLatitude] = useState(location.latitude);
  const [longitude, setLongitude] = useState(location.longitude);
  const [address, setAddress] = useState(location.label);
  const [addressLine, setAddressLine] = useState(location.addressLine || location.label);
  const [city, setCity] = useState(location.city);
  const [pincode, setPincode] = useState(location.pincode);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const useCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow location access to use your current location.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setLatitude(lat);
      setLongitude(lng);

      try {
        const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (results[0]) {
          const parsed = formatAddress(results[0]);
          setAddress(parsed.label);
          setAddressLine(parsed.addressLine);
          setCity(parsed.city);
          setPincode(parsed.pincode);
        } else {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
      } catch {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    } catch {
      Alert.alert('Location error', 'Could not get your current location. Enter address manually.');
    } finally {
      setLocating(false);
    }
  };

  const confirmLocation = async () => {
    const label = address.trim() || addressLine.trim();
    if (!label) {
      Alert.alert('Address required', 'Please use GPS or enter your service address.');
      return;
    }
    if (!city.trim()) {
      Alert.alert('City required', 'Please enter your city.');
      return;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      Alert.alert('Pincode required', 'Please enter a valid 6-digit pincode.');
      return;
    }

    setSaving(true);
    try {
      await setLocation({
        latitude,
        longitude,
        label,
        city: city.trim(),
        pincode: pincode.trim(),
        addressLine: addressLine.trim() || label,
      });
      nav.goBack();
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={styles.topTitle}>Select Location</Text>
          <Text style={styles.topSub}>Use GPS or enter address manually</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons name="location" size={36} color={BRAND.primary} />
            </View>
            <Text style={styles.heroTitle}>Service location</Text>
            <Text style={styles.heroSub}>
              Professionals will arrive at the address you confirm here.
            </Text>
          </View>

          <Pressable
            style={[styles.gpsBtn, locating && styles.gpsBtnDisabled]}
            onPress={useCurrentLocation}
            disabled={locating}
          >
            {locating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.gpsText}>Use current GPS location</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.fieldLabel}>Area / landmark</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Andheri West, near metro"
            placeholderTextColor={BRAND.light}
          />

          <Text style={styles.fieldLabel}>Full address</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={addressLine}
            onChangeText={setAddressLine}
            placeholder="Building, street, area"
            placeholderTextColor={BRAND.light}
            multiline
          />

          <Text style={styles.fieldLabel}>City</Text>
          <TextInput
            style={styles.input}
            value={city}
            onChangeText={setCity}
            onBlur={() => {
              const trimmed = city.trim();
              if (trimmed && !/^\d{6}$/.test(pincode.trim())) {
                setPincode(pincodeForCity(trimmed));
              }
            }}
            placeholder="Type city, e.g. Pune"
            placeholderTextColor={BRAND.light}
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Text style={styles.fieldLabel}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={pincode}
            onChangeText={(v) => setPincode(v.replace(/\D/g, '').slice(0, 6))}
            placeholder="400001"
            placeholderTextColor={BRAND.light}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Text style={styles.chipHint}>Quick select</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cityChips}>
            {[
              { city: 'Mumbai', pincode: '400001' },
              { city: 'Delhi', pincode: '110001' },
              { city: 'Bangalore', pincode: '560001' },
              { city: 'Pune', pincode: '411001' },
              { city: 'Hyderabad', pincode: '500001' },
            ].map((item) => {
              const active = city.trim().toLowerCase() === item.city.toLowerCase();
              return (
                <Pressable
                  key={item.city}
                  style={[styles.cityChip, active && styles.cityChipActive]}
                  onPress={() => {
                    setCity(item.city);
                    setPincode(item.pincode);
                  }}
                >
                  <Text style={[styles.cityChipText, active && styles.cityChipTextActive]}>{item.city}</Text>
                  <Text style={[styles.cityChipPin, active && styles.cityChipTextActive]}>{item.pincode}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.coords}>
            Pin: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </Text>

          <Pressable onPress={confirmLocation} disabled={saving || locating}>
            <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.confirmBtn}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmText}>Confirm Location</Text>
              )}
            </LinearGradient>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  topTitleWrap: { flex: 1 },
  topTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  topSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  content: { paddingHorizontal: 20, paddingTop: 8 },
  hero: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  heroSub: { fontSize: 13, color: BRAND.muted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  gpsBtn: {
    height: 52,
    borderRadius: 16,
    backgroundColor: BRAND.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  gpsBtnDisabled: { opacity: 0.7 },
  gpsText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: BRAND.muted, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: BRAND.ink,
    marginBottom: 14,
  },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  chipHint: { fontSize: 11, fontWeight: '700', color: BRAND.muted, marginBottom: 8 },
  cityChips: { gap: 8, marginBottom: 14 },
  cityChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 96,
  },
  cityChipActive: { backgroundColor: BRAND.lavender, borderColor: BRAND.primary },
  cityChipText: { fontSize: 13, fontWeight: '800', color: BRAND.ink },
  cityChipPin: { fontSize: 11, fontWeight: '600', color: BRAND.muted, marginTop: 2 },
  cityChipTextActive: { color: BRAND.primary },
  coords: { fontSize: 11, color: BRAND.light, marginBottom: 16, fontWeight: '600' },
  confirmBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
