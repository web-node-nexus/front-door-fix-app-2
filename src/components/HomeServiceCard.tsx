import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { durationLabel, serviceImageUrl } from '../utils/serviceImagery';

type Props = {
  service: Service;
  onPress?: () => void;
};

/** Compact horizontal card for "Most Booked" carousel */
export default function HomeServiceCard({ service, onPress }: Props) {
  const price = Number(service.price).toLocaleString('en-IN');

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{service.name}</Text>
        <Text style={styles.meta} numberOfLines={1}>
          {service.category?.name || 'Service'} · {durationLabel(service.duration_hours)}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₹{price}</Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color="#F59E0B" />
            <Text style={styles.ratingText}>4.8</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 248,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ECECF2',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: BRAND.lavender,
  },
  body: { flex: 1, minWidth: 0 },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.ink,
    lineHeight: 18,
  },
  meta: {
    fontSize: 11,
    color: BRAND.muted,
    marginTop: 3,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
});
