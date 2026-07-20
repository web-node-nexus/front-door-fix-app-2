import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { proApi } from '../../api/pro';
import { BRAND } from '../../config';

export default function ProNotificationsScreen() {
  const [items, setItems] = useState<{ id: string; title: string; body: string; read: boolean; time?: string }[]>([]);

  useEffect(() => {
    proApi.notifications().then((r) => setItems(r.notifications));
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {items.length === 0 ? (
        <Text style={styles.empty}>No notifications.</Text>
      ) : (
        items.map((n) => (
          <View key={n.id} style={[styles.card, !n.read && styles.unread]}>
            <Text style={styles.title}>{n.title}</Text>
            <Text style={styles.body}>{n.body}</Text>
            <Text style={styles.time}>{n.time}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 20, backgroundColor: '#F5F5F7' },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  unread: { borderColor: BRAND.primary, backgroundColor: '#FFF5F9' },
  title: { fontWeight: '800', color: BRAND.ink },
  body: { fontSize: 14, color: BRAND.muted, marginTop: 6, lineHeight: 20 },
  time: { fontSize: 11, color: BRAND.light, marginTop: 8 },
});
