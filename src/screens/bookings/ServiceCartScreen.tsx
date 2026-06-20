import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../../config';
import { useCart } from '../../context/CartContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';
import { durationLabel } from '../../utils/serviceImagery';

export default function ServiceCartScreen() {
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const pad = useScreenPadding({ extraBottom: 100 });
  const { items, itemCount, totalAmount, updateQuantity, removeItem } = useCart();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backBtn} onPress={() => nav.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color={BRAND.ink} />
        </Pressable>
        <Text style={styles.headerTitle}>Your cart</Text>
        <View style={styles.headerSpacer} />
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={56} color={BRAND.light} />
          <Text style={styles.emptyTitle}>Cart is empty</Text>
          <Text style={styles.emptySub}>Add services from Book a Service page</Text>
          <Pressable onPress={() => nav.navigate('Services')}>
            <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Browse services</Text>
            </LinearGradient>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={[styles.list, { paddingBottom: pad.paddingBottom }]}>
            <Text style={styles.sectionLabel}>
              {itemCount} {itemCount === 1 ? 'service' : 'services'} selected
            </Text>
            {items.map((item) => (
              <View key={item.service.id} style={styles.item}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.service.name}</Text>
                  {item.service.category?.name ? (
                    <Text style={styles.itemCat}>{item.service.category.name}</Text>
                  ) : null}
                  <Text style={styles.itemMeta}>
                    {durationLabel(item.service.duration_hours)} · ₹{Number(item.service.price).toLocaleString('en-IN')} each
                  </Text>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemTotal}>
                    ₹{(Number(item.service.price) * item.quantity).toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => updateQuantity(item.service.id, item.quantity - 1)}
                    >
                      <Ionicons name="remove" size={16} color={BRAND.primary} />
                    </Pressable>
                    <Text style={styles.qty}>{item.quantity}</Text>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => updateQuantity(item.service.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={BRAND.primary} />
                    </Pressable>
                  </View>
                  <Pressable onPress={() => removeItem(item.service.id)} hitSlop={8}>
                    <Text style={styles.remove}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            <View style={styles.billCard}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item total</Text>
                <Text style={styles.billValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Taxes & fees</Text>
                <Text style={styles.billFree}>Included</Text>
              </View>
              <View style={[styles.billRow, styles.billTotal]}>
                <Text style={styles.billTotalLabel}>To pay</Text>
                <Text style={styles.billTotalValue}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View>
              <Text style={styles.footerLabel}>₹{totalAmount.toLocaleString('en-IN')}</Text>
              <Text style={styles.footerSub}>{itemCount} services · taxes included</Text>
            </View>
            <Pressable onPress={() => nav.navigate('CartCheckout')}>
              <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={styles.checkoutBtn}>
                <Text style={styles.checkoutText}>Select slot & book</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BRAND.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: BRAND.canvas,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BRAND.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: BRAND.ink },
  headerSpacer: { width: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginTop: 8 },
  emptySub: { fontSize: 14, color: BRAND.muted, textAlign: 'center' },
  emptyBtn: { marginTop: 16, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  list: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: BRAND.muted, marginBottom: 12 },
  item: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '800', color: BRAND.ink, lineHeight: 22 },
  itemCat: { fontSize: 12, fontWeight: '700', color: BRAND.primary, marginTop: 4 },
  itemMeta: { fontSize: 12, color: BRAND.muted, marginTop: 6 },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  itemTotal: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.lavender,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: BRAND.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { minWidth: 22, textAlign: 'center', fontSize: 14, fontWeight: '800', color: BRAND.primary },
  remove: { fontSize: 12, fontWeight: '700', color: BRAND.muted },
  billCard: {
    backgroundColor: BRAND.canvas,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  billLabel: { fontSize: 14, color: BRAND.muted, fontWeight: '600' },
  billValue: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
  billFree: { fontSize: 14, fontWeight: '700', color: BRAND.success },
  billTotal: { marginTop: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: BRAND.border, marginBottom: 0 },
  billTotalLabel: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  billTotalValue: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: BRAND.canvas,
    borderTopWidth: 1,
    borderTopColor: BRAND.border,
  },
  footerLabel: { fontSize: 20, fontWeight: '800', color: BRAND.ink },
  footerSub: { fontSize: 12, color: BRAND.muted, fontWeight: '600', marginTop: 2 },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkoutText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
