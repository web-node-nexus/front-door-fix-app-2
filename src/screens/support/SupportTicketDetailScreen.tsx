import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { SupportTicket } from '../../data/support';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function SupportTicketDetailScreen() {
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const ticket: SupportTicket = route.params?.ticket;

  const steps = ticket?.status === 'resolved'
    ? ['Ticket raised', 'Under review', 'Issue resolved', 'Closed']
    : ['Ticket raised', 'Assigned to agent', 'In progress', 'Awaiting update'];

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <View style={styles.card}>
        <Text style={styles.id}>#{ticket?.id}</Text>
        <Text style={styles.title}>{ticket?.title}</Text>
        <Text style={styles.time}>Updated {ticket?.time}</Text>
      </View>

      <Text style={styles.section}>Ticket Timeline</Text>
      {steps.map((s, i) => (
        <View key={s} style={styles.step}>
          <View style={[styles.dot, i < steps.length - 1 && styles.dotActive]} />
          <Text style={styles.stepText}>{s}</Text>
        </View>
      ))}

      <View style={styles.note}>
        <Ionicons name="information-circle-outline" size={20} color={BRAND.primary} />
        <Text style={styles.noteText}>Our support team typically responds within 2 hours. You will receive updates via push notification.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BRAND.border, marginBottom: 20 },
  id: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  title: { fontSize: 18, fontWeight: '800', marginTop: 6 },
  time: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.border },
  dotActive: { backgroundColor: BRAND.primary },
  stepText: { fontSize: 14, fontWeight: '600' },
  note: { flexDirection: 'row', gap: 10, backgroundColor: BRAND.lavender, borderRadius: 16, padding: 14, marginTop: 12 },
  noteText: { flex: 1, fontSize: 13, color: BRAND.muted, lineHeight: 20 },
});
