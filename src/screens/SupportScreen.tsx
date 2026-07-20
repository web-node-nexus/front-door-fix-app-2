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
import { useLocale } from '../context/LocaleContext';
import { QUICK_HELP, RECENT_TICKETS, SUPPORT_PHONE, SUPPORT_WHATSAPP } from '../data/support';
import { useScreenPadding } from '../hooks/useScreenPadding';

const ASSIST_OPTIONS = [
  { icon: 'chatbubble-ellipses', color: '#FCE7F3', id: 'live', titleKey: 'support.liveChat', subKey: 'support.liveChatSub', badgeKey: 'support.online', badgeIcon: 'ellipse', badgeColor: '#10B981' },
  { icon: 'logo-whatsapp', color: '#DCFCE7', id: 'wa', titleKey: 'support.whatsapp', subKey: 'support.whatsappSub', badgeKey: 'support.quickReply', badgeIcon: 'flash', badgeColor: BRAND.primary },
  { icon: 'call', color: '#F3E8FF', id: 'call', titleKey: 'support.call', subKey: 'support.callSub', badgeKey: 'support.callHours', badgeIcon: 'time-outline', badgeColor: BRAND.muted },
  { icon: 'ticket', color: '#FFEDD5', id: 'ticket', titleKey: 'support.ticket', subKey: 'support.ticketSub', badgeKey: 'support.trackStatus', badgeIcon: 'home-outline', badgeColor: BRAND.muted },
] as const;

const TRUST = [
  { icon: 'shield-checkmark-outline' as const, labelKey: 'support.trust.safe' },
  { icon: 'time-outline' as const, labelKey: 'support.trust.247' },
  { icon: 'person-outline' as const, labelKey: 'support.trust.experts' },
  { icon: 'checkmark-circle-outline' as const, labelKey: 'support.trust.quick' },
];

export default function SupportScreen() {
  const nav = useNavigation<any>();
  const { t } = useLocale();
  const screenPad = useScreenPadding({ headerless: true, extraBottom: 100 });
  const [search, setSearch] = useState('');
  const [faqModal, setFaqModal] = useState<{ title: string; answer: string } | null>(null);

  const filteredHelp = useMemo(() => {
    if (!search.trim()) return QUICK_HELP;
    const q = search.toLowerCase();
    return QUICK_HELP.filter((h) => h.title.toLowerCase().includes(q) || h.answer.toLowerCase().includes(q));
  }, [search]);

  const openChat = () => Linking.openURL(SUPPORT_WHATSAPP).catch(() => Alert.alert(t('support.liveChat'), 'WhatsApp...'));
  const openCall = () => Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => Alert.alert(t('support.call'), SUPPORT_PHONE));
  const openEmergency = () => {
    Alert.alert(t('support.emergency'), t('support.emergencyConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('support.callNow'), onPress: openCall },
    ]);
  };

  const handleAssist = (id: string) => {
    if (id === 'live') openChat();
    else if (id === 'wa') Linking.openURL(SUPPORT_WHATSAPP);
    else if (id === 'call') openCall();
    else if (id === 'ticket') nav.navigate('RaiseTicket');
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
            <Text style={styles.pageTitle}>{t('support.title')}</Text>
            <Text style={styles.pageSub}>{t('support.subtitle')}</Text>
          </View>
          <Pressable style={styles.safetyBtn} onPress={() => nav.navigate('Safety')}>
            <Ionicons name="shield-checkmark-outline" size={16} color={BRAND.primary} />
            <Text style={styles.safetyText}>{t('support.safety')}</Text>
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={BRAND.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('support.search')}
            placeholderTextColor={BRAND.light}
            value={search}
            onChangeText={setSearch}
          />
          <Pressable onPress={() => nav.navigate('ScanQr')} hitSlop={8}>
            <Ionicons name="qr-code-outline" size={22} color={BRAND.primary} />
          </Pressable>
        </View>

        {/* Assist cards */}
        <Text style={styles.secTitle}>{t('support.assist')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.assistRow}>
          {ASSIST_OPTIONS.map((a) => (
            <Pressable key={a.id} style={styles.assistCard} onPress={() => handleAssist(a.id)}>
              <View style={[styles.assistIcon, { backgroundColor: a.color }]}>
                <Ionicons name={a.icon as any} size={26} color={a.id === 'wa' ? '#25D366' : BRAND.primary} />
              </View>
              <Text style={styles.assistTitle}>{t(a.titleKey)}</Text>
              <Text style={styles.assistSub}>{t(a.subKey)}</Text>
              <View style={styles.assistBadge}>
                <Ionicons name={a.badgeIcon as any} size={10} color={a.badgeColor} />
                <Text style={styles.assistBadgeText}>{t(a.badgeKey)}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Quick Help */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>{t('support.quickHelp')}</Text>
          <Pressable onPress={() => nav.navigate('SupportFAQ')}>
            <Text style={styles.secLink}>{t('support.viewFaqs')}</Text>
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
              <Text style={styles.heroTitle}>{t('support.heroTitle')}</Text>
              <Text style={styles.heroSub}>{t('support.heroSub')}</Text>
              <View style={styles.expertsRow}>
                <View style={styles.avatars}>
                  {['A', 'B', 'C'].map((l, i) => (
                    <View key={l} style={[styles.miniAvatar, { marginLeft: i > 0 ? -8 : 0 }]}>
                      <Text style={styles.miniAvatarText}>{l}</Text>
                    </View>
                  ))}
                  <View style={styles.plusBadge}><Text style={styles.plusText}>+12</Text></View>
                </View>
                <Text style={styles.expertsText}>{t('support.expertsOnline')}</Text>
              </View>
            </View>
          </View>
          <Pressable onPress={openChat}>
            <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.chatBtn}>
              <Text style={styles.chatBtnText}>{t('support.startChat')}</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* Recent Issues */}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>{t('support.recentIssues')}</Text>
          <Pressable onPress={() => nav.navigate('SupportTickets')}>
            <Text style={styles.secLink}>{t('support.viewTickets')}</Text>
          </Pressable>
        </View>
        {RECENT_TICKETS.map((ticket) => (
          <Pressable key={ticket.id} style={styles.ticketCard} onPress={() => nav.navigate('SupportTicketDetail', { ticket })}>
            <View style={[styles.ticketIcon, { backgroundColor: ticket.status === 'resolved' ? '#D1FAE5' : BRAND.lavender }]}>
              <Ionicons name={ticket.icon === 'star' ? 'star' : 'checkmark-circle'} size={20} color={BRAND.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.ticketTop}>
                <Text style={styles.ticketId}>#{ticket.id}</Text>
                <View style={[styles.statusBadge, ticket.status === 'resolved' ? styles.resolved : styles.progress]}>
                  <Text style={[styles.statusText, ticket.status === 'resolved' ? styles.resolvedText : styles.progressText]}>
                    {ticket.status === 'resolved' ? t('support.resolved') : t('support.inProgress')}
                  </Text>
                </View>
              </View>
              <Text style={styles.ticketTitle}>{ticket.title}</Text>
              <Text style={styles.ticketTime}>{ticket.time}</Text>
            </View>
            <Pressable style={styles.viewBtn} onPress={() => nav.navigate('SupportTicketDetail', { ticket })}>
              <Text style={styles.viewBtnText}>{ticket.status === 'resolved' ? t('support.viewDetails') : t('support.viewTicket')}</Text>
            </Pressable>
          </Pressable>
        ))}

        {/* Emergency */}
        <Text style={[styles.secTitle, { marginTop: 8 }]}>{t('support.emergency')}</Text>
        <View style={styles.emergencyCard}>
          <View style={styles.siren}><Text style={{ fontSize: 28 }}>🚨</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>{t('support.emergencyTitle')}</Text>
            <Text style={styles.emergencySub}>{t('support.emergencySub')}</Text>
          </View>
          <Pressable onPress={openEmergency}>
            <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.emergencyBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.emergencyBtnText}>{t('support.emergencyCall')}</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Trust bar */}
        <View style={styles.trustBar}>
          {TRUST.map((item) => (
            <View key={item.labelKey} style={styles.trustItem}>
              <Ionicons name={item.icon} size={18} color={BRAND.primary} />
              <Text style={styles.trustLabel}>{t(item.labelKey)}</Text>
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
              <Text style={styles.modalCloseText}>{t('common.ok')}</Text>
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
