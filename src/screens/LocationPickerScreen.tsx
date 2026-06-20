import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import { useLocation } from '../context/LocationContext';

function formatAddress(place: Location.LocationGeocodedAddress): string {
  const parts = [
    place.name,
    place.street,
    place.district || place.subregion,
    place.city || place.region,
  ].filter(Boolean) as string[];

  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.some((u) => u.toLowerCase() === part.toLowerCase())) {
      unique.push(part);
    }
  }

  return unique.slice(0, 2).join(', ') || 'Selected location';
}

export default function LocationPickerScreen() {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const { location, setLocation } = useLocation();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState<Region>({
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });
  const [address, setAddress] = useState(location.label);
  const [resolving, setResolving] = useState(false);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  const resolveAddress = useCallback(async (lat: number, lng: number) => {
    setResolving(true);
    try {
      const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (results[0]) {
        setAddress(formatAddress(results[0]));
      } else {
        setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setResolving(false);
    }
  }, []);

  const onRegionChangeComplete = useCallback(
    (next: Region) => {
      setRegion(next);
      resolveAddress(next.latitude, next.longitude);
    },
    [resolveAddress],
  );

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

      const next: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };

      setRegion(next);
      mapRef.current?.animateToRegion(next, 500);
      await resolveAddress(next.latitude, next.longitude);
    } catch {
      Alert.alert('Location error', 'Could not get your current location. Try selecting on the map.');
    } finally {
      setLocating(false);
    }
  };

  const confirmLocation = async () => {
    setSaving(true);
    try {
      await setLocation({
        latitude: region.latitude,
        longitude: region.longitude,
        label: address,
      });
      nav.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      />

      <View style={styles.centerPin} pointerEvents="none">
        <Ionicons name="location" size={42} color={BRAND.primary} />
        <View style={styles.pinDot} />
      </View>

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.topTitleWrap}>
          <Text style={styles.topTitle}>Select Location</Text>
          <Text style={styles.topSub}>Move map to place the pin</Text>
        </View>
      </View>

      <Pressable
        style={[styles.gpsBtn, locating && styles.gpsBtnDisabled]}
        onPress={useCurrentLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color={BRAND.primary} size="small" />
        ) : (
          <Ionicons name="navigate" size={22} color={BRAND.primary} />
        )}
        <Text style={styles.gpsText}>Use current location</Text>
      </Pressable>

      <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.addressRow}>
          <View style={styles.addressIcon}>
            <Ionicons name="location" size={20} color={BRAND.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.addressLabel}>Deliver / service at</Text>
            {resolving ? (
              <ActivityIndicator color={BRAND.primary} style={{ alignSelf: 'flex-start', marginTop: 4 }} />
            ) : (
              <Text style={styles.addressText} numberOfLines={2}>
                {address}
              </Text>
            )}
          </View>
        </View>

        <Pressable onPress={confirmLocation} disabled={saving || resolving}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.confirmBtn}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmText}>Confirm Location</Text>
            )}
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  centerPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -21,
    marginTop: -42,
    alignItems: 'center',
  },
  pinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.primary,
    marginTop: -6,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  topTitleWrap: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  topTitle: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  topSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  gpsBtn: {
    position: 'absolute',
    right: 16,
    top: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  gpsBtnDisabled: { opacity: 0.7 },
  gpsText: { fontSize: 13, fontWeight: '600', color: BRAND.ink },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  addressRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressLabel: { fontSize: 12, color: BRAND.muted },
  addressText: { fontSize: 16, fontWeight: '700', color: BRAND.ink, marginTop: 2 },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
