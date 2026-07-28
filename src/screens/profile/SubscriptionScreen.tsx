import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import {
  PremiumPayMethod,
  PremiumPlanId,
  useProfile,
} from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

const PERKS = [
  'Exclusive offers & deals',
  'Priority customer support',
  'Special member discounts',
  'Free cancellation on bookings',
  '2x reward points on every order',
];

const PLANS: {
  id: PremiumPlanId;
  label: string;
  amount: number;
  period: string;
  save?: string;
  popular?: boolean;
}[] = [
  { id: 'monthly', label: 'Monthly', amount: 99, period: '/month' },
  { id: 'yearly', label: 'Yearly', amount: 999, period: '/year', save: 'Best value', popular: true },
];

const PAY_METHODS: {
  id: PremiumPayMethod;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  hint: (wallet: number) => string;
}[] = [
  { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline', hint: () => 'GPay / PhonePe / Paytm' },
  { id: 'card', label: 'Card', icon: 'card-outline', hint: () => 'Credit / Debit card' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet-outline', hint: (w) => `Balance ₹${w.toLocaleString('en-IN')}` },
];

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function SubscriptionScreen() {
  const pad = useScreenPadding();
  const {
    isPremium,
    premiumPlan,
    premiumExpiresAt,
    walletBalance,
    purchasePremium,
  } = useProfile();
  const { showSuccess, showError } = useFeedback();

  const [planId, setPlanId] = useState<PremiumPlanId>('yearly');
  const [payMethod, setPayMethod] = useState<PremiumPayMethod>('upi');
  const [paying, setPaying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const selected = useMemo(() => PLANS.find((p) => p.id === planId)!, [planId]);

  const openCheckout = () => {
    if (isPremium) return;
    if (payMethod === 'wallet' && walletBalance < selected.amount) {
      showError(
        'Insufficient wallet',
        `Need ₹${selected.amount}. Wallet has ₹${walletBalance}. Choose UPI or Card.`,
      );
      return;
    }
    setConfirmOpen(true);
  };

  const confirmPay = async () => {
    setPaying(true);
    try {
      const res = await purchasePremium({
        planId: selected.id,
        amount: selected.amount,
        method: payMethod,
      });
      setConfirmOpen(false);
      if (!res.ok) {
        showError('Payment failed', res.error);
        return;
      }
      showSuccess(
        'Premium Purchased',
        `${selected.label} plan active till ${formatDate(res.expiresAt)}. Enjoy exclusive benefits!`,
      );
    } catch (e) {
      showError('Payment failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom + 28 }]}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['#F3E8FF', '#FDF4FF']} style={styles.banner}>
          <Ionicons name="diamond" size={40} color={BRAND.purple} />
          <Text style={styles.title}>
            {isPremium ? 'Premium Member' : 'Front Door Premium'}
          </Text>
          <Text style={styles.sub}>
            {isPremium
              ? `${premiumPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan · valid till ${
                  premiumExpiresAt ? formatDate(premiumExpiresAt) : '—'
                }`
              : 'Choose a plan and pay to unlock exclusive benefits'}
          </Text>
        </LinearGradient>

        {PERKS.map((p) => (
          <View key={p} style={styles.perk}>
            <Ionicons name="checkmark-circle" size={20} color={BRAND.success} />
            <Text style={styles.perkText}>{p}</Text>
          </View>
        ))}

        {isPremium ? (
          <View style={styles.activeCard}>
            <Ionicons name="shield-checkmark" size={22} color={BRAND.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeTitle}>Membership active</Text>
              <Text style={styles.activeSub}>
                Renews / expires on {premiumExpiresAt ? formatDate(premiumExpiresAt) : '—'}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.section}>1. Select plan</Text>
            <View style={styles.plans}>
              {PLANS.map((plan) => {
                const on = planId === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    onPress={() => setPlanId(plan.id)}
                    style={[styles.planCard, on && styles.planCardActive]}
                  >
                    {plan.popular ? (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    ) : null}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.planLabel}>{plan.label}</Text>
                      <Text style={styles.planPrice}>
                        ₹{plan.amount}
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      </Text>
                      {plan.save ? <Text style={styles.planSave}>{plan.save}</Text> : null}
                    </View>
                    <Ionicons
                      name={on ? 'radio-button-on' : 'radio-button-off'}
                      size={22}
                      color={on ? BRAND.primary : BRAND.light}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.section}>2. Payment method</Text>
            <View style={styles.payList}>
              {PAY_METHODS.map((m) => {
                const on = payMethod === m.id;
                const lowWallet = m.id === 'wallet' && walletBalance < selected.amount;
                return (
                  <Pressable
                    key={m.id}
                    onPress={() => setPayMethod(m.id)}
                    style={[styles.payRow, on && styles.payRowActive, lowWallet && styles.payRowWarn]}
                  >
                    <View style={[styles.payIcon, on && { backgroundColor: BRAND.lavender }]}>
                      <Ionicons name={m.icon} size={18} color={BRAND.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payLabel}>{m.label}</Text>
                      <Text style={styles.payHint}>{m.hint(walletBalance)}</Text>
                    </View>
                    <Ionicons
                      name={on ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={on ? BRAND.primary : BRAND.light}
                    />
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{selected.label} Premium</Text>
                <Text style={styles.summaryVal}>₹{selected.amount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Taxes</Text>
                <Text style={styles.summaryVal}>₹0</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotal]}>
                <Text style={styles.totalLabel}>Total payable</Text>
                <Text style={styles.totalVal}>₹{selected.amount}</Text>
              </View>
            </View>

            <Pressable
              onPress={openCheckout}
              style={({ pressed }) => [styles.btnWrap, pressed && { opacity: 0.9 }]}
              accessibilityRole="button"
              accessibilityLabel={`Pay ${selected.amount} for premium`}
            >
              <LinearGradient
                colors={[BRAND.purple, BRAND.primary]}
                style={styles.btn}
                pointerEvents="none"
              >
                <Text style={styles.btnText}>Pay ₹{selected.amount} · Buy Premium</Text>
              </LinearGradient>
            </Pressable>
            <Text style={styles.secureNote}>Secure checkout · Cancel anytime before renewing</Text>
          </>
        )}
      </ScrollView>

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => !paying && setConfirmOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="diamond" size={28} color={BRAND.purple} />
            <Text style={styles.modalTitle}>Confirm purchase</Text>
            <Text style={styles.modalBody}>
              Pay ₹{selected.amount} via {payMethod.toUpperCase()} for {selected.label.toLowerCase()} Premium?
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalCancel}
                disabled={paying}
                onPress={() => setConfirmOpen(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalPayWrap, paying && { opacity: 0.7 }]}
                disabled={paying}
                onPress={confirmPay}
              >
                <LinearGradient
                  colors={[BRAND.purple, BRAND.primary]}
                  style={styles.modalPay}
                  pointerEvents="none"
                >
                  {paying ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalPayText}>Pay now</Text>
                  )}
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  banner: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  title: { fontSize: 22, fontWeight: '800', marginTop: 12, color: BRAND.ink },
  sub: { fontSize: 14, color: BRAND.muted, marginTop: 6, textAlign: 'center', lineHeight: 20 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  perkText: { fontSize: 15, fontWeight: '600', color: BRAND.ink, flex: 1 },
  section: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND.ink,
    marginTop: 18,
    marginBottom: 10,
  },
  plans: { gap: 10 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    overflow: 'hidden',
  },
  planCardActive: { borderColor: BRAND.primary, backgroundColor: '#FFF5F8' },
  popularBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: BRAND.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderBottomLeftRadius: 10,
  },
  popularText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  planLabel: { fontSize: 13, fontWeight: '700', color: BRAND.muted },
  planPrice: { fontSize: 22, fontWeight: '800', color: BRAND.ink, marginTop: 2 },
  planPeriod: { fontSize: 13, fontWeight: '600', color: BRAND.muted },
  planSave: { fontSize: 12, fontWeight: '700', color: BRAND.success, marginTop: 4 },
  payList: { gap: 8 },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: BRAND.border,
  },
  payRowActive: { borderColor: BRAND.primary, backgroundColor: '#FFF5F8' },
  payRowWarn: { opacity: 0.85 },
  payIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payLabel: { fontSize: 14, fontWeight: '800', color: BRAND.ink },
  payHint: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  summary: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    gap: 10,
  },
  summaryTitle: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 14, color: BRAND.muted },
  summaryVal: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
    paddingTop: 10,
    marginTop: 2,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: BRAND.ink },
  totalVal: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  btnWrap: { marginTop: 20, borderRadius: 16, overflow: 'hidden' },
  btn: { borderRadius: 16, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  secureNote: {
    textAlign: 'center',
    fontSize: 12,
    color: BRAND.muted,
    marginTop: 12,
  },
  activeCard: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeTitle: { fontSize: 15, fontWeight: '800', color: BRAND.ink },
  activeSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 15, 30, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginTop: 12 },
  modalBody: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20, width: '100%' },
  modalCancel: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCancelText: { fontWeight: '700', color: BRAND.ink },
  modalPayWrap: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  modalPay: { paddingVertical: 14, alignItems: 'center', borderRadius: 14 },
  modalPayText: { color: '#fff', fontWeight: '800' },
});
