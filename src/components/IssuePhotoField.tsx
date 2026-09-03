import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../config';
import KeyboardTextInput from './KeyboardTextInput';
import { PickedPhoto, pickIssuePhotoFromGallery, takeIssuePhotoWithCamera } from '../utils/profilePhoto';

type Props = {
  photo: PickedPhoto | null;
  note: string;
  onPhoto: (photo: PickedPhoto | null) => void;
  onNote: (note: string) => void;
};

export default function IssuePhotoField({ photo, note, onPhoto, onNote }: Props) {
  const [busy, setBusy] = useState(false);

  const run = async (fn: () => Promise<PickedPhoto | null>) => {
    setBusy(true);
    try {
      const next = await fn();
      if (next) onPhoto(next);
    } catch (e) {
      Alert.alert('Photo failed', e instanceof Error ? e.message : 'Could not read this photo. Try another image.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>Photo of the issue</Text>
      <View style={styles.card}>
        <Text style={styles.title}>Kharab / damaged item</Text>
        <Text style={styles.hint}>
          Optional — upload a photo of the thing that is broken or not working, so the professional knows what to fix.
        </Text>

        {photo?.uri ? (
          <View style={styles.previewWrap}>
            <Image source={{ uri: photo.uri }} style={styles.preview} />
            <Pressable style={styles.removeBtn} onPress={() => onPhoto(null)}>
              <Ionicons name="close-circle" size={22} color="#fff" />
              <Text style={styles.removeText}>Remove</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.placeholder}>
            {busy ? (
              <ActivityIndicator color={BRAND.primary} />
            ) : (
              <Ionicons name="image-outline" size={32} color={BRAND.primary} />
            )}
            <Text style={styles.placeholderText}>No photo selected</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <Pressable
            style={styles.actionBtn}
            disabled={busy}
            onPress={() => run(takeIssuePhotoWithCamera)}
          >
            <Ionicons name="camera-outline" size={18} color={BRAND.primary} />
            <Text style={styles.actionText}>Camera</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            disabled={busy}
            onPress={() => run(pickIssuePhotoFromGallery)}
          >
            <Ionicons name="images-outline" size={18} color={BRAND.primary} />
            <Text style={styles.actionText}>Gallery</Text>
          </Pressable>
        </View>

        <KeyboardTextInput
          style={styles.note}
          placeholder="What is wrong? e.g. AC not cooling, tap leaking…"
          placeholderTextColor={BRAND.light}
          value={note}
          onChangeText={onNote}
          multiline
          maxLength={500}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: BRAND.ink,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    borderWidth: 1.5,
    borderColor: BRAND.primary,
    borderStyle: 'dashed',
    borderRadius: 18,
    backgroundColor: '#FFF5F8',
    padding: 14,
  },
  title: { fontSize: 15, fontWeight: '800', color: BRAND.ink, marginBottom: 4 },
  hint: { fontSize: 12, color: BRAND.muted, marginBottom: 12, lineHeight: 17 },
  previewWrap: { borderRadius: 14, overflow: 'hidden', marginBottom: 10 },
  preview: { width: '100%', height: 180, backgroundColor: BRAND.lavender },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  placeholder: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: BRAND.canvas,
    borderRadius: 14,
    marginBottom: 10,
  },
  placeholderText: { fontSize: 13, fontWeight: '600', color: BRAND.muted },
  btnRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BRAND.canvas,
    borderWidth: 1,
    borderColor: BRAND.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionText: { fontSize: 13, fontWeight: '800', color: BRAND.primary },
  note: {
    minHeight: 64,
    borderWidth: 1,
    borderColor: BRAND.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: BRAND.canvas,
    color: BRAND.ink,
    fontSize: 14,
    textAlignVertical: 'top',
  },
});
