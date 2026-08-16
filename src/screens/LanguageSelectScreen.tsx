import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import { AppLanguage, LANGUAGES, useLocale } from '../context/LocaleContext';

type Props = {
  onDone: () => void;
};

export default function LanguageSelectScreen({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const { language, setLanguage } = useLocale();
  const [selected, setSelected] = useState<AppLanguage>(language);
  const [saving, setSaving] = useState(false);

  const continueNext = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await setLanguage(selected);
      onDone();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <LinearGradient
        colors={['#FFF5F8', '#FFFFFF', '#F8F9FC']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.hero}>
        <View style={styles.badge}>
          <Ionicons name="language" size={22} color={BRAND.primary} />
        </View>
        <Text style={styles.title}>Choose your language</Text>
        <Text style={styles.subtitle}>अपनी भाषा चुनें · तुमची भाषा निवडा</Text>
        <Text style={styles.hint}>You can change this later in App Settings</Text>
      </View>

      <View style={styles.list}>
        {LANGUAGES.map((lang) => {
          const active = selected === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => setSelected(lang.code)}
              style={[styles.row, active && styles.rowActive]}
            >
              <View style={styles.rowText}>
                <Text style={[styles.native, active && styles.nativeActive]}>{lang.native}</Text>
                <Text style={styles.label}>{lang.label}</Text>
              </View>
              <View style={[styles.check, active && styles.checkActive]}>
                {active ? <Ionicons name="checkmark" size={16} color="#fff" /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={continueNext}
        disabled={saving}
        style={({ pressed }) => [styles.ctaWrap, pressed && { opacity: 0.92 }, saving && { opacity: 0.7 }]}
      >
        <LinearGradient colors={[BRAND.primary, BRAND.primaryDark]} style={styles.cta}>
          <Text style={styles.ctaText}>{saving ? 'Saving…' : 'Continue'}</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BRAND.canvas,
    paddingHorizontal: 22,
  },
  hero: {
    marginTop: 28,
    marginBottom: 28,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFE4EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BRAND.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: BRAND.muted,
    fontWeight: '600',
  },
  hint: {
    marginTop: 10,
    fontSize: 13,
    color: BRAND.light,
  },
  list: {
    gap: 12,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BRAND.border,
  },
  rowActive: {
    borderColor: BRAND.primary,
    backgroundColor: '#FFF5F8',
  },
  rowText: {
    gap: 2,
  },
  native: {
    fontSize: 18,
    fontWeight: '700',
    color: BRAND.ink,
  },
  nativeActive: {
    color: BRAND.primaryDark,
  },
  label: {
    fontSize: 13,
    color: BRAND.muted,
    fontWeight: '500',
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: BRAND.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: {
    backgroundColor: BRAND.primary,
    borderColor: BRAND.primary,
  },
  ctaWrap: {
    marginTop: 12,
  },
  cta: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
});
