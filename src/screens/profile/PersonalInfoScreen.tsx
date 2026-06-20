import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ProfileAvatar from '../../components/ProfileAvatar';
import { BRAND } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useScreenPadding } from '../../hooks/useScreenPadding';

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

export default function PersonalInfoScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const pad = useScreenPadding();
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(Boolean(route.params?.edit));
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email] = useState(user?.email || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (route.params?.edit) {
      setEditing(true);
    }
  }, [route.params?.edit]);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
  }, [user?.name, user?.phone]);

  const cancelEdit = () => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setEditing(false);
  };

  useLayoutEffect(() => {
    nav.setOptions({
      headerRight: () => (
        editing ? (
          <Pressable onPress={cancelEdit} hitSlop={10} style={styles.headerAction}>
            <Text style={styles.headerCancel}>Cancel</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => setEditing(true)} hitSlop={10} style={styles.headerEdit}>
            <Ionicons name="pencil" size={15} color={BRAND.primary} />
            <Text style={styles.headerEditText}>Edit</Text>
          </Pressable>
        )
      ),
    });
  }, [nav, editing, user?.name, user?.phone]);

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        name: trimmedName,
        phone: phone.trim() || undefined,
      });
      setEditing(false);
      Alert.alert('Saved', 'Your personal information has been updated.');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingBottom: pad.paddingBottom }]}>
      <View style={styles.avatarSection}>
        <ProfileAvatar name={name || user?.name || 'User'} avatar={user?.avatar} size={96} />
        <Text style={styles.avatarHint}>Tap camera to take photo or choose from gallery</Text>
      </View>

      {editing ? (
        <>
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={BRAND.light}
              autoCapitalize="words"
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              placeholderTextColor={BRAND.light}
              keyboardType="phone-pad"
              editable={!saving}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
            <Text style={styles.hint}>Email cannot be changed from the app.</Text>
          </View>

          <Pressable style={[styles.btn, saving && styles.btnDisabled]} onPress={save} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Save Changes</Text>
            )}
          </Pressable>
        </>
      ) : (
        <View style={styles.infoCard}>
          <InfoRow label="Name" value={name || user?.name || ''} />
          <View style={styles.divider} />
          <InfoRow label="Phone" value={phone || user?.phone || 'Not added'} />
          <View style={styles.divider} />
          <InfoRow label="Email" value={email || user?.email || ''} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, backgroundColor: BRAND.surface },
  headerEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 16,
    backgroundColor: BRAND.lavender,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  headerEditText: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  headerAction: { marginRight: 16 },
  headerCancel: { fontSize: 14, fontWeight: '700', color: BRAND.muted },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatarHint: { marginTop: 12, fontSize: 12, color: BRAND.muted, textAlign: 'center' },
  infoCard: {
    backgroundColor: BRAND.canvas,
    borderRadius: 18,
    padding: 4,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  infoRow: { paddingHorizontal: 16, paddingVertical: 14 },
  infoLabel: { fontSize: 12, fontWeight: '700', color: BRAND.muted, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: '700', color: BRAND.ink },
  divider: { height: 1, backgroundColor: BRAND.border, marginHorizontal: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: BRAND.muted, marginBottom: 8 },
  input: {
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.border,
    fontSize: 15,
    color: BRAND.ink,
  },
  inputDisabled: {
    backgroundColor: BRAND.surface,
    color: BRAND.muted,
  },
  hint: { fontSize: 11, color: BRAND.light, marginTop: 6 },
  btn: {
    backgroundColor: BRAND.primary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: '800' },
});
