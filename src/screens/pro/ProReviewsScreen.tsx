import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { proApi } from '../../api/pro';
import { BRAND } from '../../config';

export default function ProReviewsScreen() {
  const [reviews, setReviews] = useState<Awaited<ReturnType<typeof proApi.reviews>>['reviews']>([]);

  useEffect(() => {
    proApi.reviews().then((r) => setReviews(r.reviews));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {reviews.length === 0 ? (
        <Text style={styles.empty}>No reviews yet.</Text>
      ) : (
        reviews.map((r) => (
          <View key={r.id} style={styles.card}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Ionicons key={n} name={n <= r.rating ? 'star' : 'star-outline'} size={16} color={BRAND.gold} />
              ))}
            </View>
            <Text style={styles.service}>{r.service}</Text>
            <Text style={styles.customer}>{r.customer}</Text>
            {r.comment ? <Text style={styles.comment}>{r.comment}</Text> : null}
            <Text style={styles.date}>{r.date}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, backgroundColor: '#F5F5F7' },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  stars: { flexDirection: 'row', gap: 2, marginBottom: 8 },
  service: { fontWeight: '800', color: BRAND.ink },
  customer: { fontSize: 12, color: BRAND.muted, marginTop: 4 },
  comment: { fontSize: 14, color: BRAND.ink, marginTop: 10, lineHeight: 20 },
  date: { fontSize: 11, color: BRAND.light, marginTop: 8 },
});
