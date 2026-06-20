import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Category, Service } from '../api/client';
import ServiceCard from '../components/ServiceCard';
import ServiceCartBar from '../components/ServiceCartBar';
import ServiceDetailSheet from '../components/ServiceDetailSheet';
import { SortOption } from '../components/FilterModal';
import { BRAND } from '../config';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { useScreenPadding } from '../hooks/useScreenPadding';
import { categoryIcon } from '../utils/serviceImagery';

const SORT_OPTIONS: { id: SortOption | 'name'; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'name', label: 'Name' },
  { id: 'price_asc', label: 'Low Price' },
  { id: 'price_desc', label: 'High Price' },
];

function categoryDisplayName(name: string): string {
  if (name === 'All Services') return 'All';
  return name;
}

export default function ServicesScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const screenPad = useScreenPadding({ extraBottom: 24 });
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cat, setCat] = useState<string | null>(route.params?.category === 'All' ? null : route.params?.category || null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption | 'name'>(route.params?.sort || 'popular');
  const maxPrice: number | null = route.params?.maxPrice ?? null;
  const { favorites } = useProfile();
  const { itemCount } = useCart();
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: { category?: string; q?: string; sort?: string } = { sort };
    if (cat) params.category = cat;
    if (search.trim()) params.q = search.trim();

    api.services(params)
      .then((data) => {
        let result = data;
        if (maxPrice != null) {
          result = result.filter((s) => Number(s.price) <= maxPrice);
        }
        setServices(result);
      })
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, [cat, search, sort, maxPrice]);

  if (loading && services.length === 0) {
    return <View style={styles.center}><ActivityIndicator color={BRAND.primary} size="large" /></View>;
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Book a Service</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconBtn} onPress={() => nav.navigate('ServiceCart')} hitSlop={8}>
            <Ionicons name="cart-outline" size={22} color={BRAND.ink} />
            {itemCount > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>
                  {itemCount > 9 ? '9+' : itemCount}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => nav.navigate('Wishlist')} hitSlop={8}>
            <Ionicons name="heart" size={22} color={BRAND.primary} />
            {favorites.length > 0 && (
              <View style={styles.iconBadge}>
                <Text style={styles.iconBadgeText}>
                  {favorites.length > 9 ? '9+' : favorites.length}
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={BRAND.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search AC, cleaning, plumbing..."
            placeholderTextColor={BRAND.light}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={BRAND.light} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <FlatList
          horizontal
          data={[{ name: 'All Services', slug: '' }, ...categories.map((c) => ({ name: c.name, slug: c.slug }))]}
          keyExtractor={(c) => c.slug || 'all'}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
          renderItem={({ item }) => {
            const active = (cat || '') === item.slug;
            return (
              <Pressable onPress={() => setCat(item.slug || null)} style={[styles.catItem, active && styles.catItemActive]}>
                <View style={[styles.catIconWrap, active && styles.catIconWrapActive]}>
                  <Text style={styles.catIcon}>{item.slug ? categoryIcon(item.slug) : '🏠'}</Text>
                </View>
                <Text style={[styles.catLabel, active && styles.catLabelActive]} numberOfLines={2}>
                  {categoryDisplayName(item.name)}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      <View style={styles.section}>
        <FlatList
          horizontal
          data={SORT_OPTIONS}
          keyExtractor={(s) => s.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
          renderItem={({ item }) => {
            const active = sort === item.id;
            return (
              <Pressable onPress={() => setSort(item.id)}>
                {active ? (
                  <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.sortChipActive}>
                    <Text style={styles.sortTextActive}>{item.label}</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.sortChip}>
                    <Text style={styles.sortText}>{item.label}</Text>
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      </View>

      <FlatList
        data={services}
        keyExtractor={(s) => String(s.id)}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: screenPad.paddingBottom + (itemCount > 0 ? 88 : 0) },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={BRAND.light} />
            <Text style={styles.emptyTitle}>No services found</Text>
            <Text style={styles.emptySub}>Try a different category or search term</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ServiceCard
            service={item}
            showFavorite
            showCart
            onPress={() => setSelectedService(item)}
            onBook={() => nav.navigate('BookService', { service: item })}
          />
        )}
      />

      <ServiceDetailSheet
        visible={!!selectedService}
        service={selectedService}
        onClose={() => setSelectedService(null)}
        onBook={(service) => nav.navigate('BookService', { service })}
      />

      <ServiceCartBar onPress={() => nav.navigate('ServiceCart')} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
    marginHorizontal: 8,
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
    position: 'relative',
  },
  iconBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: BRAND.canvas,
  },
  iconBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  toolbar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 18,
    backgroundColor: BRAND.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: BRAND.ink, fontWeight: '500' },
  section: {
    paddingTop: 18,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND.ink,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  catList: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  catItem: {
    alignItems: 'center',
    width: 84,
    paddingVertical: 4,
  },
  catItemActive: {},
  catIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: BRAND.canvas,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  catIconWrapActive: {
    borderColor: BRAND.primary,
    backgroundColor: BRAND.lavender,
  },
  catIcon: { fontSize: 26 },
  catLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.muted,
    textAlign: 'center',
    lineHeight: 14,
    minHeight: 28,
    width: '100%',
  },
  catLabelActive: { color: BRAND.primary, fontWeight: '800' },
  sortList: { paddingHorizontal: 20, gap: 10, paddingBottom: 8 },
  sortChip: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    backgroundColor: BRAND.canvas,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortChipActive: {
    paddingHorizontal: 18,
    height: 38,
    borderRadius: 20,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortText: { fontSize: 13, fontWeight: '700', color: BRAND.muted },
  sortTextActive: { fontSize: 13, fontWeight: '800', color: '#fff' },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { alignItems: 'center', marginTop: 48, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: BRAND.ink },
  emptySub: { fontSize: 13, color: BRAND.muted, textAlign: 'center', paddingHorizontal: 24 },
});
