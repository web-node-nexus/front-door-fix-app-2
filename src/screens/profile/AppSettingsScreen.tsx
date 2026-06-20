import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function AppSettingsScreen() {
  const pad = useScreenPadding();
  const { settings, updateSettings } = useProfile();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      {[
        { key: 'pushNotifications' as const, title: 'Push Notifications', sub: 'Booking updates & offers' },
        { key: 'smsAlerts' as const, title: 'SMS Alerts', sub: 'OTP and reminders via SMS' },
      ].map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={(v) => updateSettings({ [item.key]: v })}
            trackColor={{ true: BRAND.primary, false: BRAND.border }}
          />
        </View>
      ))}
      <View style={styles.row}>
        <View style={{ flex: 1 }}><Text style={styles.title}>Language</Text><Text style={styles.sub}>English</Text></View>
        <Text style={styles.link} onPress={() => Alert.alert('Language', 'English selected')}>Change</Text>
      </View>
      <View style={styles.row}>
        <View style={{ flex: 1 }}><Text style={styles.title}>App Version</Text><Text style={styles.sub}>Front Door v2.0.0</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  title: { fontWeight: '800', fontSize: 15 },
  sub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  link: { color: BRAND.primary, fontWeight: '800' },
});
