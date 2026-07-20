import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { durationLabel, serviceImageUrl } from '../utils/serviceImagery';

const GAP = 10;
const H_PAD = 40;
const CARD_WIDTH = (Dimensions.get('window').width - H_PAD - GAP) / 2;

type Props = {
  service: Service;
  onPress?: () => void;
};

/** Compact grid card for "Popular Services" */
export default function HomeGridServiceCard({ service, onPress }: Props) {
  const price = Number(service.price).toLocaleString('en-IN');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
        {service.category?.name ? (
          <View style={styles.chip}>
            <Text style={styles.chipText} numberOfLines={1}>{service.category.name}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
        <View style={styles.footer}>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={11} color={BRAND.muted} />
            <Text style={styles.durationText}>{durationLabel(service.duration_hours)}</Text>
          </View>
          <Text style={styles.price}>₹{price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECECF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: { opacity: 0.94 },
  imageWrap: {
    height: 76,
    backgroundColor: BRAND.lavender,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  chip: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    maxWidth: '80%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    color: BRAND.primary,
  },
  body: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
  },
  name: {
    fontSize: 12,
    fontWeight: '800',
    color: BRAND.ink,
    lineHeight: 16,
    minHeight: 32,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    flex: 1,
    marginRight: 4,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: BRAND.muted,
    flexShrink: 1,
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.primary,
  },
});
