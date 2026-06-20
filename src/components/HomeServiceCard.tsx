import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { durationLabel, serviceImageUrl } from '../utils/serviceImagery';

type Props = {
  service: Service;
  onPress?: () => void;
};

export default function HomeServiceCard({ service, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
      </View>
      <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
      <Text style={styles.category}>{service.category?.name || 'Service'}</Text>
      <View style={styles.tags}>
        <View style={styles.durationTag}>
          <Text style={styles.durationText}>{durationLabel(service.duration_hours)}</Text>
        </View>
        <Text style={styles.rating}>⭐ 4.8</Text>
      </View>
      <Text style={styles.price}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
      {service.bookings_count != null && service.bookings_count > 0 && (
        <Text style={styles.bookings}>{service.bookings_count}+ bookings</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginRight: 12,
  },
  imageWrap: {
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BRAND.lavender,
    marginBottom: 12,
  },
  image: { width: '100%', height: '100%' },
  name: { fontSize: 14, fontWeight: '800', color: BRAND.ink, textAlign: 'center' },
  category: { fontSize: 11, color: BRAND.muted, textAlign: 'center', marginTop: 4 },
  tags: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  durationTag: { backgroundColor: BRAND.lavender, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  durationText: { fontSize: 11, fontWeight: '700', color: BRAND.primary },
  rating: { fontSize: 11, fontWeight: '700', color: '#D97706' },
  price: { fontSize: 16, fontWeight: '800', color: BRAND.primary, textAlign: 'center', marginTop: 10 },
  bookings: { fontSize: 10, color: BRAND.muted, textAlign: 'center', marginTop: 4 },
});
