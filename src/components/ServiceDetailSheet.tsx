import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { useCart } from '../context/CartContext';
import { useProfile } from '../context/ProfileContext';
import {
  serviceHighlights,
  serviceIncludes,
  serviceProcessSteps,
  serviceRating,
} from '../utils/serviceDetails';
import { categoryIcon, durationLabel, serviceImageUrl } from '../utils/serviceImagery';

type Props = {
  visible: boolean;
  service: Service | null;
  onClose: () => void;
  onBook: (service: Service) => void;
};

export default function ServiceDetailSheet({ visible, service, onClose, onBook }: Props) {
  const insets = useSafeAreaInsets();
  const { getQuantity, addItem, updateQuantity } = useCart();
  const { isFavorite, toggleFavorite } = useProfile();

  if (!service) return null;

  const qty = getQuantity(service.id);
  const fav = isFavorite(service.id);
  const { rating, reviews } = serviceRating(service);
  const includes = serviceIncludes(service);
  const highlights = serviceHighlights(service);
  const steps = serviceProcessSteps();
  const slug = service.category?.slug;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.imageWrap}>
              <Image source={{ uri: serviceImageUrl(service) }} style={styles.image} resizeMode="cover" />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>{categoryIcon(slug)}</Text>
              </View>
              <Pressable style={styles.favBtn} onPress={() => toggleFavorite(service.id)}>
                <Ionicons name={fav ? 'heart' : 'heart-outline'} size={22} color={fav ? BRAND.primary : '#fff'} />
              </Pressable>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={22} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.body}>
              {service.category?.name ? (
                <Text style={styles.category}>{service.category.name}</Text>
              ) : null}
              <Text style={styles.title}>{service.name}</Text>

              <View style={styles.metaRow}>
                <View style={styles.ratingBox}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>{rating}</Text>
                  <Text style={styles.reviewsText}>({reviews})</Text>
                </View>
                <View style={styles.durationBox}>
                  <Ionicons name="time-outline" size={14} color={BRAND.primary} />
                  <Text style={styles.durationText}>{durationLabel(service.duration_hours)}</Text>
                </View>
              </View>

              <View style={styles.priceCard}>
                <View>
                  <Text style={styles.priceLabel}>Service charges</Text>
                  <Text style={styles.price}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
                </View>
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>Best price</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>About this service</Text>
              <Text style={styles.description}>
                {service.description
                  || 'Professional home service delivered by verified experts. Book now and get quality service at your doorstep with transparent pricing.'}
              </Text>

              <Text style={styles.sectionTitle}>Highlights</Text>
              <View style={styles.chipRow}>
                {highlights.map((item) => (
                  <View key={item} style={styles.chip}>
                    <Text style={styles.chipText}>{item}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>What's included</Text>
              {includes.map((item) => (
                <View key={item} style={styles.includeRow}>
                  <Ionicons name="checkmark-circle" size={18} color={BRAND.success} />
                  <Text style={styles.includeText}>{item}</Text>
                </View>
              ))}

              <Text style={styles.sectionTitle}>How it works</Text>
              {steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {qty > 0 ? (
              <View style={styles.stepper}>
                <Pressable style={styles.stepBtn} onPress={() => updateQuantity(service.id, qty - 1)}>
                  <Ionicons name="remove" size={20} color={BRAND.primary} />
                </Pressable>
                <Text style={styles.qty}>{qty}</Text>
                <Pressable style={styles.stepBtn} onPress={() => updateQuantity(service.id, qty + 1)}>
                  <Ionicons name="add" size={20} color={BRAND.primary} />
                </Pressable>
              </View>
            ) : (
              <Pressable style={styles.addBtn} onPress={() => addItem(service)}>
                <Ionicons name="cart-outline" size={18} color={BRAND.primary} />
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            )}

            <Pressable
              style={styles.bookBtn}
              onPress={() => {
                onClose();
                onBook(service);
              }}
            >
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.bookGradient}>
                <Text style={styles.bookText}>Book Now</Text>
                <Text style={styles.bookPrice}>₹{Number(service.price).toLocaleString('en-IN')}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(26, 26, 46, 0.55)' },
  sheet: {
    maxHeight: '88%',
    backgroundColor: BRAND.canvas,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: BRAND.border,
    marginTop: 10,
    marginBottom: 4,
  },
  scroll: { paddingBottom: 12 },
  imageWrap: { height: 220, backgroundColor: BRAND.lavender, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageBadge: {
    position: 'absolute',
    bottom: 14,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBadgeText: { fontSize: 20 },
  favBtn: {
    position: 'absolute',
    top: 14,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 20 },
  category: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '800',
    color: BRAND.primary,
    backgroundColor: BRAND.lavender,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: '800', color: BRAND.ink, lineHeight: 30 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  reviewsText: { fontSize: 13, color: BRAND.muted, fontWeight: '600' },
  durationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  durationText: { fontSize: 13, fontWeight: '700', color: BRAND.ink },
  priceCard: {
    marginTop: 16,
    backgroundColor: BRAND.lavender,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  price: { fontSize: 28, fontWeight: '800', color: BRAND.primary, marginTop: 2 },
  priceTag: {
    backgroundColor: BRAND.canvas,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.primary,
  },
  priceTagText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: BRAND.ink, marginTop: 22, marginBottom: 10 },
  description: { fontSize: 14, color: BRAND.muted, lineHeight: 22 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: BRAND.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: BRAND.ink },
  includeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  includeText: { flex: 1, fontSize: 14, color: BRAND.ink, lineHeight: 20, fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  stepText: { flex: 1, fontSize: 14, color: BRAND.ink, fontWeight: '600', lineHeight: 20 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    backgroundColor: BRAND.canvas,
  },
  addBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  addText: { color: BRAND.primary, fontWeight: '800', fontSize: 15 },
  stepper: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BRAND.lavender,
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BRAND.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 24, textAlign: 'center', fontSize: 17, fontWeight: '800', color: BRAND.primary },
  bookBtn: { flex: 1.5 },
  bookGradient: {
    height: 50,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  bookPrice: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
