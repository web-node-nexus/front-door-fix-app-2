import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { proApi } from '../../api/pro';

type Props = {
  title?: string;
  showAvailability?: boolean;
  onAvailabilityChange?: (v: boolean) => void;
};

export default function ProHeader({ title, showAvailability, onAvailabilityChange }: Props) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user, logout, refreshProProfile } = useAuth();
  const available = user?.professional?.is_available ?? false;

  async function toggleAvailability(value: boolean) {
    try {
      await proApi.toggleAvailability(value);
      await refreshProProfile();
      onAvailabilityChange?.(value);
    } catch {
      // ignore
    }
  }

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          {title ? <Text style={styles.screenTitle}>{title}</Text> : null}
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.navigate('ProNotifications')}>
            <Ionicons name="notifications-outline" size={20} color={BRAND.ink} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => logout()}>
            <Ionicons name="log-out-outline" size={20} color={BRAND.ink} />
          </Pressable>
        </View>
      </View>
      {showAvailability ? (
        <View style={styles.availRow}>
          <View style={[styles.dot, available && styles.dotOn]} />
          <Text style={styles.availText}>{available ? 'Online — receiving jobs' : 'Offline'}</Text>
          <Switch
            value={available}
            onValueChange={toggleAvailability}
            trackColor={{ true: '#059669', false: '#D1D5DB' }}
            thumbColor="#fff"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, paddingBottom: 12, backgroundColor: '#F5F5F7' },
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleWrap: { flex: 1 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: BRAND.ink, marginBottom: 4 },
  greeting: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  name: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9CA3AF' },
  dotOn: { backgroundColor: '#059669' },
  availText: { flex: 1, fontSize: 13, fontWeight: '600', color: BRAND.ink },
});
