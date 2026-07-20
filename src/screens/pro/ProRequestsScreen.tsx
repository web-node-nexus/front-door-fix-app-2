import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../api/client';
import ProHeader from '../../components/pro/ProHeader';
import ProRequestCard from '../../components/pro/ProRequestCard';
import { BRAND } from '../../config';

export default function ProRequestsScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requests, setRequests] = useState<Awaited<ReturnType<typeof api.proRequests>>['requests']>([]);

  const load = useCallback(async () => {
    try {
      const data = await api.proRequests();
      setRequests(data.requests ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.root}>
      <ProHeader title="New Requests" />
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#1A1A2E" />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        >
          {requests.length === 0 ? (
            <Text style={styles.empty}>No new requests — check back soon.</Text>
          ) : (
            requests.map((req) => <ProRequestCard key={req.id} request={req} onAccepted={load} onRejected={load} />)
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F7' },
  scroll: { paddingHorizontal: 20 },
  empty: { textAlign: 'center', color: BRAND.muted, marginTop: 40, fontWeight: '600' },
});
