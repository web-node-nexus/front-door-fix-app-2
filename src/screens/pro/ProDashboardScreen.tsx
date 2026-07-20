import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { proApi } from '../../api/pro';
import ProHeader from '../../components/pro/ProHeader';
import ProRequestCard from '../../components/pro/ProRequestCard';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';

const POLL_MS = 5000;

function StatCard({ label, value, icon, accent }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap; accent: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: accent }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProDashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [poll, setPoll] = useState<Awaited<ReturnType<typeof proApi.poll>> | null>(null);

  const isApproved = user?.professional?.approval_status === 'approved';

  const load = useCallback(async () => {
    try {
      const data = await proApi.poll();
      setPoll(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const stats = poll?.stats;
  const requests = poll?.requests ?? [];
  const activeJob = poll?.active_job;

  return (
    <View style={styles.root}>
      <ProHeader showAvailability />

      {user?.professional?.approval_status !== 'approved' && (
        <View style={styles.pendingBanner}>
          <Ionicons name="hourglass-outline" size={20} color="#B45309" />
          <Text style={styles.pendingText}>Profile under review — jobs unlock after approval.</Text>
        </View>
      )}

      {stats?.requests_blocked && (
        <View style={styles.blockBanner}>
          <Text style={styles.blockText}>Cash settlement pending — new requests paused.</Text>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1A1A2E" />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          <View style={styles.statsGrid}>
            <StatCard label="New requests" value={String(stats?.new_requests ?? 0)} icon="notifications-outline" accent="#E91E63" />
            <StatCard label="In progress" value={String(stats?.in_progress ?? 0)} icon="hammer-outline" accent="#1A1A2E" />
            <StatCard label="Awaiting pay" value={String(stats?.awaiting_payment ?? 0)} icon="card-outline" accent="#F59E0B" />
            <StatCard label="Wallet" value={`₹${(stats?.wallet_balance ?? 0).toFixed(0)}`} icon="cash-outline" accent="#7C3AED" />
          </View>

          {activeJob ? (
            <Pressable style={styles.activeCard} onPress={() => navigation.navigate('ProJobDetail', { job: activeJob })}>
              <Text style={styles.activeLabel}>ACTIVE JOB</Text>
              <Text style={styles.activeService}>{activeJob.service}</Text>
              <Text style={styles.activeMeta}>{activeJob.customer} · {activeJob.workflow_stage?.replace(/_/g, ' ')}</Text>
              <Text style={styles.activeCta}>Tap to manage →</Text>
            </Pressable>
          ) : null}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>New requests</Text>
            <Pressable onPress={() => navigation.navigate('ProRequests')}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          </View>

          {!isApproved ? (
            <Text style={styles.empty}>Available after approval</Text>
          ) : requests.length === 0 ? (
            <Text style={styles.empty}>No new requests right now</Text>
          ) : (
            requests.slice(0, 3).map((req) => (
              <ProRequestCard key={req.id} request={req} onAccepted={load} onRejected={load} />
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  pendingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingText: { flex: 1, fontSize: 12, color: '#B45309', fontWeight: '600' },
  blockBanner: {
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  blockText: { fontSize: 12, color: '#B91C1C', fontWeight: '700' },
  scroll: { paddingHorizontal: 20, paddingTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  statValue: { fontSize: 20, fontWeight: '800', color: BRAND.ink },
  statLabel: { fontSize: 12, color: BRAND.muted, marginTop: 4, fontWeight: '600' },
  activeCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  activeLabel: { fontSize: 10, fontWeight: '800', color: '#FFD600', letterSpacing: 1 },
  activeService: { fontSize: 18, fontWeight: '800', color: '#fff', marginTop: 6 },
  activeMeta: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, textTransform: 'capitalize' },
  activeCta: { fontSize: 12, color: '#FFD600', marginTop: 10, fontWeight: '700' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: BRAND.ink },
  seeAll: { fontSize: 13, fontWeight: '700', color: BRAND.primary },
  empty: { fontSize: 14, color: BRAND.muted, textAlign: 'center', paddingVertical: 24 },
});
