import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import AppCard from '../components/AppCard';
import { BRAND } from '../config';
import { useNotifications } from '../context/NotificationContext';
import type { AppNotification } from '../context/NotificationContext';
import { useScreenPadding } from '../hooks/useScreenPadding';

const ICONS: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  booking: 'calendar',
  offer: 'pricetag',
  system: 'information-circle',
};

const COLORS: Record<AppNotification['type'], string> = {
  booking: BRAND.lavender,
  offer: '#FEF3C7',
  system: '#D1FAE5',
};

export default function NotificationsScreen() {
  const screenPad = useScreenPadding();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  return (
    <View style={styles.root}>
      {unreadCount > 0 && (
        <Pressable style={styles.markAll} onPress={markAllRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </Pressable>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={[
          styles.list,
          { paddingTop: screenPad.paddingTop, paddingBottom: screenPad.paddingBottom },
        ]}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => markRead(item.id)}>
            <AppCard style={[styles.card, !item.read && styles.unread]}>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: COLORS[item.type] }]}>
                  <Ionicons name={ICONS[item.type]} size={22} color={BRAND.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.title}</Text>
                    {!item.read && <View style={styles.dot} />}
                  </View>
                  <Text style={styles.body}>{item.body}</Text>
                  <Text style={styles.time}>{item.time}</Text>
                </View>
              </View>
            </AppCard>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  markAll: { alignSelf: 'flex-end', marginRight: 20, marginTop: 8 },
  markAllText: { color: BRAND.primary, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 20, gap: 10 },
  card: { marginBottom: 0 },
  unread: { borderColor: BRAND.primary, borderWidth: 1.5 },
  row: { flexDirection: 'row', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 15, fontWeight: '800', color: BRAND.ink, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: BRAND.primary },
  body: { fontSize: 13, color: BRAND.muted, marginTop: 4, lineHeight: 20 },
  time: { fontSize: 11, color: BRAND.light, marginTop: 8 },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 48 },
});
