import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type PickedPhoto = {
  uri: string;
  name: string;
  type: string;
  /** Base64 payload without data: prefix — preferred upload method */
  base64?: string;
  ext?: string;
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

async function toPickedPhoto(asset: ImagePicker.ImagePickerAsset): Promise<PickedPhoto> {
  // Prefer JPEG for smaller reliable uploads on live servers
  const type = 'image/jpeg';
  const ext = 'jpg';
  let uri = asset.uri;

  if (Platform.OS === 'android') {
    const dest = `${FileSystem.cacheDirectory}avatar_${Date.now()}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      uri = dest;
    } catch {
      // keep original
    }
    if (!uri.startsWith('file://') && !uri.startsWith('content://')) {
      uri = `file://${uri}`;
    }
  }

  let base64 = typeof asset.base64 === 'string' && asset.base64.length > 0 ? asset.base64 : undefined;
  if (!base64) {
    try {
      base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch {
      base64 = undefined;
    }
  }

  if (!base64) {
    throw new Error('Could not read this photo. Please try another image.');
  }

  // Keep under common PHP post limits
  if (base64.length > 2_800_000) {
    throw new Error('Photo is too large. Please choose a smaller photo.');
  }

  return {
    uri,
    name: `avatar.${ext}`,
    type,
    base64,
    ext,
  };
}

const pickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.55,
  exif: false,
  base64: true,
};

export async function pickProfilePhotoFromGallery(): Promise<PickedPhoto | null> {
  if (!(await ensureLibraryPermission())) return null;

  const result = await ImagePicker.launchImageLibraryAsync(pickerOptions);
  if (result.canceled || !result.assets[0]) return null;
  return toPickedPhoto(result.assets[0]);
}

export async function takeProfilePhotoWithCamera(): Promise<PickedPhoto | null> {
  if (!(await ensureCameraPermission())) return null;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.55,
    exif: false,
    base64: true,
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
