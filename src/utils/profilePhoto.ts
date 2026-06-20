import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export type PickedPhoto = {
  uri: string;
  name: string;
  type: string;
};

async function ensureLibraryPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow photo library access to choose a profile picture.');
    return false;
  }
  return true;
}

async function ensureCameraPermission(): Promise<boolean> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow camera access to take a profile picture.');
    return false;
  }
  return true;
}

function toPickedPhoto(asset: ImagePicker.ImagePickerAsset): PickedPhoto {
  const ext = asset.uri.split('.').pop()?.toLowerCase();
  const type = ext === 'png' ? 'image/png' : 'image/jpeg';
  return {
    uri: asset.uri,
    name: `avatar.${ext === 'png' ? 'png' : 'jpg'}`,
    type,
  };
}

export async function pickProfilePhotoFromGallery(): Promise<PickedPhoto | null> {
  if (!(await ensureLibraryPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return null;
  return toPickedPhoto(result.assets[0]);
}

export async function takeProfilePhotoWithCamera(): Promise<PickedPhoto | null> {
  if (!(await ensureCameraPermission())) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });

  if (result.canceled || !result.assets[0]) return null;
  return toPickedPhoto(result.assets[0]);
}

export function showProfilePhotoPicker(
  onCamera: () => void,
  onGallery: () => void,
): void {
  Alert.alert('Profile Photo', 'Choose how you want to set your photo', [
    { text: 'Take Photo', onPress: onCamera },
    { text: 'Choose from Gallery', onPress: onGallery },
    { text: 'Cancel', style: 'cancel' },
  ]);
}
