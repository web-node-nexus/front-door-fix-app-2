import { ASSET_BASE_URL } from '../config';
import { Service } from '../api/client';

const SERVICE_SLUG_IMAGES: Record<string, string> = {
  'ac-installation': 'images/services/ac-installation.jpg',
  'ac-service': 'images/services/ac-repair.jpg',
  'ac-gas-refill': 'images/services/ac-gas.jpg',
  'ac-uninstallation': 'images/services/ac-uninstallation.jpg',
  'ac-cleaning': 'images/services/ac-cleaning.jpg',
  'ac-inspection': 'images/services/ac-inspection.jpg',
  'regular-cleaning': 'images/services/cleaning.jpg',
  'deep-cleaning': 'images/services/cleaning.jpg',
  'sofa-cleaning': 'images/services/cleaning.jpg',
  'haircut-at-home': 'images/services/salon.jpg',
  'facial-cleanup': 'images/services/salon.jpg',
  'manicure-pedicure': 'images/services/salon.jpg',
  'tap-repair': 'images/services/plumbing.jpg',
  'toilet-repair': 'images/services/plumbing.jpg',
  'pipe-installation': 'images/services/plumbing.jpg',
  'switch-socket': 'images/services/electrical.jpg',
  'fan-installation': 'images/services/electrical.jpg',
  'wiring-check': 'images/services/electrical.jpg',
  'room-painting': 'images/services/painting.jpg',
  'full-home-painting': 'images/services/painting.jpg',
};

const CATEGORY_IMAGES: Record<string, string> = {
  cleaning: 'images/services/cleaning.jpg',
  salon: 'images/services/salon.jpg',
  plumbing: 'images/services/plumbing.jpg',
  electrical: 'images/services/electrical.jpg',
  'ac-repair': 'images/services/ac-repair.jpg',
  'ac-service': 'images/services/ac.jpg',
  painting: 'images/services/painting.jpg',
  carpentry: 'images/home/repair-carpentry.jpg',
  'pest-control': 'images/home/repair-pest-control.jpg',
};

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

export function serviceImageUrl(service: Service): string {
  if (service.image) {
    if (service.image.startsWith('http')) return service.image;
    const path = service.image.startsWith('storage/') ? service.image : `storage/${service.image}`;
    return `${ASSET_BASE_URL}/${path}`;
  }

  if (service.slug && SERVICE_SLUG_IMAGES[service.slug]) {
    return `${ASSET_BASE_URL}/${SERVICE_SLUG_IMAGES[service.slug]}`;
  }

  const catSlug = service.category?.slug || 'default';
  const fallback = CATEGORY_IMAGES[catSlug] || 'images/services/default.jpg';
  return `${ASSET_BASE_URL}/${fallback}`;
}

export function categoryImageUrl(slug: string, image?: string): string {
  if (image) {
    if (image.startsWith('http')) return image;
    const path = image.startsWith('storage/') ? image : `storage/${image}`;
    return `${ASSET_BASE_URL}/${path}`;
  }
  const fallback = CATEGORY_IMAGES[slug] || 'images/services/default.jpg';
  return `${ASSET_BASE_URL}/${fallback}`;
}
