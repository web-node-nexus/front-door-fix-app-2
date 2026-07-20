import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../../config';

type Props = {
  title: string;
  subtitle?: string;
};

export default function AuthTitle({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.underline} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 22 },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND.ink,
    letterSpacing: -0.3,
  },
  underline: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: BRAND.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 20,
    color: BRAND.muted,
    marginTop: 4,
  },
});
