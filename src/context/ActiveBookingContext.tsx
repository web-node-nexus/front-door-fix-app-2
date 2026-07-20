import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { api, Booking } from '../api/client';
import {
  getWatchedBookingId,
  hasAssignedPartner,
  isBookingCompleted,
  markReviewPrompted,
  pickLiveBooking,
  setWatchedBookingId,
  shouldDriveTopBanner,
  wasReviewPrompted,
} from '../utils/bookingLifecycle';
import { navigateToRateReview } from '../navigation/navigationRef';
import ServiceCompleteModal from '../components/ServiceCompleteModal';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

type BannerInfo = {
  booking: Booking;
  title: string;
  subtitle: string;
  icon: 'search' | 'bicycle' | 'construct' | 'radio' | 'time';
};

type ActiveBookingContextValue = {
  liveBooking: Booking | null;
  banner: BannerInfo | null;
  refresh: () => Promise<void>;
  loading: boolean;
  showServiceComplete: (booking: Booking) => Promise<void>;
};

const ActiveBookingContext = createContext<ActiveBookingContextValue | null>(null);

function buildBanner(booking: Booking): BannerInfo {
  const stage = booking.workflow_stage || 'received';
  const pro = booking.professional?.trim();

  if (stage === 'awaiting_payment') {
    return {
      booking,
      title: 'Service finished',
      subtitle: 'Complete payment to close booking',
      icon: 'time',
    };
  }

  if (stage === 'on_the_way' || stage === 'accepted') {
    const left = booking.work_progress?.seconds_left;
    return {
      booking,
      title: 'Service partner on the way',
      subtitle: left != null ? `Service completes in ~${Math.ceil(left / 60)} min` : `${pro} is heading to your location`,
      icon: 'bicycle',
    };
  }

  if (stage === 'received' && pro) {
    return {
      booking,
      title: 'Service partner assigned',
      subtitle: `${pro} will arrive soon`,
      icon: 'bicycle',
    };
  }

  if (stage === 'arrived') {
    return {
      booking,
      title: 'Service in progress',
      subtitle: booking.work_progress?.seconds_left != null
        ? `Completing service · ~${booking.work_progress.seconds_left}s left`
        : `${pro} is at your location`,
      icon: 'construct',
    };
  }

  if (['otp_verified', 'work_started'].includes(stage)) {
    return {
      booking,
      title: 'Service in progress',
      subtitle: stage === 'work_started' && booking.work_progress?.in_progress
        ? `${pro} is working · ~${booking.work_progress.seconds_left}s left`
        : `${pro} is at your location · completing service`,
      icon: 'construct',
    };
  }

  return {
    booking,
    title: 'Booking active',
    subtitle: booking.service || 'Tap to track live',
    icon: 'radio',
  };
}

export function ActiveBookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
  const [liveBooking, setLiveBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);
  const [serviceComplete, setServiceComplete] = useState<Booking | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const readyRef = useRef(false);
  const hadPartnerRef = useRef<Record<number, boolean>>({});
  const wasCompletedRef = useRef<Record<number, boolean>>({});

  const showServiceComplete = useCallback(async (booking: Booking) => {
    setLiveBooking(null);
    watchIdRef.current = null;
    await setWatchedBookingId(null);
    if (await wasReviewPrompted(booking.id)) return;
    setServiceComplete(booking);
  }, []);

  const goToRateReview = useCallback(async () => {
    if (!serviceComplete) return;
    const booking = serviceComplete;
    await markReviewPrompted(booking.id);
    setServiceComplete(null);
    navigateToRateReview(booking);
  }, [serviceComplete]);

  const dismissServiceComplete = useCallback(async () => {
    if (serviceComplete) {
      await markReviewPrompted(serviceComplete.id);
    }
    setServiceComplete(null);
  }, [serviceComplete]);

  useEffect(() => {
    (async () => {
      watchIdRef.current = await getWatchedBookingId();
      readyRef.current = true;
    })();
  }, []);

  const checkCompletion = useCallback(async (bookings: Booking[]) => {
    const watchedId = watchIdRef.current;
    const ordered = watchedId
      ? [...bookings].sort((a, b) => {
          if (a.id === watchedId) return -1;
          if (b.id === watchedId) return 1;
          return 0;
        })
      : bookings;

    for (const b of ordered) {
      const done = isBookingCompleted(b);
      if (wasCompletedRef.current[b.id] === undefined) {
        wasCompletedRef.current[b.id] = done;
        if (done && b.id === watchedId) {
          await showServiceComplete(b);
          return;
        }
        continue;
      }
      if (done && !wasCompletedRef.current[b.id]) {
        wasCompletedRef.current[b.id] = true;
        setLiveBooking(null);
        watchIdRef.current = null;
        await setWatchedBookingId(null);
        await showServiceComplete(b);
        return;
      }
      wasCompletedRef.current[b.id] = done;
    }
  }, [showServiceComplete]);

  const refresh = useCallback(async () => {
    if (!user) {
      setLiveBooking(null);
      watchIdRef.current = null;
      setLoading(false);
      await setWatchedBookingId(null);
      return;
    }
    try {
      const bookings = await api.bookings();

      if (readyRef.current) {
        await checkCompletion(bookings);
      }

      const live = pickLiveBooking(bookings);

      if (live?.id) {
        const hasPartner = hasAssignedPartner(live);
        if (hadPartnerRef.current[live.id] === undefined) {
          hadPartnerRef.current[live.id] = hasPartner;
        } else if (hasPartner && !hadPartnerRef.current[live.id]) {
          hadPartnerRef.current[live.id] = true;
          refreshNotifications();
        } else {
          hadPartnerRef.current[live.id] = hasPartner;
        }
      }

      if (live) {
        watchIdRef.current = live.id;
        await setWatchedBookingId(live.id);
      } else {
        watchIdRef.current = null;
        await setWatchedBookingId(null);
      }

      setLiveBooking((prev) => {
        // Avoid re-render spam when payload is unchanged
        if (
          prev?.id === live?.id &&
          prev?.workflow_stage === live?.workflow_stage &&
          prev?.status === live?.status &&
          prev?.professional === live?.professional &&
          prev?.work_progress?.seconds_left === live?.work_progress?.seconds_left
        ) {
          return prev;
        }
        return live;
      });
    } catch {
      // Keep last known state on network blip
    } finally {
      setLoading(false);
    }
  }, [user, checkCompletion, refreshNotifications]);

  useEffect(() => {
    refresh();
    // Poll less aggressively — frequent setState was making the UI feel like a reload.
    const timer = setInterval(refresh, 8000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const banner = useMemo(() => {
    if (!liveBooking || !shouldDriveTopBanner(liveBooking)) return null;
    return buildBanner(liveBooking);
  }, [liveBooking]);

  const value = useMemo(
    () => ({ liveBooking, banner, refresh, loading, showServiceComplete }),
    [liveBooking, banner, refresh, loading, showServiceComplete],
  );

  return (
    <ActiveBookingContext.Provider value={value}>
      {children}
      <ServiceCompleteModal
        visible={!!serviceComplete}
        booking={serviceComplete}
        onRate={goToRateReview}
        onLater={dismissServiceComplete}
      />
    </ActiveBookingContext.Provider>
  );
}

export function useActiveBooking() {
  const ctx = useContext(ActiveBookingContext);
  if (!ctx) throw new Error('useActiveBooking must be used within ActiveBookingProvider');
  return ctx;
}
