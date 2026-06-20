import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BRAND } from '../config';
import { useAuth } from '../context/AuthContext';
import { userAvatarUrl } from '../utils/avatarUrl';
import {
  pickProfilePhotoFromGallery,
  showProfilePhotoPicker,
  takeProfilePhotoWithCamera,
} from '../utils/profilePhoto';

type Props = {
  name: string;
  avatar?: string | null;
  size?: number;
  showCamera?: boolean;
};

export default function ProfileAvatar({ name, avatar, size = 72, showCamera = true }: Props) {
  const { updateAvatar } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const photoUrl = userAvatarUrl(avatar);
  const radius = size / 2;

  React.useEffect(() => {
    setImageFailed(false);
  }, [avatar, photoUrl]);

  const uploadPhoto = async (source: 'camera' | 'gallery') => {
    const picked = source === 'camera'
      ? await takeProfilePhotoWithCamera()
      : await pickProfilePhotoFromGallery();

    if (!picked) return;

    setUploading(true);
    try {
      await updateAvatar(picked);
      Alert.alert('Photo updated', 'Your profile photo has been saved.');
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not update profile photo.');
    } finally {
      setUploading(false);
    }
  };

  const onPickPhoto = () => {
    if (uploading) return;
    showProfilePhotoPicker(
      () => uploadPhoto('camera'),
      () => uploadPhoto('gallery'),
    );
  };

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {photoUrl && !imageFailed ? (
        <Image
          source={{ uri: photoUrl }}
          style={[styles.photo, { width: size, height: size, borderRadius: radius }]}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <LinearGradient colors={[BRAND.primary, BRAND.purple]} style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
          <Text style={[styles.fallbackText, { fontSize: size * 0.38 }]}>{name[0]?.toUpperCase() || 'U'}</Text>
        </LinearGradient>
      )}

      {uploading && (
        <View style={[styles.overlay, { width: size, height: size, borderRadius: radius }]}>
          <ActivityIndicator color="#fff" />
        </View>
      )}

      {showCamera && (
        <Pressable style={styles.camBtn} onPress={onPickPhoto} disabled={uploading}>
          <Ionicons name="camera" size={12} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  photo: { backgroundColor: BRAND.lavender },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#fff', fontWeight: '800' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camBtn: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
