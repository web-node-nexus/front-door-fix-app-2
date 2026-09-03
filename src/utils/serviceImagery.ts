import { LIVE_ORIGIN, getAssetBaseUrl } from '../config';
import { Service } from '../api/client';

/** Same paths as website ServiceImagery::slugImageMap() */
export const SERVICE_SLUG_IMAGES: Record<string, string> = {
  'regular-cleaning': 'images/services/regular-cleaning.jpg',
  'deep-cleaning': 'images/services/deep-cleaning.jpg',
  'sofa-cleaning': 'images/services/sofa-cleaning.jpg',
  'haircut-at-home': 'images/services/haircut-at-home.jpg',
  'facial-cleanup': 'images/services/facial-cleanup.jpg',
  'manicure-pedicure': 'images/services/manicure-pedicure.jpg',
  'tap-repair': 'images/services/tap-repair.jpg',
  'toilet-repair': 'images/services/toilet-repair.jpg',
  'pipe-installation': 'images/services/pipe-installation.jpg',
  'switch-socket': 'images/services/switch-socket.jpg',
  'fan-installation': 'images/services/fan-installation.jpg',
  'wiring-check': 'images/services/wiring-check.jpg',
  'ac-installation': 'images/services/ac-installation.jpg',
  'ac-service': 'images/services/ac-service.jpg',
  'ac-gas-refill': 'images/services/ac-gas-refill.jpg',
  'ac-uninstallation': 'images/services/ac-installation.jpg',
  'ac-cleaning': 'images/services/ac-service.jpg',
  'ac-inspection': 'images/services/ac-service.jpg',
  'air-cooler-repair': 'images/services/air-cooler-repair.jpg',
  'air-cooler-service': 'images/services/air-cooler-service.jpg',
  'room-painting': 'images/services/room-painting.jpg',
  'full-home-painting': 'images/services/full-home-painting.jpg',
  'cockroach-control': 'images/services/cockroach-control.jpg',
  'termite-control': 'images/services/termite-control.jpg',
  'furniture-assembly': 'images/services/furniture-assembly.jpg',
  'door-repair': 'images/services/door-repair.jpg',
  'custom-shelving': 'images/services/custom-shelving.jpg',
  'glass-replace': 'images/services/glass-replace.jpg',
  'window-glass-repair': 'images/services/window-glass-repair.jpg',
  'aluminium-window-installation': 'images/services/aluminium-window-installation.jpg',
  'aluminium-sliding-door': 'images/services/aluminium-sliding-door.jpg',
  'glass-partition-work': 'images/services/glass-partition-work.jpg',
  'mirror-installation': 'images/services/mirror-installation.jpg',
  'aluminium-fabrication': 'images/services/aluminium-window-installation.jpg',
  'washing-machine-repair': 'images/services/washing-machine-repair.jpg',
  'washing-machine-service': 'images/services/washing-machine-service.jpg',
  'refrigerator-repair': 'images/services/refrigerator-repair.jpg',
  'refrigerator-gas-refill': 'images/services/refrigerator-gas-refill.jpg',
  'television-repair': 'images/services/television-repair.jpg',
  'tv-wall-mount-installation': 'images/services/tv-wall-mount-installation.jpg',
  'geyser-repair': 'images/services/geyser-repair.jpg',
  'geyser-installation': 'images/services/geyser-installation.jpg',
  'microwave-repair': 'images/services/microwave-repair.jpg',
  'ro-water-purifier-service': 'images/services/ro-water-purifier-service.jpg',
  'water-purifier-installation': 'images/services/water-purifier-installation.jpg',
};

const CATEGORY_IMAGES: Record<string, string> = {
  cleaning: 'images/services/regular-cleaning.jpg',
  salon: 'images/services/haircut-at-home.jpg',
  plumbing: 'images/services/tap-repair.jpg',
  electrical: 'images/services/switch-socket.jpg',
  electrician: 'images/services/switch-socket.jpg',
  'ac-repair': 'images/services/ac-service.jpg',
  'ac-service': 'images/services/ac-service.jpg',
  'appliance-repair': 'images/services/washing-machine-repair.jpg',
  painting: 'images/services/room-painting.jpg',
  carpentry: 'images/services/furniture-assembly.jpg',
  'pest-control': 'images/services/cockroach-control.jpg',
  'aluminium-glass-work': 'images/services/aluminium-window-installation.jpg',
};

const DEFAULT_IMAGE = 'images/services/regular-cleaning.jpg';

export function categoryIcon(slug?: string): string {
  switch (slug) {
    case 'cleaning':
      return '🧹';
    case 'salon':
      return '💇';
    case 'plumbing':
      return '🔧';
    case 'electrical':
    case 'electrician':
      return '⚡';
    case 'ac-repair':
    case 'ac-service':
      return '❄️';
    case 'painting':
      return '🎨';
    case 'pest-control':
      return '🐛';
    case 'carpentry':
      return '🪚';
    case 'aluminium-glass-work':
      return '🪟';
    case 'appliance-repair':
      return '🔌';
    default:
      return '🏠';
  }
}

export function durationLabel(hours?: number): string {
  const h = Number(hours || 1);
  if (h <= 1) return '45-60 mins';
  if (h <= 1.5) return '60-90 mins';
  if (h <= 2) return '90-120 mins';
  if (h <= 3) return '2-3 hrs';
  return `${Math.round(h)} hrs`;
}

function normalizePath(path: string): string {
  let clean = path.replace(/\\/g, '/').replace(/^\/+/, '');
  clean = clean.replace(/^writable\/storage\/app\/public\//, 'storage/');
  if (clean.startsWith('storage/app/public/')) {
    clean = `storage/${clean.slice('storage/app/public/'.length)}`;
  }
  return clean;
}

function origins(): string[] {
  const local = getAssetBaseUrl().replace(/\/$/, '');
  const live = LIVE_ORIGIN.replace(/\/$/, '');
  return [...new Set([local, live, 'http://127.0.0.1:8000'])];
}

function urlOnOrigin(origin: string, path: string): string {
  const clean = normalizePath(path);
  return `${origin}/${clean}`;
}

/** Expand one URL/path into local + live candidates so images still show if USB API is down. */
export function catalogImageCandidates(...inputs: Array<string | null | undefined>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  const push = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  for (const raw of inputs) {
    if (!raw?.trim()) continue;
    const value = raw.trim();

    if (value.startsWith('http://') || value.startsWith('https://')) {
      try {
        const parsed = new URL(value);
        const path = normalizePath(parsed.pathname.replace(/^\//, ''));
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          for (const origin of origins()) {
            push(urlOnOrigin(origin, path));
          }
        } else {
          push(value);
          for (const origin of origins()) {
            push(urlOnOrigin(origin, path));
          }
        }
      } catch {
        push(value);
      }
      continue;
    }

    const path = normalizePath(value);
    for (const origin of origins()) {
      push(urlOnOrigin(origin, path));
    }
  }

  return out;
}

export function serviceImageCandidates(service: Service): string[] {
  const slugPath = service.slug ? SERVICE_SLUG_IMAGES[service.slug] : undefined;
  const catPath = CATEGORY_IMAGES[service.category?.slug || ''] || DEFAULT_IMAGE;
  return catalogImageCandidates(
    service.image_url,
    service.image,
    slugPath,
    catPath,
    DEFAULT_IMAGE,
  );
}

export function categoryImageCandidates(
  slug: string,
  image?: string | null,
  imageUrl?: string | null,
): string[] {
  const fallback = CATEGORY_IMAGES[slug] || DEFAULT_IMAGE;
  return catalogImageCandidates(imageUrl, image, fallback, DEFAULT_IMAGE);
}

export function serviceImageUrl(service: Service): string {
  return serviceImageCandidates(service)[0];
}

export function categoryImageUrl(slug: string, image?: string, imageUrl?: string): string {
  return categoryImageCandidates(slug, image, imageUrl)[0];
}

export function categoryFallbackPath(slug?: string): string {
  return CATEGORY_IMAGES[slug || ''] || DEFAULT_IMAGE;
}
