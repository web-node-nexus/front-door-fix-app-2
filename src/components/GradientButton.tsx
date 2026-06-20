import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { BRAND } from '../config';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  style?: ViewStyle;
  small?: boolean;
};

export default function GradientButton({ label, onPress, loading, style, small }: Props) {
  return (
    <Pressable onPress={onPress} disabled={loading || !onPress} style={({ pressed }) => [styles.wrap, style, pressed && { opacity: 0.9 }]}>
      <LinearGradient colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.grad, small && styles.gradSmall]}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, small && styles.textSmall]}>{label}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, overflow: 'hidden', shadowColor: BRAND.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  grad: { paddingVertical: 16, alignItems: 'center' },
  gradSmall: { paddingVertical: 10, paddingHorizontal: 16 },
  text: { color: '#fff', fontWeight: '800', fontSize: 16 },
  textSmall: { fontSize: 13 },
});
