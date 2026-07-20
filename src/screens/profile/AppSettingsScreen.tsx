import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import { AppLanguage, languageLabel, LANGUAGES, useLocale } from '../../context/LocaleContext';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function AppSettingsScreen() {
  const pad = useScreenPadding();
  const { settings, updateSettings } = useProfile();
  const { language, setLanguage, t } = useLocale();
  const { showSuccess } = useFeedback();
  const [pickerOpen, setPickerOpen] = useState(false);

  const applyLanguage = async (code: AppLanguage) => {
    setPickerOpen(false);
    await setLanguage(code);
    showSuccess(t('settings.languageSaved'), t('settings.languageSavedSub'));
  };

  return (
    <>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
        {[
          { key: 'pushNotifications' as const, title: t('settings.push'), sub: t('settings.pushSub') },
          { key: 'smsAlerts' as const, title: t('settings.sms'), sub: t('settings.smsSub') },
        ].map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <Switch
              value={settings[item.key]}
              onValueChange={(v) => updateSettings({ [item.key]: v })}
              trackColor={{ true: BRAND.primary, false: BRAND.border }}
            />
          </View>
        ))}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('settings.language')}</Text>
            <Text style={styles.sub}>{languageLabel(language)}</Text>
          </View>
          <Pressable onPress={() => setPickerOpen(true)} hitSlop={8}>
            <Text style={styles.link}>{t('settings.change')}</Text>
          </Pressable>
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('settings.version')}</Text>
            <Text style={styles.sub}>Front Door v2.0.0</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('settings.language')}</Text>
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  style={[styles.langRow, active && styles.langRowActive]}
                  onPress={() => applyLanguage(lang.code)}
                >
                  <View>
                    <Text style={[styles.langLabel, active && styles.langLabelActive]}>{lang.native}</Text>
                    <Text style={styles.langSub}>{lang.label}</Text>
                  </View>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })}
            <Pressable style={styles.modalCancel} onPress={() => setPickerOpen(false)}>
              <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: BRAND.canvas, borderRadius: 18, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: BRAND.border },
  title: { fontWeight: '800', fontSize: 15 },
  sub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  link: { color: BRAND.primary, fontWeight: '800', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginBottom: 12 },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  langRowActive: { borderColor: BRAND.primary, backgroundColor: BRAND.lavender },
  langLabel: { fontSize: 16, fontWeight: '800', color: BRAND.ink },
  langLabelActive: { color: BRAND.primary },
  langSub: { fontSize: 12, color: BRAND.muted, marginTop: 2 },
  check: { fontSize: 18, fontWeight: '800', color: BRAND.primary },
  modalCancel: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  modalCancelText: { color: BRAND.muted, fontWeight: '700' },
});
