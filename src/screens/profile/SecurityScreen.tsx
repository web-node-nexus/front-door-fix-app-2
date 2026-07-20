import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { BRAND } from '../../config';
import { useFeedback } from '../../context/FeedbackContext';
import { useProfile } from '../../context/ProfileContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

export default function SecurityScreen() {
  const pad = useScreenPadding();
  const { settings, updateSettings } = useProfile();
  const { showSuccess, showWarning, showInfo } = useFeedback();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const savePassword = () => {
    if (!currentPass || !newPass || !confirmPass) {
      showWarning('Missing fields', 'Please fill all password fields.');
      return;
    }
    if (newPass.length < 6) {
      showWarning('Weak password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      showWarning('Mismatch', 'New password and confirm password must match.');
      return;
    }
    setPasswordOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    showSuccess('Password updated', 'Your password has been changed successfully.');
  };

  return (
    <>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
        {[
          { key: 'biometric' as const, title: 'Fingerprint Login', sub: 'Use fingerprint to sign in' },
          { key: 'faceId' as const, title: 'Face ID Login', sub: 'Use face recognition' },
          { key: 'twoFactor' as const, title: 'Two Factor Authentication', sub: 'Extra security for your account' },
        ].map((item) => (
          <View key={item.key} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.sub}>{item.sub}</Text>
            </View>
            <Switch
              value={settings[item.key]}
              onValueChange={(v) => {
                updateSettings({ [item.key]: v });
                showInfo(item.title, v ? 'Enabled successfully' : 'Disabled');
              }}
              trackColor={{ true: BRAND.primary, false: BRAND.border }}
            />
          </View>
        ))}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.sub}>Update your account password</Text>
          </View>
          <Pressable onPress={() => setPasswordOpen(true)} hitSlop={8}>
            <Text style={styles.link}>Change</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={passwordOpen} transparent animationType="fade" onRequestClose={() => setPasswordOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setPasswordOpen(false)}>
          <Pressable style={styles.modal} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current password"
              placeholderTextColor={BRAND.light}
              secureTextEntry
              value={currentPass}
              onChangeText={setCurrentPass}
            />
            <TextInput
              style={styles.input}
              placeholder="New password"
              placeholderTextColor={BRAND.light}
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor={BRAND.light}
              secureTextEntry
              value={confirmPass}
              onChangeText={setConfirmPass}
            />
            <Pressable style={styles.saveBtn} onPress={savePassword}>
              <Text style={styles.saveText}>Update Password</Text>
            </Pressable>
            <Pressable onPress={() => setPasswordOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
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
  link: { color: BRAND.primary, fontWeight: '800' },
  overlay: { flex: 1, backgroundColor: 'rgba(17,17,27,0.55)', justifyContent: 'center', padding: 24 },
  modal: { backgroundColor: '#fff', borderRadius: 24, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: BRAND.ink, marginBottom: 14 },
  input: {
    backgroundColor: BRAND.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    marginBottom: 10,
    fontSize: 15,
    color: BRAND.ink,
  },
  saveBtn: {
    backgroundColor: BRAND.primary,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveText: { color: '#fff', fontWeight: '800' },
  cancelText: { textAlign: 'center', color: BRAND.muted, fontWeight: '700', marginTop: 14 },
});
