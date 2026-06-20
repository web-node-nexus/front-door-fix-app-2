import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function SecurityScreen() {
  const pad = useScreenPadding();
  const { settings, updateSettings } = useProfile();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      {[
        { key: 'biometric' as const, title: 'Fingerprint Login', sub: 'Use fingerprint to sign in' },
        { key: 'faceId' as const, title: 'Face ID Login', sub: 'Use face recognition' },
        { key: 'twoFactor' as const, title: 'Two Factor Authentication', sub: 'Extra security for your account' },
      ].map((item) => (
        <View key={item.key} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.sub}>{item.sub}</Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={(v) => {
              updateSettings({ [item.key]: v });
              Alert.alert(item.title, v ? 'Enabled successfully' : 'Disabled');
            }}
            trackColor={{ true: BRAND.primary, false: BRAND.border }}
          />
        </View>
      ))}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.sub}>Update your account password</Text>
        </View>
        <Text style={styles.link} onPress={() => Alert.alert('Password', 'Password reset link sent to your email.')}>Change</Text>
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
