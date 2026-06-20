import * as SecureStore from 'expo-secure-store';
import { Booking } from '../api/client';
import { navigateToRateReview } from '../navigation/navigationRef';
import { isPaymentSettled } from './bookingPayment';

const PROMPT_KEY = 'review_prompted_ids';
const WATCH_KEY = 'active_booking_watch_id';

export function isBookingCompleted(b: Booking): boolean {
  return b.status === 'completed' || b.tab === 'Completed' || b.workflow_stage === 'completed';
}

export function isLiveBooking(b: Booking): boolean {
  if (isBookingCompleted(b)) return false;
  if (b.status === 'cancelled' || b.tab === 'Cancelled') return false;
  if (b.tab === 'Active') return true;
  if (b.status === 'in_progress') return true;
  // Upcoming/confirmed without pro should not drive the top live banner
  if (b.status === 'pending' || b.status === 'confirmed') return false;
  return false;
}

/** Hide track banner once service is done or payment is received. */
export function shouldHideTrackBanner(b: Booking): boolean {
  if (isBookingCompleted(b)) return true;
  if (isPaymentSettled(b)) return true;
  if (b.workflow_stage === 'awaiting_payment') return true;
  return false;
}

/** Only show top banner after a pro has accepted — not while finding a partner. */
export function shouldDriveTopBanner(b: Booking): boolean {
  if (shouldHideTrackBanner(b)) return false;
  return isLiveBooking(b) && hasAssignedPartner(b);
}

/** Latest accepted active job for the top banner (newest first). */
export function pickLiveBooking(bookings: Booking[]): Booking | null {
  const live = bookings.filter(shouldDriveTopBanner);
  if (!live.length) return null;

  const score = (b: Booking): number => {
    let s = b.id;
    if (b.professional?.trim()) s += 1_000_000;
    if (b.status === 'in_progress' || b.tab === 'Active') s += 500_000;
    if (b.workflow_stage === 'on_the_way' || b.workflow_stage === 'accepted') s += 100_000;
    return s;
  };

  return [...live].sort((a, b) => score(b) - score(a))[0];
}

export function hasAssignedPartner(b: Booking): boolean {
  if (!b.professional?.trim()) return false;
  const stage = b.workflow_stage || 'received';
  return stage !== 'received';
}

export function isWaitingForProAccept(b: Booking): boolean {
  if (isBookingCompleted(b)) return false;
  if (b.status === 'cancelled' || b.tab === 'Cancelled') return false;
  return !hasAssignedPartner(b) && ['pending', 'confirmed'].includes(b.status);
}

async function getPromptedIds(): Promise<number[]> {
  const raw = await SecureStore.getItemAsync(PROMPT_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as number[];
  } catch {
    return [];
  }
}

export async function wasReviewPrompted(bookingId: number): Promise<boolean> {
  const ids = await getPromptedIds();
  return ids.includes(bookingId);
}

export async function markReviewPrompted(bookingId: number): Promise<void> {
  const ids = await getPromptedIds();
  if (!ids.includes(bookingId)) {
    ids.push(bookingId);
    await SecureStore.setItemAsync(PROMPT_KEY, JSON.stringify(ids));
  }
}

export async function getWatchedBookingId(): Promise<number | null> {
  const raw = await SecureStore.getItemAsync(WATCH_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

export async function setWatchedBookingId(id: number | null): Promise<void> {
  if (id == null) {
    await SecureStore.deleteItemAsync(WATCH_KEY);
  } else {
    await SecureStore.setItemAsync(WATCH_KEY, String(id));
  }
}

export async function openReviewForBooking(booking: Booking): Promise<boolean> {
  if (!isBookingCompleted(booking)) return false;
  if (await wasReviewPrompted(booking.id)) return false;
  await markReviewPrompted(booking.id);
  await setWatchedBookingId(null);
  navigateToRateReview(booking);
  return true;
}
