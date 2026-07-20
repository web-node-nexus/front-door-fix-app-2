import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BRAND } from '../config';

export type FeedbackTone = 'success' | 'error' | 'info' | 'warning';

export type FeedbackAction = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type FeedbackConfig = {
  visible: boolean;
  tone?: FeedbackTone;
  title: string;
  message?: string;
  actions?: FeedbackAction[];
  onClose?: () => void;
};

const TONE_META: Record<
  FeedbackTone,
  {
    icon: keyof typeof Ionicons.glyphMap;
    colors: [string, string];
    badge: string;
    glow: string;
  }
> = {
  success: {
    icon: 'checkmark',
    colors: ['#10B981', '#059669'],
    badge: 'SUCCESS',
    glow: 'rgba(16, 185, 129, 0.22)',
  },
  error: {
    icon: 'close',
    colors: ['#EF4444', '#DC2626'],
    badge: 'ERROR',
    glow: 'rgba(239, 68, 68, 0.2)',
  },
  info: {
    icon: 'information',
    colors: [BRAND.primary, BRAND.purple],
    badge: 'UPDATED',
    glow: 'rgba(255, 45, 122, 0.18)',
  },
  warning: {
    icon: 'alert',
    colors: ['#F59E0B', '#D97706'],
    badge: 'NOTICE',
    glow: 'rgba(245, 158, 11, 0.2)',
  },
};

export default function PremiumFeedbackModal({
  visible,
  tone = 'success',
  title,
  message,
  actions,
  onClose,
}: FeedbackConfig) {
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const meta = TONE_META[tone];
  const buttons =
    actions && actions.length > 0
      ? actions
      : [{ label: 'Done', variant: 'primary' as const, onPress: onClose }];

  useEffect(() => {
    if (visible) {
      scale.setValue(0.86);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  const handleAction = (action: FeedbackAction) => {
    onClose?.();
    action.onPress?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.cardWrap, { opacity, transform: [{ scale }] }]}>
          <View style={styles.card}>
            <LinearGradient colors={['#FFFFFF', '#FBFBFE']} style={styles.inner}>
              <View style={[styles.glow, { backgroundColor: meta.glow }]} />

              <View style={styles.iconWrap}>
                <LinearGradient colors={meta.colors} style={styles.iconCircle}>
                  <Ionicons name={meta.icon} size={34} color="#fff" />
                </LinearGradient>
              </View>

              <Text style={[styles.badge, { color: meta.colors[0] }]}>{meta.badge}</Text>
              <Text style={styles.title}>{title}</Text>
              {message ? <Text style={styles.message}>{message}</Text> : null}

              <View style={styles.actions}>
                {buttons.map((action) => {
                  const variant = action.variant || 'primary';
                  if (variant === 'primary') {
                    return (
                      <Pressable
                        key={action.label}
                        style={styles.primaryWrap}
                        onPress={() => handleAction(action)}
                      >
                        <LinearGradient
                          colors={[BRAND.primary, '#E91E63']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.primaryBtn}
                        >
                          <Text style={styles.primaryText}>{action.label}</Text>
                        </LinearGradient>
                      </Pressable>
                    );
                  }
                  if (variant === 'secondary') {
                    return (
                      <Pressable
                        key={action.label}
                        style={styles.secondaryBtn}
                        onPress={() => handleAction(action)}
                      >
                        <Text style={styles.secondaryText}>{action.label}</Text>
                      </Pressable>
                    );
                  }
                  return (
                    <Pressable
                      key={action.label}
                      style={styles.ghostBtn}
                      onPress={() => handleAction(action)}
                    >
                      <Text style={styles.ghostText}>{action.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 17, 27, 0.58)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  cardWrap: {
    width: '100%',
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#1A1A2E',
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
  },
  inner: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: 'center',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.9,
  },
  iconWrap: {
    marginBottom: 16,
    shadowColor: BRAND.primary,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND.ink,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: BRAND.muted,
    textAlign: 'center',
    paddingHorizontal: 6,
  },
  actions: {
    width: '100%',
    marginTop: 22,
    gap: 10,
  },
  primaryWrap: {
    width: '100%',
  },
  primaryBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    backgroundColor: '#fff',
  },
  secondaryText: {
    color: BRAND.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  ghostBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ghostText: {
    color: BRAND.muted,
    fontSize: 14,
    fontWeight: '700',
  },
});
