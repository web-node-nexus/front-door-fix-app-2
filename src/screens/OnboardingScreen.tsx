import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ONBOARDING_SLIDES } from '../constants/assets';
import { BRAND } from '../config';

const { width: SCREEN_W } = Dimensions.get('window');
const IMAGE_H = Math.min(340, SCREEN_W * 0.82);

type Props = {
  onDone: () => void;
};

type Slide = (typeof ONBOARDING_SLIDES)[number];

function SlideItem({ item, index, scrollX }: { item: Slide; index: number; scrollX: Animated.Value }) {
  const inputRange = [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W];
  const imageScale = scrollX.interpolate({
    inputRange,
    outputRange: [0.88, 1, 0.88],
    extrapolate: 'clamp',
  });
  const imageOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });
  const textY = scrollX.interpolate({
    inputRange,
    outputRange: [28, 0, 28],
    extrapolate: 'clamp',
  });
  const textOpacity = scrollX.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.imageFrame,
          { opacity: imageOpacity, transform: [{ scale: imageScale }] },
        ]}
      >
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.95)']}
          style={styles.imageFade}
        />
        <View style={[styles.accentDot, { backgroundColor: item.accent }]} />
      </Animated.View>

      <Animated.View style={{ opacity: textOpacity, transform: [{ translateY: textY }] }}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) setIndex(viewableItems[0].index);
  }).current;

  function goNext() {
    if (isLast) {
      onDone();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#FFF5F9', '#FDF4FF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={onDone} hitSlop={12}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES as unknown as Slide[]}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        renderItem={({ item, index: i }) => (
          <SlideItem item={item} index={i} scrollX={scrollX} />
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots}>
          {ONBOARDING_SLIDES.map((slide, i) => {
            const inputRange = [(i - 1) * SCREEN_W, i * SCREEN_W, (i + 1) * SCREEN_W];
            const dotW = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.35, 1, 0.35],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={slide.title}
                style={[
                  styles.dot,
                  { width: dotW, opacity: dotOpacity, backgroundColor: BRAND.primary },
                ]}
              />
            );
          })}
        </View>

        <Pressable style={({ pressed }) => [pressed && { opacity: 0.92 }]} onPress={goNext}>
          <LinearGradient
            colors={[BRAND.primary, BRAND.primaryLight, BRAND.purple]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Next'}</Text>
            <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  topBar: { paddingHorizontal: 24, alignItems: 'flex-end', zIndex: 2 },
  skip: { fontSize: 14, fontWeight: '700', color: BRAND.muted },
  slide: {
    width: SCREEN_W,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrame: {
    width: SCREEN_W - 48,
    height: IMAGE_H,
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 28,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  image: { width: '100%', height: '100%' },
  imageFade: { ...StyleSheet.absoluteFillObject },
  accentDot: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: BRAND.ink,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: BRAND.muted,
    textAlign: 'center',
    paddingHorizontal: 8,
    maxWidth: 320,
    alignSelf: 'center',
  },
  footer: { paddingHorizontal: 24, gap: 22 },
  dots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: BRAND.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
