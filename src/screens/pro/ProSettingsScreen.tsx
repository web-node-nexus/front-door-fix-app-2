import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { proApi } from '../../api/pro';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function ProSettingsScreen() {
  const { user, refreshProProfile } = useAuth();
  const [available, setAvailable] = useState(user?.professional?.is_available ?? false);

  async function toggle(v: boolean) {
    setAvailable(v);
    try {
      await proApi.toggleAvailability(v);
      await refreshProProfile();
    } catch (e) {
      setAvailable(!v);
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Online status</Text>
        <Text style={styles.sub}>When online, you can receive new job requests in your area.</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>{available ? 'Online' : 'Offline'}</Text>
          <Switch value={available} onValueChange={toggle} trackColor={{ true: '#059669' }} />
        </View>
      </View>

      <Pressable style={styles.card} onPress={() => Linking.openURL('mailto:support@frontdoor.in')}>
        <Text style={styles.title}>Contact support</Text>
        <Text style={styles.sub}>support@frontdoor.in</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  sub: { fontSize: 13, color: BRAND.muted, marginTop: 6, lineHeight: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  rowLabel: { fontWeight: '700', color: BRAND.ink },
});
