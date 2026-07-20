import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import { OFFERS } from '../../data/mock';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function OffersScreen() {
  const nav = useNavigation<any>();
  const pad = useScreenPadding();
  const { showSuccess } = useFeedback();

  const applyOffer = (title: string) => {
    showSuccess(title, 'Offer saved. Choose a service to book with this deal.', [
      { label: 'Book Now', variant: 'primary', onPress: () => nav.navigate('Services') },
      { label: 'Later', variant: 'ghost' },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      {OFFERS.map((o) => (
        <Pressable key={o.title} onPress={() => applyOffer(o.title)}>
          <LinearGradient colors={['#FDF4FF', '#F3E8FF']} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.tag}>{o.title}</Text>
              <Text style={styles.sub}>{o.sub}</Text>
              <Text style={styles.cta}>{o.cta} →</Text>
            </View>
            <Ionicons name="pricetag" size={36} color={BRAND.primary} />
          </LinearGradient>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface, gap: 12 },
  card: { borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E9D5FF', marginBottom: 12 },
  tag: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
  sub: { fontSize: 16, fontWeight: '800', color: BRAND.ink, marginTop: 6 },
  cta: { fontSize: 14, fontWeight: '800', color: BRAND.primary, marginTop: 12 },
});
