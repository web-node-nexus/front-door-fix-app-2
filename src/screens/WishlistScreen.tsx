import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Service } from '../api/client';
import ServiceCard from '../components/ServiceCard';
import { BRAND } from '../config';
import { useProfile } from '../context/ProfileContext';
import { useScreenPadding } from '../hooks/useScreenPadding';

export default function WishlistScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding({ extraBottom: 24 });
  const { favorites } = useProfile();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await api.services();
      setServices(all.filter((s) => favorites.includes(s.id)));
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [favorites]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>My Wishlist</Text>
          {favorites.length > 0 && (
            <Text style={styles.headerSub}>{favorites.length} saved service{favorites.length === 1 ? '' : 's'}</Text>
          )}
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={BRAND.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(s) => String(s.id)}
          contentContainerStyle={[styles.list, { paddingBottom: pad.paddingBottom }]}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={40} color={BRAND.primary} />
              </View>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySub}>
                Tap the heart on any service to save it here for quick booking later.
              </Text>
              <Pressable style={styles.emptyBtn} onPress={() => nav.navigate('Services')}>
                <Text style={styles.emptyBtnText}>Browse Services</Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <ServiceCard
              service={item}
              showFavorite
              onBook={() => nav.navigate('BookService', { service: item })}
            />
          )}
        />
      )}
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
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  headerSub: { fontSize: 12, color: BRAND.muted, marginTop: 2, fontWeight: '600' },
  headerSpacer: { width: 40 },
  list: { padding: 20 },
  empty: { alignItems: 'center', marginTop: 72, paddingHorizontal: 28, gap: 10 },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink },
  emptySub: { fontSize: 14, color: BRAND.muted, textAlign: 'center', lineHeight: 21 },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: BRAND.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
