import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Service } from '../api/client';
import { BRAND } from '../config';
import { useCart } from '../context/CartContext';
import { durationLabel } from '../utils/serviceImagery';

type Props = {
  service: Service;
  onPress?: () => void;
};

export default function ServiceListItem({ service, onPress }: Props) {
  const { getQuantity, addItem, updateQuantity } = useCart();
  const qty = getQuantity(service.id);
  const price = Number(service.price);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{service.name}</Text>
        {service.description ? (
          <Text style={styles.desc} numberOfLines={2}>{service.description}</Text>
        ) : (
          <Text style={styles.desc} numberOfLines={1}>
            {durationLabel(service.duration_hours)} · Verified professionals
          </Text>
        )}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{price.toLocaleString('en-IN')}</Text>
          {service.duration_hours ? (
            <Text style={styles.duration}>{durationLabel(service.duration_hours)}</Text>
          ) : null}
        </View>
      </View>

      {qty > 0 ? (
        <View style={styles.stepper}>
          <Pressable
            style={styles.stepBtn}
            onPress={() => updateQuantity(service.id, qty - 1)}
            hitSlop={6}
          >
            <Ionicons name="remove" size={18} color={BRAND.primary} />
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            style={styles.stepBtn}
            onPress={() => updateQuantity(service.id, qty + 1)}
            hitSlop={6}
          >
            <Ionicons name="add" size={18} color={BRAND.primary} />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => addItem(service)}>
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '800', color: BRAND.ink, lineHeight: 22 },
  desc: { fontSize: 13, color: BRAND.muted, marginTop: 4, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  price: { fontSize: 15, fontWeight: '800', color: BRAND.ink },
  duration: { fontSize: 12, color: BRAND.muted, fontWeight: '600' },
  addBtn: {
    minWidth: 72,
    height: 36,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BRAND.canvas,
  },
  addText: { fontSize: 14, fontWeight: '800', color: BRAND.primary },
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
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: BRAND.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: {
    minWidth: 24,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: BRAND.primary,
  },
});
