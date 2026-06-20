import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { ALL_FAQS } from '../../data/support';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function SupportFAQScreen() {
  const pad = useScreenPadding();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <FlatList
      data={ALL_FAQS}
      keyExtractor={(f) => f.id}
      contentContainerStyle={[styles.list, { paddingBottom: pad.paddingBottom }]}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => setOpen(open === item.id ? null : item.id)}>
          <View style={styles.row}>
            <View style={styles.icon}><Ionicons name={item.icon as any} size={18} color={BRAND.primary} /></View>
            <Text style={styles.title}>{item.title}</Text>
            <Ionicons name={open === item.id ? 'chevron-up' : 'chevron-down'} size={18} color={BRAND.light} />
          </View>
          {open === item.id && <Text style={styles.answer}>{item.answer}</Text>}
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, backgroundColor: BRAND.surface },
  card: { backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { width: 36, height: 36, borderRadius: 10, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, fontWeight: '700', fontSize: 14, color: BRAND.ink },
  answer: { marginTop: 12, fontSize: 13, color: BRAND.muted, lineHeight: 20, paddingLeft: 46 },
});
