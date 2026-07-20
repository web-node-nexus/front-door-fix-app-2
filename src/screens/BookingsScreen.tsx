import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api, Booking } from '../api/client';
import BookingCard from '../components/BookingCard';
import { BRAND } from '../config';
import { useActiveBooking } from '../context/ActiveBookingContext';
import { useLocale } from '../context/LocaleContext';
import { useScreenPadding } from '../hooks/useScreenPadding';
import { downloadBookingInvoice } from '../utils/invoiceDownload';

type TabKey = 'All' | 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';

const TAB_KEYS: { key: TabKey; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'All', labelKey: 'bookings.tab.all', icon: 'grid-outline' },
  { key: 'Upcoming', labelKey: 'bookings.tab.upcoming', icon: 'time-outline' },
  { key: 'Active', labelKey: 'bookings.tab.active', icon: 'sync-outline' },
  { key: 'Completed', labelKey: 'bookings.tab.completed', icon: 'checkmark-circle-outline' },
  { key: 'Cancelled', labelKey: 'bookings.tab.cancelled', icon: 'close-circle-outline' },
];

function getTab(b: Booking): TabKey {
  if (b.tab) return b.tab;
  if (b.status === 'cancelled') return 'Cancelled';
  if (b.status === 'completed') return 'Completed';
  if (b.status === 'in_progress') return 'Active';
  return 'Upcoming';
}

export default function BookingsScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLocale();
  const screenPad = useScreenPadding({ headerless: true, extraBottom: 100 });
  const [tab, setTab] = useState<TabKey>('All');
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { refresh: refreshActiveBooking } = useActiveBooking();

  useEffect(() => {
    const tabParam = route.params?.tab;
    if (tabParam === 'In Progress') setTab('Active');
    else if (tabParam && TAB_KEYS.some((x) => x.key === tabParam)) setTab(tabParam);
  }, [route.params?.tab]);

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      const data = await api.bookings();
      setBookings(data);
      setError(null);
      refreshActiveBooking();
    } catch (e) {
      setBookings([]);
      setError(e instanceof Error ? e.message : 'Could not load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    load();
    const timer = setInterval(() => load(true), 4000);
    return () => clearInterval(timer);
  }, [load]));

  const counts = useMemo(() => {
    const c = { All: bookings.length, Upcoming: 0, Active: 0, Completed: 0, Cancelled: 0 };
    bookings.forEach((b) => { c[getTab(b)] += 1; });
    return c;
  }, [bookings]);

  const filtered = useMemo(() => {
    let list = tab === 'All' ? bookings : bookings.filter((b) => getTab(b) === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.service?.toLowerCase().includes(q) ||
        b.booking_code?.toLowerCase().includes(q) ||
        b.address?.toLowerCase().includes(q),
      );
    }
    if (sortBy === 'amount') list = [...list].sort((a, b) => b.amount - a.amount);
    return list;
  }, [bookings, tab, search, sortBy]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={BRAND.primary} size="large" />
        <Text style={styles.loadingText}>{t('bookings.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: screenPad.paddingTop }]}>
        <View>
          <Text style={styles.pageTitle}>{t('bookings.title')}</Text>
          <Text style={styles.pageSub}>{t('bookings.subtitle')}</Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn} onPress={() => setSearchOpen(!searchOpen)}>
            <Ionicons name="search-outline" size={22} color={BRAND.ink} />
          </Pressable>
          <Pressable style={[styles.iconBtn, styles.filterBtn]} onPress={() => setFilterOpen(true)}>
            <Ionicons name="funnel-outline" size={22} color={BRAND.primary} />
          </Pressable>
        </View>
      </View>

      {searchOpen && (
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={BRAND.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('bookings.search')}
            placeholderTextColor={BRAND.light}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
      )}

      <View style={styles.tabsWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TAB_KEYS.map((item) => {
            const active = tab === item.key;
            const count = item.key !== 'All' ? counts[item.key] : 0;
            return (
              <Pressable key={item.key} onPress={() => setTab(item.key)}>
                {active ? (
                  <LinearGradient colors={[BRAND.primary, '#E91E63']} style={styles.tabActive}>
                    <Ionicons name={item.icon} size={14} color="#fff" />
                    <Text style={styles.tabTextActive}>{t(item.labelKey)}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.tab}>
                    <Ionicons name={item.icon} size={14} color={BRAND.muted} />
                    <Text style={styles.tabText}>{t(item.labelKey)}</Text>
                    {count > 0 && (
                      <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
                    )}
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={20} color="#B91C1C" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => load()}><Text style={styles.retryText}>{t('bookings.retry')}</Text></Pressable>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={[styles.list, { paddingBottom: screenPad.paddingBottom }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} tintColor={BRAND.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="calendar-outline" size={56} color={BRAND.light} />
            <Text style={styles.emptyTitle}>{error ? t('bookings.emptyError') : t('bookings.empty')}</Text>
            <Text style={styles.emptySub}>
              {error ? t('bookings.emptyErrorSub') : t('bookings.emptySub')}
            </Text>
            {!error && (
              <Pressable onPress={() => nav.navigate('Services')}>
                <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.bookCta}>
                  <Text style={styles.bookCtaText}>{t('bookings.bookCta')}</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => nav.navigate('BookingDetail', { booking: item })}
            onRefresh={() => load(true)}
            onTrack={(b) => nav.navigate('LiveTracking', { booking: b })}
            onReschedule={(b) => nav.navigate('RescheduleBooking', { booking: b })}
            onCancel={(b) => nav.navigate('CancelBooking', { booking: b })}
            onInvoice={(b) => downloadBookingInvoice(b.id)}
          />
        )}
      />

      <Modal visible={filterOpen} transparent animationType="slide" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('bookings.filterTitle')}</Text>
            <Text style={styles.modalLabel}>{t('bookings.sortBy')}</Text>
            {(['date', 'amount'] as const).map((s) => (
              <Pressable key={s} style={styles.filterOpt} onPress={() => setSortBy(s)}>
                <Ionicons name={sortBy === s ? 'radio-button-on' : 'radio-button-off'} size={20} color={BRAND.primary} />
                <Text style={styles.filterOptText}>{s === 'date' ? t('bookings.sortDate') : t('bookings.sortAmount')}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => setFilterOpen(false)}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.applyBtn}>
                <Text style={styles.applyText}>{t('bookings.apply')}</Text>
              </LinearGradient>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.surface, gap: 10 },
  loadingText: { color: BRAND.muted, fontWeight: '600' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingBottom: 14 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: BRAND.ink },
  pageSub: { fontSize: 13, color: BRAND.muted, marginTop: 4 },
  headerIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.canvas,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBtn: { borderColor: BRAND.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  searchInput: { flex: 1, fontSize: 15 },
  tabsWrap: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 6,
  },
  tabsRow: { gap: 6, paddingHorizontal: 2 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: BRAND.surface,
    marginRight: 4,
  },
  tabActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 4,
  },
  tabText: { fontSize: 12, fontWeight: '600', color: BRAND.muted },
  tabTextActive: { fontSize: 12, fontWeight: '800', color: '#fff' },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 12, color: '#B91C1C' },
  retryText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  list: { paddingHorizontal: 20 },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '800' },
  emptySub: { fontSize: 13, color: BRAND.muted, textAlign: 'center', paddingHorizontal: 24 },
  bookCta: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 },
  bookCtaText: { color: '#fff', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '700', color: BRAND.muted, marginBottom: 10 },
  filterOpt: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  filterOptText: { fontSize: 15, fontWeight: '600' },
  applyBtn: { marginTop: 16, borderRadius: 14, padding: 14, alignItems: 'center' },
  applyText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
