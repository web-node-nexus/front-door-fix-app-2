import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../config';
import { SupportTicket } from '../../data/support';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function SupportTicketDetailScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding({ extraTop: 12, extraBottom: 32 });
  const ticket: SupportTicket = route.params?.ticket;

  const steps = ticket?.status === 'resolved'
    ? ['Ticket raised', 'Under review', 'Issue resolved', 'Closed']
    : ['Ticket raised', 'Assigned to agent', 'In progress', 'Awaiting update'];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Ticket Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: pad.paddingTop, paddingBottom: pad.paddingBottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
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
          <Text style={styles.noteText}>
            Our support team typically responds within 2 hours. You will receive updates via push notification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: BRAND.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: BRAND.ink,
  },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: 20, backgroundColor: BRAND.surface, flexGrow: 1 },
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 20,
  },
  id: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  title: { fontSize: 18, fontWeight: '800', marginTop: 6, color: BRAND.ink },
  time: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  section: { fontSize: 16, fontWeight: '800', marginBottom: 12, color: BRAND.ink },
  step: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: BRAND.border },
  dotActive: { backgroundColor: BRAND.primary },
  stepText: { fontSize: 14, fontWeight: '600', color: BRAND.ink },
  note: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: BRAND.lavender,
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
  },
  noteText: { flex: 1, fontSize: 13, color: BRAND.muted, lineHeight: 20 },
});
