import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Booking } from '../api/client';
import { BRAND } from '../config';

type Props = {
  visible: boolean;
  booking: Booking | null;
  onRate: () => void;
  onLater: () => void;
};

export default function ServiceCompleteModal({ visible, booking, onRate, onLater }: Props) {
  if (!booking) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onLater}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient colors={['#ECFDF5', '#FFFFFF']} style={styles.inner}>
            <View style={styles.iconWrap}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.iconCircle}>
                <Ionicons name="checkmark" size={48} color="#fff" />
              </LinearGradient>
            </View>

            <Text style={styles.thanks}>Thank you!</Text>
            <Text style={styles.title}>Service completed</Text>
            <Text style={styles.sub}>
              Your {booking.service || 'service'} has been completed successfully. We hope you had a great experience!
            </Text>

            {booking.professional ? (
              <View style={styles.proRow}>
                <View style={styles.proAvatar}>
                  <Text style={styles.proInitial}>{booking.professional[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.proLabel}>Service partner</Text>
                  <Text style={styles.proName}>{booking.professional}</Text>
                </View>
                <Ionicons name="star" size={20} color={BRAND.gold} />
              </View>
            ) : null}

            <Pressable onPress={onRate} style={styles.rateWrap}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.rateBtn}>
                <Ionicons name="star" size={20} color="#fff" />
                <Text style={styles.rateText}>Rate your experience</Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={onLater} style={styles.laterBtn}>
              <Text style={styles.laterText}>Maybe later</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  inner: { padding: 28, alignItems: 'center' },
  iconWrap: { marginBottom: 16 },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thanks: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: BRAND.ink,
    marginTop: 4,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  proRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  proAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: BRAND.lavender,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proInitial: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  proLabel: { fontSize: 11, color: BRAND.muted, fontWeight: '600' },
  proName: { fontSize: 15, fontWeight: '800', color: BRAND.ink },
  rateWrap: { alignSelf: 'stretch' },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  rateText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  laterBtn: { paddingVertical: 14 },
  laterText: { fontSize: 14, fontWeight: '600', color: BRAND.muted },
});
