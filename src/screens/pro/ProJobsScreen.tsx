import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProActiveJob, proApi } from '../../api/pro';
import ProHeader from '../../components/pro/ProHeader';
import { BRAND } from '../../config';

export default function ProJobsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<ProActiveJob[]>([]);
  const [awaiting, setAwaiting] = useState(0);

  const load = useCallback(async () => {
    try {
      const [poll, completion] = await Promise.all([proApi.poll(), proApi.completionList()]);
      setJobs(poll.active_jobs ?? []);
      setAwaiting(completion.pending?.length ?? poll.stats.awaiting_payment);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <View style={styles.root}>
      <ProHeader title="Jobs" />
      <Pressable style={styles.payBanner} onPress={() => navigation.navigate('ProCompletionList')}>
        <Ionicons name="card-outline" size={22} color="#B45309" />
        <View style={{ flex: 1 }}>
          <Text style={styles.payTitle}>Payment collection</Text>
          <Text style={styles.paySub}>{awaiting} job(s) awaiting payment</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={BRAND.muted} />
      </Pressable>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1A1A2E" />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <Text style={styles.section}>Active jobs</Text>
          {jobs.length === 0 ? (
            <Text style={styles.empty}>No active jobs right now.</Text>
          ) : (
            jobs.map((job) => (
              <Pressable
                key={job.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProJobDetail', { job })}
              >
                <Text style={styles.service}>{job.service}</Text>
                <Text style={styles.meta}>{job.customer} · {job.workflow_stage?.replace(/_/g, ' ')}</Text>
                {job.distance ? <Text style={styles.dist}>{job.distance}</Text> : null}
              </Pressable>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  payBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  payTitle: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  paySub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  scroll: { paddingHorizontal: 20 },
  section: { fontSize: 16, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  empty: { color: BRAND.muted, textAlign: 'center', paddingVertical: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  service: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  meta: { fontSize: 13, color: BRAND.muted, marginTop: 6, textTransform: 'capitalize' },
  dist: { fontSize: 12, color: BRAND.primary, marginTop: 6, fontWeight: '700' },
});
