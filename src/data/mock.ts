export const LOCATION = 'Powai, Mumbai';

export const WHY_CHOOSE = [
  { icon: 'shield-checkmark', title: 'Verified Pros', sub: 'Background checked' },
  { icon: 'time', title: 'On-time Service', sub: 'Punctual arrival' },
  { icon: 'receipt', title: 'Transparent Pricing', sub: 'No hidden charges' },
  { icon: 'thumbs-up', title: 'Satisfaction Guarantee', sub: '100% quality' },
] as const;

export const OFFERS = [
  { title: 'SUMMER DEAL', sub: 'Up to 20% OFF on AC Services', cta: 'Book Now' },
  { title: 'NEW USER', sub: 'Flat ₹200 OFF first booking', cta: 'Claim Offer' },
] as const;

export const REVIEWS = [
  { name: 'Priya M.', text: 'Excellent AC service! Professional and on time.', rating: 5, date: '2 days ago' },
  { name: 'Arjun K.', text: 'Deep cleaning was thorough. Highly recommend!', rating: 4.5, date: '1 week ago' },
  { name: 'Sneha R.', text: 'Transparent pricing, no surprises.', rating: 5, date: '2 weeks ago' },
] as const;

export const SERVICE_ICONS: Record<string, string> = {
  'ac-service': 'snow',
  cleaning: 'sparkles',
  plumbing: 'water',
  electrician: 'flash',
  appliance: 'construct',
  painting: 'color-palette',
  carpentry: 'hammer',
  'pest-control': 'bug',
  'ro-service': 'water',
};
