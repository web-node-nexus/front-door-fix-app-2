import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { durationLabel, serviceImageUrl } from '../utils/serviceImagery';

const CARD_WIDTH = (Dimensions.get('window').width - 52) / 2;

type Props = {
  service: Service;
  onPress?: () => void;
};

export default function HomeGridServiceCard({ service, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
        <Text style={styles.duration}>{durationLabel(service.duration_hours)}</Text>
        <Text style={styles.price}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  imageWrap: {
    height: 100,
    backgroundColor: BRAND.lavender,
  },
  image: { width: '100%', height: '100%' },
  body: { padding: 10 },
  name: { fontSize: 13, fontWeight: '800', color: BRAND.ink, lineHeight: 17, minHeight: 34 },
  duration: { fontSize: 10, fontWeight: '600', color: BRAND.muted, marginTop: 4 },
  price: { fontSize: 14, fontWeight: '800', color: BRAND.primary, marginTop: 6 },
});
