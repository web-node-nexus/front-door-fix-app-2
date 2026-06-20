import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BRAND } from '../config';
import { QUICK_HELP, RECENT_TICKETS, SUPPORT_PHONE, SUPPORT_WHATSAPP } from '../data/support';
import { useScreenPadding } from '../hooks/useScreenPadding';

const ASSIST_OPTIONS = [
  { icon: 'chatbubble-ellipses', color: '#FCE7F3', title: 'Live Chat', sub: 'Chat with our support team', badge: 'Online', badgeIcon: 'ellipse', badgeColor: '#10B981' },
  { icon: 'logo-whatsapp', color: '#DCFCE7', title: 'WhatsApp', sub: 'Message us on WhatsApp', badge: 'Quick Reply', badgeIcon: 'flash', badgeColor: BRAND.primary },
  { icon: 'call', color: '#F3E8FF', title: 'Call Support', sub: 'Talk to our expert now', badge: '10 AM - 8 PM', badgeIcon: 'time-outline', badgeColor: BRAND.muted },
  { icon: 'ticket', color: '#FFEDD5', title: 'Raise a Ticket', sub: 'Report an issue or problem', badge: 'Track Status', badgeIcon: 'home-outline', badgeColor: BRAND.muted },
] as const;

const TRUST = [
  { icon: 'shield-checkmark-outline', label: '100% Safe & Secure' },
  { icon: 'time-outline', label: '24/7 Support' },
  { icon: 'person-outline', label: 'Verified Experts' },
  { icon: 'checkmark-circle-outline', label: 'Quick Resolution' },
] as const;

export default function SupportScreen() {
  const nav = useNavigation<any>();
  const screenPad = useScreenPadding({ headerless: true, extraBottom: 100 });
  const [search, setSearch] = useState('');
  const [faqModal, setFaqModal] = useState<{ title: string; answer: string } | null>(null);

  const filteredHelp = useMemo(() => {
    if (!search.trim()) return QUICK_HELP;
    const q = search.toLowerCase();
    return QUICK_HELP.filter((h) => h.title.toLowerCase().includes(q) || h.answer.toLowerCase().includes(q));
  }, [search]);

  const openChat = () => Linking.openURL(SUPPORT_WHATSAPP).catch(() => Alert.alert('Live Chat', 'Opening WhatsApp support...'));
  const openCall = () => Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => Alert.alert('Call', SUPPORT_PHONE));
  const openEmergency = () => {
    Alert.alert('Emergency Help', 'Connect to emergency support immediately?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Call Now', onPress: openCall },
    ]);
  };

  const handleAssist = (title: string) => {
    if (title === 'Live Chat') openChat();
    else if (title === 'WhatsApp') Linking.openURL(SUPPORT_WHATSAPP);
    else if (title === 'Call Support') openCall();
    else if (title === 'Raise a Ticket') nav.navigate('RaiseTicket');
  };

  const leftCol = filteredHelp.filter((_, i) => i % 2 === 0);
  const rightCol = filteredHelp.filter((_, i) => i % 2 === 1);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: screenPad.paddingTop, paddingBottom: screenPad.paddingBottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.pageTitle}>Support</Text>
            <Text style={styles.pageSub}>We are here to help you 24/7</Text>
          </View>
          <Pressable style={styles.safetyBtn} onPress={() => nav.navigate('Safety')}>
            <Ionicons name="shield-checkmark-outline" size={16} color={BRAND.primary} />
            <Text style={styles.safetyText}>Your Safety</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={BRAND.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help, issues or topics..."
            placeholderTextColor={BRAND.light}
            value={search}
            onChangeText={setSearch}
          />
          <Pressable onPress={() => Alert.alert('Scan QR', 'Point camera at your booking QR code to get instant help for that service.')}>
            <Ionicons name="qr-code-outline" size={22} color={BRAND.primary} />
          </Pressable>
        </View>

        {/* Assist cards */}
        <Text style={styles.secTitle}>How can we assist you today?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assistRow}>
          {ASSIST_OPTIONS.map((a) => (
            <Pressable key={a.title} style={styles.assistCard} onPress={() => handleAssist(a.title)}>
              <View style={[styles.assistIcon, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon as any} size={26} color={a.title === 'WhatsApp' ? '#25D366' : BRAND.primary} />
              </View>
              <Text style={styles.assistTitle}>{a.title}</Text>
              <Text style={styles.assistSub}>{a.sub}</Text>
              <View style={styles.assistBadge}>
                <Ionicons name={a.badgeIcon as any} size={10} color={a.badgeColor} />
                <Text style={styles.assistBadgeText}>{a.badge}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Quick Help */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Quick Help</Text>
          <Pressable onPress={() => nav.navigate('SupportFAQ')}>
            <Text style={styles.secLink}>View All FAQs ›</Text>
          </Pressable>
        </View>
        <View style={styles.helpGrid}>
          <View style={styles.helpCol}>
            {leftCol.map((h) => (
              <HelpItem key={h.id} item={h} onPress={() => setFaqModal({ title: h.title, answer: h.answer })} />
            ))}
          </View>
          <View style={styles.helpCol}>
            {rightCol.map((h) => (
              <HelpItem key={h.id} item={h} onPress={() => setFaqModal({ title: h.title, answer: h.answer })} />
            ))}
          </View>
        </View>

        {/* Hero Banner */}
        <LinearGradient colors={['#FCE7F3', '#FDF4FF', '#FFFFFF']} style={styles.heroBanner}>
          <View style={styles.heroLeft}>
            <View style={styles.heroAvatar}>
              <Ionicons name="headset" size={36} color={BRAND.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>We are here for you!</Text>
              <Text style={styles.heroSub}>Our support team is available 24/7 to assist you with any issue.</Text>
              <View style={styles.expertsRow}>
                <View style={styles.avatars}>
                  {['A', 'B', 'C'].map((l, i) => (
                    <View key={l} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                      <Text style={styles.miniAvatarText}>{l}</Text>
                    </View>
                  ))}
                  <View style={styles.plusBadge}><Text style={styles.plusText}>+12</Text></View>
                </View>
                <Text style={styles.expertsText}>20+ Experts are online</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={openChat}>
            <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>Start Live Chat</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Recent Issues */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Your Recent Issues</Text>
          <Pressable onPress={() => nav.navigate('SupportTickets')}>
            <Text style={styles.secLink}>View All Tickets</Text>
          </Pressable>
        </View>
        {RECENT_TICKETS.map((t) => (
          <Pressable key={t.id} style={styles.ticketCard} onPress={() => nav.navigate('SupportTicketDetail', { ticket: t })}>
            <View style={[styles.ticketIcon, { backgroundColor: t.status === 'resolved' ? '#D1FAE5' : BRAND.lavender }]}>
              <Ionicons name={t.icon === 'star' ? 'star' : 'checkmark-circle'} size={20} color={BRAND.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketId}>#{t.id}</Text>
                <View style={[styles.statusBadge, t.status === 'resolved' ? styles.resolved : styles.progress]}>
                  <Text style={[styles.statusText, t.status === 'resolved' ? styles.resolvedText : styles.progressText]}>
                    {t.status === 'resolved' ? 'Resolved' : 'In Progress'}
                  </Text>
                </View>
              </View>
              <Text style={styles.ticketTitle}>{t.title}</Text>
              <Text style={styles.ticketTime}>{t.time}</Text>
            </View>
            <Pressable style={styles.viewBtn} onPress={() => nav.navigate('SupportTicketDetail', { ticket: t })}>
              <Text style={styles.viewBtnText}>{t.status === 'resolved' ? 'View Details' : 'View Ticket'}</Text>
            </Pressable>
          </Pressable>
        ))}

        {/* Emergency */}
        <Text style={[styles.secTitle, { marginTop: 8 }]}>Emergency Help</Text>
        <View style={styles.emergencyCard}>
          <View style={styles.siren}><Text style={{ fontSize: 28 }}>🚨</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>Facing an emergency?</Text>
            <Text style={styles.emergencySub}>Get immediate help for urgent issues</Text>
          </View>
          <Pressable onPress={openEmergency}>
            <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.emergencyBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.emergencyBtnText}>Emergency{'\n'}Call</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Trust bar */}
        <View style={styles.trustBar}>
          {TRUST.map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Ionicons name={t.icon} size={18} color={BRAND.primary} />
              <Text style={styles.trustLabel}>{t.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAQ Modal */}
      <Modal visible={!!faqModal} transparent animationType="fade" onRequestClose={() => setFaqModal(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFaqModal(null)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{faqModal?.title}</Text>
            <Text style={styles.modalBody}>{faqModal?.answer}</Text>
            <Pressable style={styles.modalClose} onPress={() => setFaqModal(null)}>
              <Text style={styles.modalCloseText}>Got it</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function HelpItem({ item, onPress }: { item: typeof QUICK_HELP[number]; onPress: () => void }) {
  return (
    <Pressable style={styles.helpItem} onPress={onPress}>
      <Ionicons name={item.icon as any} size={16} color={BRAND.primary} />
      <Text style={styles.helpText} numberOfLines={2}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={14} color={BRAND.light} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: BRAND.ink },
  pageSub: { fontSize: 13, color: BRAND.primary, marginTop: 4, fontWeight: '600' },
  safetyBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: BRAND.primary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  safetyText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: BRAND.canvas, borderRadius: 16, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: BRAND.border, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 14, color: BRAND.ink },
  secTitle: { fontSize: 17, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 8 },
  secLink: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  assistRow: { gap: 12, paddingBottom: 8, marginBottom: 16 },
  assistCard: { width: 140, backgroundColor: BRAND.canvas, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: BRAND.border, alignItems: 'center' },
  assistIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  assistTitle: { fontSize: 13, fontWeight: '800', color: BRAND.ink },
  assistSub: { fontSize: 10, color: BRAND.muted, textAlign: 'center', marginTop: 4, lineHeight: 14 },
  assistBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: BRAND.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  assistBadgeText: { fontSize: 9, fontWeight: '700', color: BRAND.muted },
  helpGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  helpCol: { flex: 1, gap: 8 },
  helpItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: BRAND.canvas, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: BRAND.border, minHeight: 56 },
  helpText: { flex: 1, fontSize: 11, fontWeight: '600', color: BRAND.ink },
  heroBanner: { borderRadius: 24, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#F9A8D4' },
  heroLeft: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  heroAvatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: BRAND.border },
  heroTitle: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  heroSub: { fontSize: 11, color: BRAND.muted, marginTop: 4, lineHeight: 16 },
  expertsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  avatars: { flexDirection: 'row', alignItems: 'center' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  miniAvatarText: { fontSize: 9, fontWeight: '800', color: BRAND.primary },
  plusBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: BRAND.primary, alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  plusText: { fontSize: 8, fontWeight: '800', color: '#fff' },
  expertsText: { fontSize: 10, color: BRAND.muted, fontWeight: '600' },
  chatBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20 },
  chatBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  ticketCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 18, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  ticketIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  ticketTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ticketId: { fontSize: 12, fontWeight: '800', color: BRAND.ink },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  progress: { backgroundColor: '#F3E8FF' },
  resolved: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 9, fontWeight: '800' },
  progressText: { color: '#9333EA' },
  resolvedText: { color: '#059669' },
  ticketTitle: { fontSize: 12, fontWeight: '600', marginTop: 4, color: BRAND.ink },
  ticketTime: { fontSize: 10, color: BRAND.muted, marginTop: 2 },
  viewBtn: { backgroundColor: BRAND.surface, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: BRAND.border },
  viewBtnText: { fontSize: 9, fontWeight: '700', color: BRAND.primary },
  emergencyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFF5F7', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FECDD3' },
  siren: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center' },
  emergencyTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  emergencySub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  emergencyBtn: { alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 12, minWidth: 80 },
  emergencyBtnText: { color: '#fff', fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  trustBar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', backgroundColor: BRAND.surface, borderRadius: 16, padding: 14, gap: 8 },
  trustItem: { width: '48%', flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustLabel: { fontSize: 10, fontWeight: '600', color: BRAND.muted, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  modalBody: { fontSize: 14, color: BRAND.muted, marginTop: 12, lineHeight: 22 },
  modalClose: { marginTop: 20, backgroundColor: BRAND.primary, borderRadius: 14, padding: 14, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: '800' },
});
