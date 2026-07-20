export const LOGO = require('../../assets/logo.png');
export const AUTH_LOGIN_IMAGE = require('../../assets/auth-login-side.jpg');
export const AUTH_REGISTER_IMAGE = require('../../assets/auth-register-side.jpg');

export const ONBOARDING_SLIDES = [
  {
    image: require('../../assets/onboarding/slide-1.jpg'),
    title: 'Premium Home Services',
    subtitle: 'AC repair, plumbing, electrical & more — all verified pros at your doorstep.',
    accent: '#FF2D7A',
  },
  {
    image: require('../../assets/onboarding/slide-2.jpg'),
    title: 'Book in Seconds',
    subtitle: 'Pick a service, choose your slot, and confirm — no calls, no hassle.',
    accent: '#E879F9',
  },
  {
    image: require('../../assets/onboarding/slide-3.jpg'),
    title: 'Live Tracking & OTP',
    subtitle: 'Follow your pro in real-time, verify with OTP, and track every step.',
    accent: '#FF6B9D',
  },
  {
    image: require('../../assets/onboarding/slide-4.jpg'),
    title: 'Trusted Professionals',
    subtitle: 'Background-verified experts, transparent pricing, and 4.8★ rated service.',
    accent: '#FF2D7A',
  },
] as const;
