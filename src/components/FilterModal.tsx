import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';

export type SortOption = 'popular' | 'name' | 'price_asc' | 'price_desc';

export type ServiceFilters = {
  category: string;
  sort: SortOption;
  maxPrice: number | null;
};

type Props = {
  visible: boolean;
  categories: string[];
  initial: ServiceFilters;
  onClose: () => void;
  onApply: (filters: ServiceFilters) => void;
};

const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'popular', label: 'Popular' },
  { id: 'name', label: 'Name' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

const PRICE_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any price', value: null },
  { label: 'Under ₹500', value: 500 },
  { label: 'Under ₹1,000', value: 1000 },
  { label: 'Under ₹2,000', value: 2000 },
  { label: 'Under ₹5,000', value: 5000 },
];

function catLabel(slug: string) {
  if (slug === 'All') return 'All Services';
  return slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export default function FilterModal({ visible, categories, initial, onClose, onApply }: Props) {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState(initial.category);
  const [sort, setSort] = useState(initial.sort);
  const [maxPrice, setMaxPrice] = useState<number | null>(initial.maxPrice);

  useEffect(() => {
    if (visible) {
      setCategory(initial.category);
      setSort(initial.sort);
      setMaxPrice(initial.maxPrice);
    }
  }, [visible, initial]);

  const reset = () => {
    setCategory('All');
    setSort('popular');
    setMaxPrice(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.head}>
            <Text style={styles.title}>Filter Services</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={BRAND.ink} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.body}>
            <Text style={styles.section}>Category</Text>
            <View style={styles.chips}>
              {categories.map((c) => {
                const active = category === c;
                return (
                  <Pressable key={c} onPress={() => setCategory(c)}>
                    {active ? (
                      <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.chipActive}>
                        <Text style={styles.chipTextActive}>{catLabel(c)}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{catLabel(c)}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>Sort by</Text>
            {SORT_OPTIONS.map((o) => (
              <Pressable key={o.id} style={styles.radioRow} onPress={() => setSort(o.id)}>
                <Ionicons
                  name={sort === o.id ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={sort === o.id ? BRAND.primary : BRAND.light}
                />
                <Text style={styles.radioLabel}>{o.label}</Text>
              </Pressable>
            ))}

            <Text style={styles.section}>Price range</Text>
            <View style={styles.chips}>
              {PRICE_OPTIONS.map((p) => {
                const active = maxPrice === p.value;
                return (
                  <Pressable key={p.label} onPress={() => setMaxPrice(p.value)}>
                    {active ? (
                      <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.chipActive}>
                        <Text style={styles.chipTextActive}>{p.label}</Text>
                      </LinearGradient>
                    ) : (
                      <View style={styles.chip}>
                        <Text style={styles.chipText}>{p.label}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable style={styles.resetBtn} onPress={reset}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => onApply({ category, sort, maxPrice })}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.applyBtn}>
                <Text style={styles.applyText}>Apply Filters</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: BRAND.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '82%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: BRAND.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '800', color: BRAND.ink },
  body: { maxHeight: 420 },
  section: { fontSize: 14, fontWeight: '700', color: BRAND.muted, marginTop: 16, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: BRAND.surface,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  chipActive: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
  chipText: { fontWeight: '600', color: BRAND.muted, fontSize: 13 },
  chipTextActive: { fontWeight: '700', color: '#fff', fontSize: 13 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  radioLabel: { fontSize: 15, fontWeight: '600', color: BRAND.ink },
  actions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  resetBtn: {
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: { fontWeight: '700', color: BRAND.muted },
  applyBtn: { height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  applyText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
