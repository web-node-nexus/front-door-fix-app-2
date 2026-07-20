import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { LOGO } from '../constants/assets';
import { BRAND } from '../config';

type Props = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: Props) {
  const fade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoY = useRef(new Animated.Value(30)).current;
  const ringScale = useRef(new Animated.Value(0.7)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const tagOpacity = useRef(new Animated.Value(0)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitScale = useRef(new Animated.Value(1)).current;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    // Run splash once — never restart when parent re-renders (auth/onboarding).
    const anim = Animated.sequence([
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 7, tension: 70, useNativeDriver: true }),
        Animated.timing(logoY, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ringOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.spring(ringScale, { toValue: 1, friction: 6, useNativeDriver: true }),
        Animated.timing(tagOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(barWidth, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      Animated.parallel([
        Animated.timing(exitOpacity, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(exitScale, { toValue: 1.04, duration: 380, useNativeDriver: true }),
      ]),
    ]);
    anim.start(({ finished }) => {
      if (finished) onFinishRef.current();
    });
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only
  }, []);

  const progress = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <Animated.View style={[styles.root, { opacity: exitOpacity, transform: [{ scale: exitScale }] }]}>
      <LinearGradient
        colors={['#FFFFFF', '#FFF5F9', '#FDF4FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <Animated.View style={[styles.orb, styles.orb1, { opacity: fade }]} />
      <Animated.View style={[styles.orb, styles.orb2, { opacity: fade }]} />

      <Animated.View style={[styles.content, { opacity: fade }]}>
        <View style={styles.logoStage}>
          <Animated.View
            style={[
              styles.glow,
              { opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]}
          />
          <Animated.View
            style={[
              styles.logoWrap,
              { transform: [{ scale: logoScale }, { translateY: logoY }] },
            ]}
          >
            <Image source={LOGO} style={styles.logo} resizeMode="contain" />
          </Animated.View>
        </View>

        <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
          Premium home services at your doorstep
        </Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, { width: progress }]}>
            <LinearGradient
              colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  orb: { position: 'absolute', borderRadius: 999 },
  orb1: { width: 240, height: 240, top: -70, right: -80, backgroundColor: 'rgba(255,45,122,0.1)' },
  orb2: { width: 200, height: 200, bottom: 100, left: -70, backgroundColor: 'rgba(232,121,249,0.1)' },
  logoStage: { width: 280, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,45,122,0.08)',
  },
  logoWrap: {
    width: 240,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 240, height: 140 },
  tagline: {
    fontSize: 14,
    color: BRAND.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
    fontWeight: '600',
  },
  barTrack: {
    width: 160,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(255,45,122,0.1)',
    marginTop: 32,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 4, overflow: 'hidden' },
});
