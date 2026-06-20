import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { RECENT_TICKETS } from '../../data/support';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const STATUS_COLORS = {
  in_progress: { bg: '#F3E8FF', text: '#9333EA', label: 'In Progress' },
  resolved: { bg: '#D1FAE5', text: '#059669', label: 'Resolved' },
  open: { bg: '#FFEDD5', text: '#EA580C', label: 'Open' },
};

export default function SupportTicketsScreen() {
  const nav = useNavigation<any>();
  const pad = useScreenPadding();

  return (
    <FlatList
      data={RECENT_TICKETS}
      keyExtractor={(t) => t.id}
      contentContainerStyle={[styles.list, { paddingBottom: pad.paddingBottom }]}
      renderItem={({ item }) => {
        const st = STATUS_COLORS[item.status];
        return (
          <Pressable style={styles.card} onPress={() => nav.navigate('SupportTicketDetail', { ticket: item })}>
            <View style={styles.icon}><Ionicons name={item.icon === 'star' ? 'star' : 'checkmark-circle'} size={20} color={BRAND.primary} /></View>
            <View style={{ flex: 1 }}>
              <View style={styles.topRow}>
                <Text style={styles.id}>#{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: st.bg }]}><Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text></View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={BRAND.light} />
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 20, backgroundColor: BRAND.surface },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  icon: { width: 44, height: 44, borderRadius: 14, backgroundColor: BRAND.lavender, alignItems: 'center', justifyContent: 'center' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  id: { fontWeight: '800', fontSize: 13, color: BRAND.ink },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '600', marginTop: 4, color: BRAND.ink },
  time: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
});
