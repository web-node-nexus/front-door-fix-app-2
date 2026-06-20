import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import { useActiveBooking } from '../context/ActiveBookingContext';
import { currentRouteName, navigateToLiveTracking, navigationRef } from '../navigation/navigationRef';

const ICONS = {
  search: 'search-outline',
  bicycle: 'bicycle-outline',
  construct: 'construct-outline',
  radio: 'radio-outline',
  time: 'time-outline',
} as const;

const HIDDEN_ON = new Set(['LiveTracking', 'RateReview', 'Login']);

export default function ActiveBookingBanner() {
  const insets = useSafeAreaInsets();
  const { banner, loading } = useActiveBooking();
  const [routeName, setRouteName] = useState(currentRouteName);

  useEffect(() => {
    const sync = () => setRouteName(currentRouteName());
    sync();
    const unsub = navigationRef.addListener('state', sync);
    return unsub;
  }, []);

  if (!banner || HIDDEN_ON.has(routeName || '')) return null;

  return (
    <Pressable
      onPress={() => navigateToLiveTracking(banner.booking)}
      style={[styles.wrap, { paddingTop: insets.top + 4 }]}
    >
      <LinearGradient colors={[BRAND.primary, '#C026D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.bar}>
        <View style={styles.iconWrap}>
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Ionicons name={ICONS[banner.icon]} size={18} color="#fff" />
          )}
        </View>
        <View style={styles.textCol}>
          <View style={styles.titleRow}>
            <View style={styles.liveDot} />
            <Text style={styles.title} numberOfLines={1}>{banner.title}</Text>
          </View>
          <Text style={styles.subtitle} numberOfLines={1}>{banner.subtitle}</Text>
        </View>
        <View style={styles.trackBtn}>
          <Text style={styles.trackText}>Track</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: BRAND.primary,
    zIndex: 100,
    elevation: 8,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    borderWidth: 1,
    borderColor: '#fff',
  },
  title: { fontSize: 14, fontWeight: '800', color: '#fff', flex: 1 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2, fontWeight: '600' },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackText: { fontSize: 12, fontWeight: '800', color: '#fff' },
});
