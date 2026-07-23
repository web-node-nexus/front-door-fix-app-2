import { getAssetBaseUrl } from '../config';

function rewriteLocalHostToLive(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      const base = getAssetBaseUrl();
      return `${base}${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // keep original
  }
  return url;
}

/**
 * Resolve a displayable avatar URL for profile images.
 * Prefers absolute avatar_url from API; falls back to storage path.
 */
export function userAvatarUrl(avatar?: string | null, avatarUrl?: string | null): string | null {
  const absolute = avatarUrl?.trim() || (avatar?.startsWith('http') ? avatar : null);
  if (absolute) {
    const fixed = rewriteLocalHostToLive(absolute);
    const sep = fixed.includes('?') ? '&' : '?';
    const bust = encodeURIComponent((avatar || absolute).split('/').pop() || '1');
    return `${fixed}${sep}v=${bust}`;
  }

  if (!avatar) return null;

  const clean = avatar.replace(/^storage\//, '');
  const path = clean.startsWith('avatars/') ? clean : `avatars/${clean}`;
  const bust = encodeURIComponent(path.split('/').pop() || path);
  return `${getAssetBaseUrl()}/storage/${path}?v=${bust}`;
}
