import Constants from 'expo-constants';

/**
 * Release APK hits ONLY this production API (no LAN / USB / tunnel):
 *   https://frontdoor.in/api
 */
export const API_MODE: 'live' | 'local' = __DEV__ ? 'local' : 'live';

/** Origin only — app appends /api automatically → https://frontdoor.in/api */
export const LIVE_ORIGIN = 'https://frontdoor.in';

export const PUBLIC_ORIGIN = 'https://frontdoor.in';

// Dev-only (Expo Go / USB)
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

const API_PORT = 8000;

export function getApiBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return `${LIVE_ORIGIN}/api`;
  return `http://${host}:${API_PORT}/api`;
}

export function getAssetBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return LIVE_ORIGIN;
  return `http://${host}:${API_PORT}`;
}

/**
 * Ordered list of API base URLs to try.
 * Live/release: public origin only — no LAN / USB fallbacks.
 */
export function getApiBaseCandidates(): string[] {
  if (API_MODE === 'live') {
    return [`${LIVE_ORIGIN}/api`];
  }

  const hosts: string[] = [DEV_IP];
  const devHost = getDevHost();
  if (devHost && devHost !== DEV_IP && devHost !== 'localhost') {
    hosts.push(devHost);
  }
  hosts.push('10.0.2.2'); // Android emulator
  return [...new Set(hosts)].map((h) => getApiBaseUrl(h));
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

/** Rebuild stamp for fresh APK */
export const BUILD_STAMP = '2026-07-23 16:40:00';
