import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { REVIEWS } from '../../data/mock';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function ReviewsScreen() {
  const pad = useScreenPadding();

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      {REVIEWS.map((r) => (
        <View key={r.name} style={styles.card}>
          <View style={styles.head}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{r.name[0]}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{r.name}</Text>
              <Text style={styles.stars}>{'★'.repeat(Math.floor(r.rating))}</Text>
            </View>
            <Text style={styles.date}>{r.date}</Text>
          </View>
          <Text style={styles.text}>{r.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', color: BRAND.primary },
  name: { fontWeight: '800' },
  stars: { color: BRAND.gold, fontSize: 12 },
  date: { fontSize: 11, color: BRAND.muted },
  text: { fontSize: 13, color: BRAND.muted, lineHeight: 20 },
});
