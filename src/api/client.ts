import * as SecureStore from 'expo-secure-store';

import { API_BASE_URL, getApiBaseCandidates } from '../config';
import { proApi } from './pro';

export { proApi };

const TOKEN_KEY = 'frontdoor_token';

export type ProfessionalProfile = {
  approval_status: string;
  is_verified: boolean;
  is_available: boolean;
  city?: string;
  address?: string;
  pincode?: string;
  bio?: string;
  rating: number;
  total_jobs: number;
  wallet_balance?: number;
  category_ids?: number[];
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  roles?: string[];
  professional?: ProfessionalProfile | null;
};

export function isProfessionalUser(user: User | null): boolean {
  return !!user?.roles?.includes('professional');
}

export type ProStats = {
  new_requests: number;
  accepted_jobs: number;
  in_progress: number;
  awaiting_payment: number;
  completed_jobs: number;
  today_earnings: number;
  monthly_earnings: number;
  wallet_balance: number;
  cash_pending: number;
  requests_blocked?: boolean;
};

export type ProRequest = {
  id: number;
  service?: string;
  customer?: string;
  address?: string;
  pincode?: string;
  date?: string;
  time_slot?: string;
  distance?: string;
  earnings?: number;
  expires_at?: number;
};

export type Service = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: string | number;
  duration_hours?: number;
  image?: string;
  bookings_count?: number;
  category?: { id: number; name: string; slug: string };
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image?: string;
  services?: Service[];
};

export type Booking = {
  id: number;
  booking_code: string;
  service?: string;
  service_slug?: string;
  service_image?: string;
  status: string;
  tab?: 'Upcoming' | 'Active' | 'Completed' | 'Cancelled';
  workflow_stage?: string;
  amount: number;
  date?: string;
  time_slot?: string;
  address?: string;
  professional?: string;
  professional_phone?: string;
  payment_method?: string;
  payment_status?: string;
  payment_mode?: 'cash' | 'online';
  payment_label?: string;
  is_paid?: boolean;
  cancelled_at?: string;
  needs_payment?: boolean;
  net_amount?: number;
  collection_status?: string;
  show_otp?: boolean;
  otp?: string;
  otp_verified?: boolean;
  status_message?: string;
  work_progress?: {
    in_progress: boolean;
    seconds_left: number;
    seconds_total: number;
    percent: number;
  };
  invoice_available?: boolean;
};

export type MobileNotification = {
  id: string;
  booking_id?: number | null;
  type: 'booking' | 'offer' | 'system';
  title: string;
  body: string;
  time: string;
  read: boolean;
};

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Continue — still attempt overwrite below
  }

  // Some devices fail deleteItemAsync; overwrite then delete again
  try {
    const leftover = await SecureStore.getItemAsync(TOKEN_KEY);
    if (leftover) {
      await SecureStore.setItemAsync(TOKEN_KEY, '');
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch {
    // Best-effort clear
  }
}

function apiBaseCandidates(): string[] {
  return getApiBaseCandidates();
}

function networkErrorMessage(tried: string[]): string {
  return (
    'Server connect nahi ho raha.\n\n' +
    '1. USB cable connect karo\n' +
    '2. PC par chalao: adb reverse tcp:8000 tcp:8000\n' +
    '3. Backend chalao: php artisan serve --host=0.0.0.0 --port=8000\n' +
    `4. Tried: ${tried.join(', ')}`
  );
}

function apiErrorMessage(body: Record<string, unknown>, fallback: string): string {
  const errors = body?.errors;
  if (errors && typeof errors === 'object') {
    for (const field of ['name', 'phone', 'pincode', 'booking_date', 'time_slot', 'service_id', 'address', 'city', 'email', 'password', 'payment_method']) {
      const msg = (errors as Record<string, string[]>)[field]?.[0];
      if (msg) return msg;
    }
  }
  return (body?.message as string) || fallback;
}

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const bases = apiBaseCandidates();
  let lastNetworkError: Error | null = null;
  let lastHttpError: Error | null = null;

  for (const base of bases) {
    const url = `${base}${path}`;

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = apiErrorMessage(body, `Request failed (${response.status})`);
        lastHttpError = new Error(message);
        // Wrong password etc. — same on all hosts; stop trying.
        if (response.status === 401 || response.status === 422) {
          throw lastHttpError;
        }
        continue;
      }

      return response.json();
    } catch (e) {
      if (e instanceof Error) {
        const msg = e.message.toLowerCase();
        if (msg.includes('credential') || msg.includes('incorrect') || msg.includes('password')) {
          throw e;
        }
      }
      lastNetworkError = e instanceof Error ? e : new Error('Network request failed');
    }
  }

  if (lastHttpError) throw lastHttpError;
  throw new Error(networkErrorMessage(bases));
}

async function fetchInvoiceHtml(bookingId: number): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new Error('Please login again to download invoice.');
  }

  const headers: Record<string, string> = {
    Accept: 'text/html',
    Authorization: `Bearer ${token}`,
  };

  const bases = apiBaseCandidates();
  let lastNetworkError: Error | null = null;
  let lastHttpError: Error | null = null;

  for (const base of bases) {
    const url = `${base}/bookings/${bookingId}/invoice/download`;
    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = apiErrorMessage(body, `Invoice download failed (${response.status})`);
        lastHttpError = new Error(message);
        if (response.status === 401 || response.status === 422) {
          throw lastHttpError;
        }
        continue;
      }
      return response.text();
    } catch (e) {
      if (e instanceof Error && (e.message.includes('login') || e.message.includes('Invoice'))) {
        throw e;
      }
      lastNetworkError = e instanceof Error ? e : new Error('Network request failed');
    }
  }

  if (lastHttpError) throw lastHttpError;
  throw new Error(networkErrorMessage(bases));
}

async function uploadAvatarFile(photo: { uri: string; name: string; type: string }): Promise<{ success: boolean; message: string; user: User }> {
  const token = await getToken();
  if (!token) {
    throw new Error('Please login again to update your profile photo.');
  }

  const formData = new FormData();
  formData.append('avatar', {
    uri: photo.uri,
    name: photo.name,
    type: photo.type,
  } as unknown as Blob);

  const bases = apiBaseCandidates();
  let lastNetworkError: Error | null = null;
  let lastHttpError: Error | null = null;

  for (const base of bases) {
    const url = `${base}/user/avatar`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = apiErrorMessage(body, `Upload failed (${response.status})`);
        lastHttpError = new Error(message);
        if (response.status === 401 || response.status === 422) {
          throw lastHttpError;
        }
        continue;
      }

      return response.json();
    } catch (e) {
      if (e instanceof Error && (e.message.includes('login') || e.message.includes('Upload'))) {
        throw e;
      }
      lastNetworkError = e instanceof Error ? e : new Error('Network request failed');
    }
  }

  if (lastHttpError) throw lastHttpError;
  throw new Error(networkErrorMessage(bases));
}

export const api = {
  home: () =>
    request<{ app_name: string; tagline: string; categories: Category[]; featured_services: Service[] }>('/home'),
  categories: () => request<Category[]>('/categories'),
  services: (params?: { category?: string; q?: string; sort?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.q) query.set('q', params.q);
    if (params?.sort) query.set('sort', params.sort);
    const qs = query.toString();
    return request<Service[]>(`/services${qs ? `?${qs}` : ''}`);
  },
  login: async (email: string, password: string) => {
    const data = await request<{ token: string; user: User }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    try {
      await setToken(data.token);
    } catch {
      // Token save fail shouldn't block login session in memory
    }
    return data;
  },
  register: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
  }) => {
    const data = await request<{ token: string; user: User }>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    try {
      await setToken(data.token);
    } catch {
      // Token save fail shouldn't block register session in memory
    }
    return data;
  },
  registerProfessional: async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    city: string;
    address: string;
    pincode: string;
    bio?: string;
    experience_years: number;
  }) => {
    const data = await request<{ token: string; user: User; message?: string }>(
      '/register/professional',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
    try {
      await setToken(data.token);
    } catch {
      // Token save fail shouldn't block register session in memory
    }
    return data;
  },
  proProfile: () => request<User>('/pro/profile', {}, true),
  proStats: () => request<ProStats>('/pro/stats', {}, true),
  proRequests: () => request<{ requests: ProRequest[] }>('/pro/requests', {}, true),
  logout: async () => setToken(null),
  restoreSession: async (): Promise<User | null> => {
    const token = await getToken();
    if (!token?.trim()) return null;
    try {
      return await request<User>('/user', {}, true);
    } catch {
      await setToken(null);
      return null;
    }
  },
  updateProfile: (payload: { name: string; phone?: string }) =>
    request<{ success: boolean; message: string; user: User }>(
      '/user/profile',
      { method: 'POST', body: JSON.stringify(payload) },
      true,
    ),
  uploadAvatar: (photo: { uri: string; name: string; type: string }) => uploadAvatarFile(photo),
  bookings: () => request<Booking[]>('/bookings', {}, true),
  notifications: () =>
    request<{ notifications: MobileNotification[]; unread_count: number }>('/notifications', {}, true),
  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'POST' }, true),
  cancelBooking: (id: number) =>
    request<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, { method: 'POST' }, true),
  rescheduleBooking: (id: number, booking_date: string, time_slot: string) =>
    request<{ success: boolean; message: string; booking: Booking }>(
      `/bookings/${id}/reschedule`,
      { method: 'POST', body: JSON.stringify({ booking_date, time_slot }) },
      true,
    ),
  bookingTracking: (id: number) => request<TrackingPayload>(`/bookings/${id}`, {}, true),
  invoiceUrl: (id: number) =>
    request<{ filename: string; pdf_filename: string; invoice_no: string }>(`/bookings/${id}/invoice`, {}, true),
  invoiceHtml: (id: number) => fetchInvoiceHtml(id),
  paymentPayload: (id: number) => request<PaymentPayload>(`/bookings/${id}/payment`, {}, true),
  selectPaymentMethod: (id: number, method: 'cod' | 'online') =>
    request<{ success: boolean; data: PaymentPayload }>(
      `/bookings/${id}/payment/method`,
      { method: 'POST', body: JSON.stringify({ method }) },
      true,
    ),
  ping: () => request<{ app_name: string }>('/home'),
  storeBooking: (payload: {
    service_id: number;
    address: string;
    city: string;
    pincode: string;
    booking_date: string;
    time_slot: string;
    payment_method?: string;
  }) =>
    request<{ booking: Booking; tracking: TrackingPayload }>(
      '/bookings',
      { method: 'POST', body: JSON.stringify(payload) },
      true,
    ),
  submitReview: (id: number, rating: number, comment?: string) =>
    request<{ success: boolean; message: string }>(
      `/bookings/${id}/review`,
      { method: 'POST', body: JSON.stringify({ rating, comment: comment || null }) },
      true,
    ),
};

export type PaymentPayload = {
  booking_id: number;
  booking_code: string;
  service?: string;
  professional?: string;
  professional_phone?: string;
  date?: string;
  time?: string;
  address?: string;
  amount: number;
  collection_method?: 'cod' | 'online' | null;
  collection_status?: string | null;
  collection_txn_id?: string | null;
  needs_collection: boolean;
  already_paid_online: boolean;
  workflow_stage?: string;
  is_completed: boolean;
  upi_id?: string;
  upi_url?: string;
  qr_image_url?: string | null;
  qr_fallback_url?: string;
  qr_expires_at?: number | null;
  service_finished_at?: string | null;
};

export type TrackingPayload = {
  id: number;
  booking_code: string;
  service?: string;
  category?: string;
  date?: string;
  time?: string;
  status: string;
  workflow_stage?: string;
  status_label: string;
  address?: string;
  city?: string;
  pincode?: string;
  distance_km: number;
  eta_minutes: number;
  worker_location: [number, number];
  customer_location: [number, number];
  professional?: {
    name: string;
    rating: number;
    phone?: string;
    vehicle?: string;
    vehicle_plate?: string;
    experience?: string;
    jobs?: string;
    verified?: boolean;
    initials?: string;
  } | null;
  timeline?: { key: string; label: string; done: boolean; active: boolean; time?: string | null }[];
  searching?: boolean;
  show_otp?: boolean;
  otp?: string;
  otp_verified?: boolean;
  otp_message?: string;
  payment?: {
    method?: string;
    status?: string;
    amount?: number;
    is_cod?: boolean;
    is_paid?: boolean;
  };
  work_progress?: {
    in_progress: boolean;
    seconds_left: number;
    seconds_total: number;
    percent: number;
  };
  checklist?: { label: string; done: boolean; active: boolean }[];
  progress_percent?: number;
};

// For debugging in alerts
export { API_BASE_URL };
