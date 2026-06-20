import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../config';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  trailing?: 'chevron' | 'edit';
};

export default function ProfileMenuItem({ icon, iconBg, title, subtitle, onPress, trailing = 'chevron' }: Props) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.icon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={BRAND.primary} />
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
      </View>
      {trailing === 'edit' ? (
        <View style={styles.editChip}>
          <Ionicons name="pencil" size={13} color={BRAND.primary} />
          <Text style={styles.editText}>Edit</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color={BRAND.light} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  title: { fontSize: 14, fontWeight: '700', color: BRAND.ink },
  sub: { fontSize: 11, color: BRAND.muted, marginTop: 2 },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.lavender,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  editText: { fontSize: 12, fontWeight: '800', color: BRAND.primary },
});
