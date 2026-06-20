import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';

const TABS: { name: string; label: string; icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'Home', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'Bookings', label: 'My Bookings', icon: 'calendar-outline', iconFocused: 'calendar' },
  { name: 'Support', label: 'Support', icon: 'headset-outline', iconFocused: 'headset' },
  { name: 'Profile', label: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const openServices = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('Services' as never);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.bar}>
        {TABS.slice(0, 2).map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;
          const idx = state.routes.indexOf(route);
          const focused = state.index === idx;
          return (
            <Pressable key={tab.name} style={styles.tab} onPress={() => navigation.navigate(tab.name)}>
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={22} color={focused ? BRAND.primary : BRAND.light} />
              <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}

        <View style={styles.fabSlot}>
          <Pressable onPress={openServices}>
            <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.fab}>
              <Text style={styles.fabText}>Book{'\n'}Now</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {TABS.slice(2).map((tab) => {
          const route = state.routes.find((r) => r.name === tab.name);
          if (!route) return null;
          const idx = state.routes.indexOf(route);
          const focused = state.index === idx;
          return (
            <Pressable key={tab.name} style={styles.tab} onPress={() => navigation.navigate(tab.name)}>
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={22} color={focused ? BRAND.primary : BRAND.light} />
              <Text style={[styles.label, focused && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: BRAND.canvas, borderTopWidth: 1, borderTopColor: BRAND.border },
  bar: { flexDirection: 'row', alignItems: 'flex-end', paddingTop: 8, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingBottom: 4 },
  label: { fontSize: 10, fontWeight: '600', color: BRAND.light },
  labelActive: { color: BRAND.primary, fontWeight: '700' },
  fabSlot: { flex: 1, alignItems: 'center', marginTop: -28 },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fabText: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', lineHeight: 14 },
});
