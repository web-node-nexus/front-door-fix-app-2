import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { BRAND } from '../config';

type Props = { children: React.ReactNode; onPress?: () => void; style?: ViewStyle };

export default function AppCard({ children, onPress, style }: Props) {
  const inner = <View style={[styles.card, style]}>{children}</View>;
  if (onPress) return <Pressable onPress={onPress}>{inner}</Pressable>;
  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: BRAND.canvas,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
});
