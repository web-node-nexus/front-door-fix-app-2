import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { BRAND } from '../../config';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  heroImage?: number;
  heroBadge?: string;
};

/** White auth card — matches web auth-ref-card */
export default function AuthCard({ children, style, heroImage, heroBadge }: Props) {
  return (
    <View style={[styles.card, style]}>
      {heroImage ? (
        <View style={styles.heroWrap}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
          {heroBadge ? (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{heroBadge}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
  },
  heroWrap: {
    height: 140,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primary,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },
});
