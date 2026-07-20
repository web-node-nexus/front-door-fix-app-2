import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProHeader from '../../components/pro/ProHeader';
import { BRAND } from '../../config';

const MENU = [
  { icon: 'card-outline' as const, label: 'Payment collection', screen: 'ProCompletionList' },
  { icon: 'star-outline' as const, label: 'Reviews', screen: 'ProReviews' },
  { icon: 'notifications-outline' as const, label: 'Notifications', screen: 'ProNotifications' },
  { icon: 'person-outline' as const, label: 'Profile', screen: 'ProProfile' },
  { icon: 'settings-outline' as const, label: 'Settings', screen: 'ProSettings' },
];

export default function ProMoreScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.root}>
      <ProHeader title="More" />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
        {MENU.map((item) => (
          <Pressable key={item.screen} style={styles.row} onPress={() => navigation.navigate(item.screen)}>
            <Ionicons name={item.icon} size={22} color="#1A1A2E" />
            <Text style={styles.label}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={BRAND.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  scroll: { paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  label: { flex: 1, fontSize: 16, fontWeight: '700', color: BRAND.ink },
});
