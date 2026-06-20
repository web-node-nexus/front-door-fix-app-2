import { Service } from '../api/client';
import { categoryIcon } from './serviceImagery';

const CATEGORY_INCLUDES: Record<string, string[]> = {
  cleaning: [
    'Verified cleaning professional',
    'All cleaning supplies included',
    'Kitchen & bathroom focus',
    'Post-service quality check',
  ],
  salon: [
    'Certified beauty professional',
    'Hygienic at-home setup',
    'Premium products used',
    'Comfortable home service',
  ],
  plumbing: [
    'Licensed plumber',
    'Leak & blockage diagnosis',
    'Basic spare parts guidance',
    '30-day service warranty',
  ],
  electrical: [
    'Certified electrician',
    'Safety inspection included',
    'Switch, fan & wiring support',
    'Post-repair testing',
  ],
  'ac-repair': [
    'Trained AC technician',
    'Filter & coil cleaning',
    'Cooling performance check',
    'Gas leak inspection',
  ],
  'ac-service': [
    'Trained AC technician',
    'Filter & coil cleaning',
    'Cooling performance check',
    'Gas leak inspection',
  ],
  painting: [
    'Professional painter',
    'Surface preparation',
    'Premium finish options',
    'Clean-up after service',
  ],
  'pest-control': [
    'Licensed pest expert',
    'Safe treatment chemicals',
    'Targeted pest removal',
    'Follow-up guidance',
  ],
  carpentry: [
    'Skilled carpenter',
    'Assembly & repair tools',
    'Furniture fitting support',
    'Neat finishing',
  ],
};

const DEFAULT_INCLUDES = [
  'Verified service professional',
  'Transparent upfront pricing',
  'Quality check after service',
  'Best price guarantee',
];

const PROCESS_STEPS = [
  'Book your preferred time slot',
  'Verified pro assigned to you',
  'Professional arrives at your home',
  'Service completed · pay after work',
];

export function serviceIncludes(service: Service): string[] {
  const slug = service.category?.slug || '';
  const base = CATEGORY_INCLUDES[slug] || DEFAULT_INCLUDES;

  if (service.description) {
    return [service.description, ...base.slice(0, 3)];
  }

  return base;
}

export function serviceRating(service: Service): { rating: string; reviews: string } {
  const seed = service.id * 17;
  const rating = (4.5 + (seed % 5) / 10).toFixed(1);
  const count = service.bookings_count && service.bookings_count > 0
    ? service.bookings_count
    : 120 + (seed % 800);
  const reviews = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);

  return { rating, reviews: `${reviews} bookings` };
}

export function serviceHighlights(service: Service): string[] {
  const cat = service.category?.name;
  const icon = categoryIcon(service.category?.slug);
  const highlights = [
    cat ? `${icon} ${cat} specialist` : 'Home service expert',
    'Pay after service completion',
    '100% verified professionals',
  ];

  return highlights;
}

export function serviceProcessSteps(): string[] {
  return PROCESS_STEPS;
}
