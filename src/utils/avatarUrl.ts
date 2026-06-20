import { getAssetBaseUrl } from '../config';

export function userAvatarUrl(avatar?: string | null): string | null {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;

  const clean = avatar.replace(/^storage\//, '');
  const path = clean.startsWith('avatars/') ? clean : `avatars/${clean}`;
  const bust = encodeURIComponent(path.split('/').pop() || path);
  return `${getAssetBaseUrl()}/storage/${path}?v=${bust}`;
}
