import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { api, Category, Service } from '../api/client';
import AppCard from '../components/AppCard';
import FilterModal, { ServiceFilters } from '../components/FilterModal';
import HomeGridServiceCard from '../components/HomeGridServiceCard';
import HomeServiceCard from '../components/HomeServiceCard';
import { BRAND } from '../config';
import { useActiveBooking } from '../context/ActiveBookingContext';
import { useLocale } from '../context/LocaleContext';
import { useLocation } from '../context/LocationContext';
import { useNotifications } from '../context/NotificationContext';
import { OFFERS, REVIEWS, WHY_CHOOSE } from '../data/mock';
import { useScreenPadding } from '../hooks/useScreenPadding';
import { navigateToServices } from '../navigation/navigationRef';
import { categoryIcon, categoryImageUrl } from '../utils/serviceImagery';

export default function HomeScreen() {
  const nav = useNavigation<any>();
  const { location } = useLocation();
  const { t } = useLocale();
  const { refresh: refreshActiveBooking } = useActiveBooking();
  const { unreadCount, refresh: refreshNotifications } = useNotifications();
  const screenPad = useScreenPadding({ headerless: true });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [gridServices, setGridServices] = useState<Service[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ServiceFilters>({
    category: 'All',
    sort: 'popular',
    maxPrice: null,
  });

  const filterCategories = ['All', ...categories.map((c) => c.slug)];

  const goServices = useCallback((params?: { category?: string; sort?: string; maxPrice?: number | null }) => {
    navigateToServices(params);
  }, []);

  useEffect(() => {
    Promise.all([api.home(), api.services({ sort: 'popular' })])
      .then(([homeData, allServices]) => {
        setCategories(homeData.categories);
        setServices(homeData.featured_services);
        setGridServices(allServices.slice(0, 10));
      })
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshActiveBooking();
      refreshNotifications();
    }, [refreshActiveBooking, refreshNotifications]),
  );

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: screenPad.paddingTop, paddingBottom: screenPad.paddingBottom }]}>
        <ActivityIndicator color={BRAND.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: screenPad.paddingTop, paddingBottom: screenPad.paddingBottom }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.locLabel}>{t('home.yourLocation')}</Text>
          <Pressable style={styles.locRow} onPress={() => nav.navigate('LocationPicker')}>
            <Ionicons name="location" size={18} color={BRAND.primary} />
            <Text style={styles.locText} numberOfLines={1}>{location.label}</Text>
            <Ionicons name="chevron-down" size={18} color={BRAND.muted} />
          </Pressable>
        </View>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconBtn} onPress={() => nav.navigate('Notifications')}>
            <Ionicons name="notifications-outline" size={22} color={BRAND.ink} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => nav.navigate('Profile')}>
            <Ionicons name="person-outline" size={22} color={BRAND.ink} />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Pressable style={styles.searchBox} onPress={() => goServices()}>
          <Ionicons name="search" size={20} color={BRAND.muted} />
          <Text style={styles.searchPh}>{t('home.search')}</Text>
        </Pressable>
        <Pressable onPress={() => setFilterOpen(true)}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.filterBtn}>
            <Ionicons name="options" size={20} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      {/* Hero */}
      <Pressable onPress={() => goServices({ category: 'ac-repair' })}>
        <LinearGradient colors={[BRAND.primary, '#C026D3']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{t('home.summerDeal')}</Text></View>
          <Text style={styles.heroTitle}>{t('home.heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('home.heroSub')}</Text>
          <View style={styles.heroCta}><Text style={styles.heroCtaText}>{t('home.bookNow')}</Text></View>
          <Ionicons name="snow" size={90} color="rgba(255,255,255,0.12)" style={styles.heroIcon} />
        </LinearGradient>
      </Pressable>

      {/* Most Booked — website style */}
      <View style={styles.secHead}>
        <Text style={styles.secTitle}>{t('home.mostBooked')}</Text>
        <Pressable onPress={() => goServices()}><Text style={styles.secLink}>{t('home.seeAll')}</Text></Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mostBookedRow}>
        {services.map((s) => (
          <HomeServiceCard
            key={s.id}
            service={s}
            onPress={() => nav.navigate('BookService', { service: s })}
          />
        ))}
      </ScrollView>

      {/* Browse by Category — website style */}
      <View style={[styles.secHead, { marginTop: 24 }]}>
        <Text style={styles.secTitle}>{t('home.browseCategory')}</Text>
        <Pressable onPress={() => goServices()} hitSlop={8}>
          <Text style={styles.secLink}>{t('home.viewAll')}</Text>
        </Pressable>
      </View>
      <View style={styles.catGrid}>
        {categories.slice(0, 6).map((cat) => (
          <Pressable
            key={cat.id}
            style={({ pressed }) => [styles.catCard, pressed && styles.catCardPressed]}
            onPress={() => goServices({ category: cat.slug })}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Image
              source={{ uri: categoryImageUrl(cat.slug, cat.image) }}
              style={styles.catImage}
              resizeMode="cover"
              pointerEvents="none"
            />
            <View style={styles.catOverlay} pointerEvents="none" />
            <View style={styles.catInfo} pointerEvents="none">
              <Text style={styles.catEmoji}>{categoryIcon(cat.slug)}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Popular Services Grid */}
      <View style={[styles.secHead, { marginTop: 24 }]}>
        <Text style={styles.secTitle}>{t('home.popular')}</Text>
        <Pressable onPress={() => goServices()}><Text style={styles.secLink}>{t('home.seeAll')}</Text></Pressable>
      </View>
      <View style={styles.serviceGrid}>
        {gridServices.map((s) => (
          <HomeGridServiceCard
            key={s.id}
            service={s}
            onPress={() => nav.navigate('BookService', { service: s })}
          />
        ))}
      </View>

      {/* Why Choose Us */}
      <Text style={[styles.secTitle, { marginTop: 24, marginBottom: 12 }]}>{t('home.whyChoose')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 16 }}>
        {WHY_CHOOSE.map((w) => (
          <View key={w.title} style={styles.whyCard}>
            <View style={styles.whyIcon}><Ionicons name={w.icon as any} size={22} color={BRAND.primary} /></View>
            <Text style={styles.whyTitle}>{w.title}</Text>
            <Text style={styles.whySub}>{w.sub}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Offers */}
      <Text style={[styles.secTitle, { marginTop: 24, marginBottom: 12 }]}>{t('home.offers')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
        {OFFERS.map((o) => (
          <Pressable key={o.title} onPress={() => nav.navigate('Offers')}>
            <LinearGradient colors={['#FDF4FF', '#F3E8FF']} style={styles.offerCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.offerTag}>{o.title}</Text>
                <Text style={styles.offerSub}>{o.sub}</Text>
                <Text style={styles.offerCta}>{o.cta}</Text>
              </View>
              <Ionicons name="pricetag" size={36} color={BRAND.primary} />
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {/* Reviews */}
      <Text style={[styles.secTitle, { marginTop: 24, marginBottom: 12 }]}>{t('home.reviews')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
        {REVIEWS.map((r) => (
          <AppCard key={r.name} style={{ width: 260 }}>
            <View style={styles.reviewHead}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{r.name[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reviewName}>{r.name}</Text>
                <Text style={{ color: BRAND.gold, fontSize: 12 }}>{'★'.repeat(Math.floor(r.rating))}</Text>
              </View>
              <Text style={styles.reviewDate}>{r.date}</Text>
            </View>
            <Text style={styles.reviewText} numberOfLines={3}>{r.text}</Text>
          </AppCard>
        ))}
      </ScrollView>

      <FilterModal
        visible={filterOpen}
        categories={filterCategories}
        initial={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setFilters(f);
          setFilterOpen(false);
          goServices({
            category: f.category === 'All' ? undefined : f.category,
            sort: f.sort,
            maxPrice: f.maxPrice,
          });
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1, marginRight: 12 },
  locLabel: { fontSize: 12, color: BRAND.muted },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, maxWidth: '100%' },
  locText: { fontSize: 16, fontWeight: '700', color: BRAND.ink, flexShrink: 1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { padding: 10, backgroundColor: BRAND.canvas, borderRadius: 14, borderWidth: 1, borderColor: BRAND.border, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: BRAND.canvas, borderRadius: 16, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: BRAND.border },
  searchPh: { color: BRAND.light, fontSize: 15 },
  filterBtn: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 20, padding: 20, height: 160, overflow: 'hidden', marginBottom: 24 },
  heroBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  heroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 },
  heroSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  heroCta: { alignSelf: 'flex-start', backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginTop: 12 },
  heroCtaText: { color: BRAND.primary, fontWeight: '700' },
  heroIcon: { position: 'absolute', right: -10, bottom: -10 },
  secHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  secTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  secLink: { color: BRAND.primary, fontWeight: '600', fontSize: 14 },
  mostBookedRow: { paddingRight: 4, paddingBottom: 2 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: {
    width: (Dimensions.get('window').width - 52) / 2,
    height: 120,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: BRAND.ink,
  },
  catCardPressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  catImage: { width: '100%', height: '100%' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26,26,46,0.45)' },
  catInfo: { position: 'absolute', bottom: 12, left: 12, right: 12 },
  catEmoji: { fontSize: 20, marginBottom: 4 },
  catName: { color: '#fff', fontSize: 15, fontWeight: '800' },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  whyCard: { width: 130, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
  whyIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  whyTitle: { fontSize: 12, fontWeight: '700', color: BRAND.ink },
  whySub: { fontSize: 10, color: BRAND.muted, marginTop: 2 },
  offerCard: { width: 260, borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF' },
  offerTag: { fontSize: 12, fontWeight: '700', color: BRAND.primary },
  offerSub: { fontSize: 14, fontWeight: '700', color: BRAND.ink, marginTop: 4 },
  offerCta: { fontSize: 13, fontWeight: '600', color: BRAND.primary, marginTop: 8 },
  reviewHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '700', color: BRAND.primary },
  reviewName: { fontWeight: '700', fontSize: 14 },
  reviewDate: { fontSize: 11, color: BRAND.muted },
  reviewText: { fontSize: 13, color: BRAND.muted, lineHeight: 20 },
});
