import Constants from 'expo-constants';

/**
 * API mode switch.
 *  - 'live'  → production: https://frontdoorfix.in/api
 *  - 'local' → local Laravel (USB/WiFi)
 * Live API ke liye hamesha 'live' rakho.
 */
export const API_MODE: 'live' | 'local' = 'local';

/** Origin only — app appends /api automatically → https://frontdoorfix.in/api */
export const LIVE_ORIGIN = 'https://frontdoorfix.in';

export const PUBLIC_ORIGIN = 'https://frontdoorfix.in';

// Dev-only (Expo Go / Wi‑Fi). USB reverse optional; same Wi‑Fi pe LAN IP use karo.
export const DEV_IP = '192.168.1.9';

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

/** USB: adb reverse tcp:8000; Wi‑Fi: artisan --host=0.0.0.0 --port=8000 */
const API_PORT = 8000;

export function getApiBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return `${LIVE_ORIGIN}/api`;
  // USB / Expo localhost — keep loopback (adb reverse). Tunnel host → LAN IP.
  if (/\.exp\.direct$/i.test(host)) host = DEV_IP;
  if (host === 'localhost') host = '127.0.0.1';
  return `http://${host}:${API_PORT}/api`;
}

export function getAssetBaseUrl(host = getDevHost()) {
  if (API_MODE === 'live') return LIVE_ORIGIN;
  if (/\.exp\.direct$/i.test(host)) host = DEV_IP;
  if (host === 'localhost') host = '127.0.0.1';
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

  // USB reverse pe pehle 127.0.0.1; phir LAN IP (same Wi‑Fi).
  const metroHost = getDevHost();
  const hosts: string[] = ['127.0.0.1'];
  const forcedHost = (process.env.EXPO_PUBLIC_API_HOST || '').trim();
  if (forcedHost) hosts.push(forcedHost);
  if (
    metroHost &&
    !/\.exp\.direct$/i.test(metroHost) &&
    metroHost !== 'localhost' &&
    metroHost !== '127.0.0.1'
  ) {
    hosts.push(metroHost);
  }
  hosts.push(DEV_IP);
  return [...new Set(hosts.filter(Boolean))].map((h) => getApiBaseUrl(h));
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
export const BUILD_STAMP = '2026-09-03 18:10:00';
