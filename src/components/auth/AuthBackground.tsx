import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  accent?: string;
};

/** Web auth-ref-page background (#F5F5F7) */
export default function AuthBackground({ accent = '#E91E63' }: Props) {
  return (
    <>
      <View style={styles.base} />
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F5F5F7',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
