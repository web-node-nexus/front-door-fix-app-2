import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../config';
import { useLocale } from '../../context/LocaleContext';
import { RECENT_TICKETS, SUPPORT_PHONE } from '../../data/support';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const STATUS_COLORS = {
  in_progress: { bg: '#F3E8FF', text: '#9333EA', label: 'In Progress' },
  resolved: { bg: '#D1FAE5', text: '#059669', label: 'Resolved' },
  open: { bg: '#FFEDD5', text: '#EA580C', label: 'Open' },
};

export default function SupportTicketsScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useLocale();
  const pad = useScreenPadding({ extraTop: 12, extraBottom: 32 });

  const openCall = () =>
    Linking.openURL(`tel:${SUPPORT_PHONE}`).catch(() => Alert.alert(t('support.call'), SUPPORT_PHONE));

  const openEmergency = () => {
    Alert.alert(t('support.emergency'), t('support.emergencyConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('support.callNow'), onPress: openCall },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Your Tickets</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={RECENT_TICKETS}
        keyExtractor={(ticket) => ticket.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: pad.paddingTop, paddingBottom: pad.paddingBottom },
        ]}
        renderItem={({ item }) => {
          const st = STATUS_COLORS[item.status];
          return (
            <Pressable style={styles.card} onPress={() => nav.navigate('SupportTicketDetail', { ticket: item })}>
              <View style={styles.icon}>
                <Ionicons name={item.icon === 'star' ? 'star' : 'checkmark-circle'} size={20} color={BRAND.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.topRow}>
                  <Text style={styles.id}>#{item.id}</Text>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={BRAND.light} />
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.emergencyWrap}>
            <Text style={styles.secTitle}>{t('support.emergency')}</Text>
            <View style={styles.emergencyCard}>
              <View style={styles.siren}>
                <Text style={{ fontSize: 28 }}>🚨</Text>
              </View>
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
          </View>
        }
      />
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
  list: { paddingHorizontal: 20, backgroundColor: BRAND.surface, flexGrow: 1 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  id: { fontWeight: '800', fontSize: 13, color: BRAND.ink },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '600', marginTop: 4, color: BRAND.ink },
  time: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  emergencyWrap: { marginTop: 16 },
  secTitle: { fontSize: 17, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF5F7',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  siren: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  emergencySub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  emergencyBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    padding: 12,
    minWidth: 80,
  },
  emergencyBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },
});
