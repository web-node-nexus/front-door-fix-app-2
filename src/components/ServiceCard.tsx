import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import { categoryIcon, durationLabel, serviceImageUrl } from '../utils/serviceImagery';

type Props = {
  service: Service;
  onPress?: () => void;
  onBook?: () => void;
  showFavorite?: boolean;
  showCart?: boolean;
};

export default function ServiceCard({ service, onPress, onBook, showFavorite, showCart }: Props) {
  const { isFavorite, toggleFavorite } = useProfile();
  const { getQuantity, addItem, updateQuantity } = useCart();
  const fav = isFavorite(service.id);
  const qty = getQuantity(service.id);
  const slug = service.category?.slug;

  const shareService = async () => {
    const price = `₹${Number(service.price).toLocaleString('en-IN')}`;
    const duration = durationLabel(service.duration_hours);
    const message = [
      `Check out ${service.name} on Front Door!`,
      service.category?.name ? `Category: ${service.category.name}` : null,
      `Price: ${price} · ${duration}`,
      service.description || 'Book verified home service professionals near you.',
    ].filter(Boolean).join('\n');

    try {
      await Share.share({ message, title: service.name });
    } catch {
      Alert.alert('Share', message);
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{categoryIcon(slug)}</Text>
        </View>
        {showFavorite && (
          <>
            <Pressable style={styles.favBtn} onPress={() => toggleFavorite(service.id)}>
              <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? BRAND.primary : '#fff'} />
            </Pressable>
            <Pressable style={styles.shareBtn} onPress={shareService}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </Pressable>
          </>
        )}
      </View>

      <View style={styles.body}>
        {service.category?.name ? (
          <Text style={styles.categoryTag}>{service.category.name}</Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>{service.name}</Text>
        {service.description ? (
          <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
        ) : (
          <Text style={styles.desc} numberOfLines={2}>Verified professionals · Best price guarantee</Text>
        )}

        <View style={styles.meta}>
          <View style={styles.duration}>
            <Ionicons name="time-outline" size={14} color={BRAND.primary} />
            <Text style={styles.durationText}>{durationLabel(service.duration_hours)}</Text>
          </View>
          <View style={styles.priceWrap}>
            <Text style={styles.priceLabel}>From</Text>
            <Text style={styles.price}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {showCart ? (
            qty > 0 ? (
              <View style={styles.stepper}>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => updateQuantity(service.id, qty - 1)}
                  hitSlop={6}
                >
                  <Ionicons name="remove" size={18} color={BRAND.primary} />
                </Pressable>
                <Text style={styles.qty}>{qty}</Text>
                <Pressable
                  style={styles.stepBtn}
                  onPress={() => updateQuantity(service.id, qty + 1)}
                  hitSlop={6}
                >
                  <Ionicons name="add" size={18} color={BRAND.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={styles.addBtn}
                onPress={(e) => {
                  e.stopPropagation?.();
                  addItem(service);
                }}
              >
                <Ionicons name="cart-outline" size={16} color={BRAND.primary} />
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            )
          ) : null}

          <Pressable
            style={showCart ? styles.bookBtn : styles.bookBtnFull}
            onPress={(e) => {
              e.stopPropagation?.();
              (onBook || onPress)?.();
            }}
          >
            <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.btn}>
              <Ionicons name="calendar-outline" size={16} color="#fff" />
              <Text style={styles.btnText}>Book Now</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 16,
    shadowColor: '#FF2D7A',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  imageWrap: { height: 148, backgroundColor: BRAND.lavender, position: 'relative' },
  image: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 18 },
  favBtn: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 16 },
  categoryTag: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: '800',
    color: BRAND.primary,
    backgroundColor: BRAND.lavender,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  title: { fontSize: 17, fontWeight: '800', color: BRAND.ink, lineHeight: 22 },
  desc: { fontSize: 13, color: BRAND.muted, marginTop: 6, lineHeight: 19 },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: BRAND.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationText: { fontSize: 12, color: BRAND.ink, fontWeight: '700' },
  priceWrap: { alignItems: 'flex-end' },
  priceLabel: { fontSize: 10, color: BRAND.muted, fontWeight: '600' },
  price: { fontSize: 20, fontWeight: '800', color: BRAND.primary, marginTop: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  addBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: BRAND.canvas,
  },
  addText: { color: BRAND.primary, fontWeight: '800', fontSize: 15 },
  stepper: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND.lavender,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: BRAND.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 16, fontWeight: '800', color: BRAND.primary },
  bookBtn: { flex: 1.4 },
  bookBtnFull: { flex: 1 },
  btn: {
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
