import Constants from 'expo-constants';

/**
 * API mode switch.
 *  - 'live'  → production server (frontdoorfix.in)
 *  - 'local' → local dev server on your machine (USB/WiFi + localhost)
 * Live build ke liye 'live' rakho, local development ke liye 'local'.
 */
export const API_MODE: 'live' | 'local' = 'live';

/** Production origin (no trailing slash). */
export const LIVE_ORIGIN = 'https://frontdoorfix.in';

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

const API_PORT = 8002;

export function getApiBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return `${LIVE_ORIGIN}/api`;
  return `http://${host}:${API_PORT}/api`;
}

export function getAssetBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return LIVE_ORIGIN;
  return `http://${host}:${API_PORT}`;
}

/**
 * Ordered list of API base URLs to try. In live mode this is a single
 * production URL; in local mode it tries localhost + LAN IP + emulator host.
 */
export function getApiBaseCandidates(): string[] {
  if (API_MODE === 'live') return [`${LIVE_ORIGIN}/api`];

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
