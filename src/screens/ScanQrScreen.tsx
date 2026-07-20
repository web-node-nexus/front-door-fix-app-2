import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { BRAND } from '../config';

function parseBookingCode(raw: string): string | null {
  const match = raw.toUpperCase().match(/BK[0-9]{4,}/);
  return match ? match[0] : null;
}

export default function ScanQrScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const handled = useRef(false);

  const onBarcodeScanned = useCallback(async ({ data }: { data: string }) => {
    if (!scanning || loading || handled.current) return;
    const code = parseBookingCode(data);
    if (!code) {
      Alert.alert('Invalid QR', 'Please scan a valid Front Door booking QR code.');
      return;
    }

    handled.current = true;
    setScanning(false);
    setLoading(true);

    try {
      const bookings = await api.bookings();
      const booking = bookings.find(
        (b) => b.booking_code?.toUpperCase() === code || b.booking_code?.toUpperCase() === code.replace(/^#/, ''),
      );

      if (!booking) {
        Alert.alert('Booking not found', `No booking found for ${code} on your account.`);
        handled.current = false;
        setScanning(true);
        return;
      }

      nav.replace('BookingDetail', { booking });
    } catch (e) {
      Alert.alert('Scan failed', e instanceof Error ? e.message : 'Could not load booking.');
      handled.current = false;
      setScanning(true);
    } finally {
      setLoading(false);
    }
  }, [loading, nav, scanning]);

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND.primary} size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.center, { padding: 24 }]}>
        <Ionicons name="camera-outline" size={48} color={BRAND.primary} />
        <Text style={styles.permTitle}>Camera permission needed</Text>
        <Text style={styles.permSub}>Allow camera access to scan booking QR codes.</Text>
        <Pressable style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Allow Camera</Text>
        </Pressable>
        <Pressable onPress={() => nav.goBack()} style={{ marginTop: 16 }}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanning ? onBarcodeScanned : undefined}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Scan Booking QR</Text>
      </View>

      <View style={styles.frameWrap} pointerEvents="none">
        <View style={styles.frame} />
        <Text style={styles.hint}>Point camera at your booking QR code</Text>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Finding booking...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.surface },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  frameWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: 240,
    height: 240,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  hint: {
    marginTop: 20,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: { color: '#fff', fontWeight: '700' },
  permTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginTop: 16 },
  permSub: { fontSize: 14, color: BRAND.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  permBtn: {
    marginTop: 20,
    backgroundColor: BRAND.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permBtnText: { color: '#fff', fontWeight: '800' },
  backLink: { color: BRAND.primary, fontWeight: '700' },
});
