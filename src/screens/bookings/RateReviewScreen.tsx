import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api, Booking } from '../../api/client';
import { BRAND } from '../../config';
import { useActiveBooking } from '../../context/ActiveBookingContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function RateReviewScreen() {
  const nav = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding();
  const { refresh: refreshActiveBooking } = useActiveBooking();
  const booking: Booking = route.params?.booking;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      Alert.alert('Rating required', 'Please tap stars to rate your experience.');
      return;
    }
    setSaving(true);
    try {
      await api.submitReview(booking.id, rating, comment.trim() || undefined);
      refreshActiveBooking();
      Alert.alert('Thank you!', 'Your review has been submitted.', [
        { text: 'Done', onPress: () => nav.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const skip = () => nav.goBack();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={['#FFF5F9', BRAND.surface]} style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable style={styles.closeBtn} onPress={skip}>
          <Ionicons name="close" size={22} color={BRAND.ink} />
        </Pressable>
        <View style={styles.successIcon}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.successCircle}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </LinearGradient>
        </View>
        <Text style={styles.badge}>THANK YOU</Text>
        <Text style={styles.title}>How was your service?</Text>
        <Text style={styles.sub}>Your service is complete. Please rate {booking.professional || 'your service partner'}.</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.proCard}>
          <View style={styles.proAvatar}>
            <Text style={styles.proInitial}>{(booking.professional || 'P')[0]}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proName}>{booking.professional || 'Professional'}</Text>
            <Text style={styles.serviceName}>{booking.service}</Text>
            <Text style={styles.bookingCode}>#{booking.booking_code}</Text>
          </View>
        </View>

        <Text style={styles.rateLabel}>Rate your experience</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} style={styles.starBtn}>
              <Ionicons
                name={n <= rating ? 'star' : 'star-outline'}
                size={40}
                color={n <= rating ? BRAND.gold : BRAND.light}
              />
            </Pressable>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.starHint}>{STAR_LABELS[rating - 1]}</Text>
        )}

        <Text style={styles.commentLabel}>Share more (optional)</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Tell us what went well or what we can improve..."
          placeholderTextColor={BRAND.light}
          value={comment}
          onChangeText={setComment}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        <Pressable onPress={submit} disabled={saving}>
          <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.submitBtn}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.submitText}>{saving ? 'Submitting...' : 'Submit Review'}</Text>
          </LinearGradient>
        </Pressable>

        <Pressable style={styles.skipBtn} onPress={skip}>
          <Text style={styles.skipText}>Maybe later</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  successIcon: { marginTop: 8, marginBottom: 12 },
  successCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND.primary,
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: { fontSize: 24, fontWeight: '800', color: BRAND.ink, textAlign: 'center' },
  sub: {
    fontSize: 13,
    color: BRAND.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  content: { padding: 20 },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  proAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInitial: { fontSize: 22, fontWeight: '800', color: BRAND.primary },
  proName: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  serviceName: { fontSize: 13, color: BRAND.muted, marginTop: 2 },
  bookingCode: { fontSize: 11, color: BRAND.light, marginTop: 4 },
  rateLabel: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  starBtn: { padding: 4 },
  starHint: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.gold,
  },
  commentLabel: { fontSize: 14, fontWeight: '700', color: BRAND.ink, marginTop: 24, marginBottom: 10 },
  commentInput: {
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    padding: 14,
    minHeight: 110,
    fontSize: 14,
    color: BRAND.ink,
    lineHeight: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 24,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  skipBtn: { alignItems: 'center', paddingVertical: 16 },
  skipText: { fontSize: 14, fontWeight: '600', color: BRAND.muted },
});
