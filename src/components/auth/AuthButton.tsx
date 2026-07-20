import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { BRAND } from '../../config';

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  style?: ViewStyle;
  showArrow?: boolean;
};

/** Web auth-ref-submit — yellow primary CTA */
export default function AuthButton({ label, onPress, loading, style, showArrow = true }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || !onPress}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
    >
      {loading ? (
        <ActivityIndicator color={BRAND.ink} />
      ) : (
        <>
          <Text style={styles.text}>{label}</Text>
          {showArrow && <Ionicons name="arrow-forward" size={18} color={BRAND.ink} />}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 52,
    borderRadius: 12,
    backgroundColor: '#FFD600',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    shadowColor: '#FFD600',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  text: {
    fontSize: 15,
    fontWeight: '800',
    color: BRAND.ink,
  },
});
