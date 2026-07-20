import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  upi: 'phone-portrait-outline',
  card: 'card-outline',
  wallet: 'wallet-outline',
};

export default function PaymentMethodsScreen() {
  const pad = useScreenPadding();
  const { paymentMethods } = useProfile();
  const { showSuccess } = useFeedback();
  const [active, setActive] = useState<Record<string, boolean>>(
    Object.fromEntries(paymentMethods.map((p) => [p.id, p.active])),
  );

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      {paymentMethods.map((p) => (
        <View key={p.id} style={styles.card}>
          <View style={styles.icon}><Ionicons name={ICONS[p.type]} size={22} color={BRAND.primary} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{p.label}</Text>
            <Text style={styles.sub}>{p.detail}</Text>
          </View>
          <Switch
            value={active[p.id]}
            onValueChange={(v) => setActive((prev) => ({ ...prev, [p.id]: v }))}
            trackColor={{ true: BRAND.primary, false: BRAND.border }}
          />
        </View>
      ))}
      <Pressable
        style={styles.manage}
        onPress={() => {
          const enabled = paymentMethods.filter((p) => active[p.id]).map((p) => p.label);
          showSuccess(
            'Preferences saved',
            enabled.length
              ? `Active methods: ${enabled.join(', ')}`
              : 'No payment methods are currently active.',
          );
        }}
      >
        <Text style={styles.manageText}>Save Payment Preferences</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '800', fontSize: 15 },
  sub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  manage: { marginTop: 16, alignItems: 'center', padding: 14 },
  manageText: { color: BRAND.primary, fontWeight: '800', fontSize: 15 },
});
