import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { proApi } from '../../api/pro';
import { BRAND } from '../../config';

export default function ProCompletionListScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'pending' | 'completed'>('pending');
  const [data, setData] = useState<Awaited<ReturnType<typeof proApi.completionList>> | null>(null);

  useEffect(() => {
    proApi.completionList().then(setData);
  }, []);

  const list = tab === 'pending' ? data?.pending ?? [] : data?.completed ?? [];

  return (
    <View style={styles.root}>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'pending' && styles.tabOn]} onPress={() => setTab('pending')}>
          <Text style={[styles.tabText, tab === 'pending' && styles.tabTextOn]}>Awaiting payment</Text>
        </Pressable>
        <Pressable style={[styles.tab, tab === 'completed' && styles.tabOn]} onPress={() => setTab('completed')}>
          <Text style={[styles.tabText, tab === 'completed' && styles.tabTextOn]}>History</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {list.length === 0 ? (
          <Text style={styles.empty}>No jobs in this tab.</Text>
        ) : (
          list.map((job) => (
            <Pressable
              key={job.id}
              style={styles.card}
              onPress={() => navigation.navigate('ProCompletionDetail', { bookingId: job.id })}
            >
              <Text style={styles.service}>{job.service}</Text>
              <Text style={styles.meta}>{job.customer} · ₹{job.amount}</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  tabs: { flexDirection: 'row', padding: 16, gap: 8 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  tabOn: { backgroundColor: '#1A1A2E', borderColor: '#1A1A2E' },
  tabText: { fontWeight: '700', color: BRAND.muted },
  tabTextOn: { color: '#FFD600' },
  scroll: { padding: 16 },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  service: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  meta: { fontSize: 13, color: BRAND.muted, marginTop: 6 },
});
