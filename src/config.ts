import Constants from 'expo-constants';

// USB + adb reverse fallback
export const DEV_IP = '127.0.0.1';

/** Expo packager host — same IP phone uses for Metro (USB or WiFi). */
export function getDevHost(): string {
  const raw =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost ??
    Constants.linkingUri;

  if (raw) {
    const host = raw.replace(/^[a-z]+:\/\//i, '').split(':')[0];
    if (host && host !== 'localhost') return host;
  }

  return DEV_IP;
}

export function getApiBaseUrl(host = getDevHost()) {
  return `http://${host}:8000/api`;
}

export function getAssetBaseUrl(host = getDevHost()) {
  return `http://${host}:8000`;
}

export const API_BASE_URL = getApiBaseUrl();
export const ASSET_BASE_URL = getAssetBaseUrl();

export const BRAND = {
  name: 'Front Door',
  primary: '#FF2D7A',
  primaryLight: '#FF6B9D',
  primaryDark: '#E91E63',
  purple: '#E879F9',
  gold: '#FFB800',
  ink: '#1A1A2E',
  muted: '#6B7280',
  light: '#9CA3AF',
  canvas: '#FFFFFF',
  surface: '#F8F9FC',
  lavender: '#F3E8FF',
  border: '#F0F0F5',
  success: '#10B981',
};
