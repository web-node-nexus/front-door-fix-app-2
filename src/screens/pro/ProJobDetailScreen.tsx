import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProActiveJob, proApi } from '../../api/pro';
import { BRAND } from '../../config';

export default function ProJobDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [job, setJob] = useState<ProActiveJob | null>(route.params?.job ?? null);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const poll = await proApi.poll();
    const found = poll.active_jobs?.find((j) => j.id === job?.id) ?? poll.active_job;
    if (found) setJob(found);
  }, [job?.id]);

  useEffect(() => {
    const id = setInterval(refresh, 3000);
    return () => clearInterval(id);
  }, [refresh]);

  if (!job) {
    return (
      <View style={styles.center}>
        <Text>Job not found</Text>
      </View>
    );
  }

  async function action(fn: () => Promise<{ message: string; active_job?: ProActiveJob }>, successMsg?: string) {
    setBusy(true);
    try {
      const res = await fn();
      if (res.active_job) setJob(res.active_job);
      else await refresh();
      if (successMsg || res.message) Alert.alert('Updated', successMsg || res.message);
      if (res.active_job?.actions?.collect_payment) {
        navigation.navigate('ProCompletionDetail', { bookingId: job.id });
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  const wp = job.work_progress;
  const actions = job.actions;

  return (
    <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.card}>
        <Text style={styles.service}>{job.service}</Text>
        <Text style={styles.meta}>{job.customer} · {job.pincode}</Text>
        {job.phone ? (
          <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${job.phone}`)}>
            <Ionicons name="call" size={16} color="#fff" />
            <Text style={styles.callText}>Call customer</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.section}>Timeline</Text>
      <View style={styles.timeline}>
        {job.timeline?.map((step) => (
          <View key={step.key} style={styles.step}>
            <View style={[styles.dot, step.done && styles.dotDone, step.active && styles.dotActive]} />
            <Text style={[styles.stepLabel, step.active && styles.stepActive]}>{step.label}</Text>
          </View>
        ))}
      </View>

      {wp?.in_progress ? (
        <View style={styles.timerCard}>
          <Text style={styles.timerTitle}>Service in progress</Text>
          <Text style={styles.timerValue}>{wp.seconds_left}s remaining</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${wp.percent}%` }]} />
          </View>
        </View>
      ) : null}

      {actions?.on_the_way ? (
        <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => action(() => proApi.onTheWay(job.id))}>
          <Text style={styles.primaryText}>Mark On the Way</Text>
        </Pressable>
      ) : null}

      {actions?.arrived ? (
        <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => action(() => proApi.arrived(job.id))}>
          <Text style={styles.primaryText}>Mark Arrived</Text>
        </Pressable>
      ) : null}

      {job.can_verify_otp || actions?.start_work ? (
        <View style={styles.otpCard}>
          <Text style={styles.section}>Verify customer OTP</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="4-digit OTP"
            placeholderTextColor={BRAND.light}
          />
          <Pressable
            style={styles.primaryBtn}
            disabled={busy || otp.length !== 4}
            onPress={() => action(() => proApi.verifyOtp(job.id, otp))}
          >
            <Text style={styles.primaryText}>Verify OTP</Text>
          </Pressable>
        </View>
      ) : null}

      {actions?.work_in_progress ? (
        <Pressable style={styles.primaryBtn} disabled={busy} onPress={() => action(() => proApi.autoComplete(job.id))}>
          {busy ? <ActivityIndicator color="#1A1A2E" /> : <Text style={styles.primaryText}>Complete service</Text>}
        </Pressable>
      ) : null}

      {actions?.complete_job ? (
        <Pressable
          style={styles.primaryBtn}
          disabled={busy}
          onPress={() => action(() => proApi.prepareCompletion(job.id), 'Opening payment collection...')}
        >
          <Text style={styles.primaryText}>Collect payment</Text>
        </Pressable>
      ) : null}

      {actions?.collect_payment ? (
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('ProCompletionDetail', { bookingId: job.id })}>
          <Text style={styles.secondaryText}>Go to payment collection</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 20, backgroundColor: '#F5F5F7' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  service: { fontSize: 20, fontWeight: '800', color: BRAND.ink },
  meta: { fontSize: 14, color: BRAND.muted, marginTop: 6 },
  callBtn: {
    flexDirection: 'row',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 14,
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callText: { color: '#fff', fontWeight: '700' },
  section: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 10 },
  timeline: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E5E7EB' },
  dotDone: { backgroundColor: '#059669' },
  dotActive: { backgroundColor: '#FFD600' },
  stepLabel: { fontSize: 13, color: BRAND.muted, fontWeight: '600' },
  stepActive: { color: BRAND.ink, fontWeight: '800' },
  timerCard: { backgroundColor: '#1A1A2E', borderRadius: 16, padding: 16, marginBottom: 16 },
  timerTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },
  timerValue: { color: '#FFD600', fontSize: 28, fontWeight: '800', marginTop: 6 },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#FFD600' },
  otpCard: { marginBottom: 16 },
  otpInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 8,
    textAlign: 'center',
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#FFD600',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryText: { fontWeight: '800', color: '#1A1A2E', fontSize: 15 },
  secondaryBtn: {
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1A2E',
    marginBottom: 10,
  },
  secondaryText: { fontWeight: '800', color: '#1A1A2E' },
});
