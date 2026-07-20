import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL, getApiBaseCandidates } from '../config';

const TOKEN_KEY = 'frontdoor_token';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

function apiBaseCandidates(): string[] {
  return getApiBaseCandidates();
}

async function proRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const bases = apiBaseCandidates();
  let lastError: Error | null = null;

  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, { ...options, headers });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = (body?.message as string) || `Request failed (${response.status})`;
        lastError = new Error(message);
        if (response.status === 401 || response.status === 422) throw lastError;
        continue;
      }
      if (response.headers.get('content-type')?.includes('application/json')) {
        return response.json();
      }
      return (await response.text()) as T;
    } catch (e) {
      if (e instanceof Error && (e.message.includes('incorrect') || e.message.includes('Invalid'))) {
        throw e;
      }
      lastError = e instanceof Error ? e : new Error('Network failed');
    }
  }
  throw lastError ?? new Error('Server unreachable');
}

export type ProWorkProgress = {
  in_progress: boolean;
  seconds_left: number;
  seconds_total: number;
  percent: number;
};

export type ProActiveJob = {
  id: number;
  workflow_stage: string;
  status: string;
  otp_verified: boolean;
  customer?: string;
  service?: string;
  pincode?: string;
  phone?: string;
  distance?: string;
  timeline?: { key: string; label: string; done: boolean; active: boolean }[];
  checklist?: Record<string, boolean>;
  can_verify_otp?: boolean;
  work_progress?: ProWorkProgress;
  actions?: {
    on_the_way: boolean;
    arrived: boolean;
    start_work: boolean;
    complete_job: boolean;
    work_in_progress: boolean;
    collect_payment: boolean;
  };
};

export type ProPollPayload = {
  stats: {
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
  requests: {
    id: number;
    service?: string;
    customer?: string;
    address?: string;
    earnings?: number;
    expires_at?: number;
  }[];
  request_ids: number[];
  notifications_unread: number;
  notifications: { id: string; title: string; message: string; booking_id?: number; time?: string }[];
  active_job: ProActiveJob | null;
  active_jobs: ProActiveJob[];
};

export type ProCompletionPayload = {
  booking_id?: number;
  booking_code?: string;
  workflow_stage?: string;
  customer?: string;
  service?: string;
  address?: string;
  date?: string;
  time?: string;
  amount: number;
  commission?: number;
  earnings?: number;
  collection_method?: string | null;
  collection_status?: string | null;
  needs_collection?: boolean;
  already_paid_online?: boolean;
  upi_id?: string;
  upi_url?: string;
  qr_image_url?: string;
  payment_proof_url?: string | null;
  before_photo_url?: string | null;
  after_photo_url?: string | null;
  is_completed?: boolean;
  review?: { rating: number; comment?: string };
};

export const proApi = {
  poll: () => proRequest<ProPollPayload>('/pro/poll'),
  accept: (id: number) => proRequest<{ success: boolean; message: string }>(`/pro/bookings/${id}/accept`, { method: 'POST' }),
  reject: (id: number) => proRequest<{ success: boolean; message: string }>(`/pro/bookings/${id}/reject`, { method: 'POST' }),
  onTheWay: (id: number) => proRequest<{ success: boolean; message: string; active_job?: ProActiveJob }>(`/pro/bookings/${id}/on-the-way`, { method: 'POST' }),
  arrived: (id: number) => proRequest<{ success: boolean; message: string; active_job?: ProActiveJob }>(`/pro/bookings/${id}/arrived`, { method: 'POST' }),
  verifyOtp: (id: number, otp: string) =>
    proRequest<{ success: boolean; message: string; active_job?: ProActiveJob }>(`/pro/bookings/${id}/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),
  autoComplete: (id: number) =>
    proRequest<{ success: boolean; message: string; active_job?: ProActiveJob }>(`/pro/bookings/${id}/auto-complete`, { method: 'POST' }),
  startWork: (id: number) =>
    proRequest<{ success: boolean; message: string; active_job?: ProActiveJob }>(`/pro/bookings/${id}/start-work`, { method: 'POST' }),
  updateChecklist: (id: number, key: string, value: boolean) =>
    proRequest<{ success: boolean; checklist: Record<string, boolean> }>(`/pro/bookings/${id}/checklist`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    }),
  prepareCompletion: (id: number) =>
    proRequest<{ success: boolean; message: string; booking_id: number }>(`/pro/completion/${id}/prepare`, { method: 'POST' }),
  earnings: () =>
    proRequest<{
      stats: ProPollPayload['stats'];
      chart: { label: string; amount: number }[];
      recent: { id: number; booking_code: string; service?: string; customer?: string; amount: number; date?: string }[];
    }>('/pro/earnings'),
  withdraw: (amount: number) =>
    proRequest<{ success: boolean; message: string; wallet_balance: number }>('/pro/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),
  performance: () =>
    proRequest<{
      acceptance_rate: number;
      completion_rate: number;
      average_rating: number;
      response_time: string;
    }>('/pro/performance'),
  reviews: () =>
    proRequest<{
      reviews: { id: number; rating: number; comment?: string; customer?: string; service?: string; date?: string }[];
    }>('/pro/reviews'),
  notifications: (page = 1) => proRequest<{ notifications: { id: string; title: string; body: string; read: boolean; time?: string }[]; unread_count: number }>(`/pro/notifications?page=${page}`),
  toggleAvailability: (is_available: boolean) =>
    proRequest<{ success: boolean; is_available: boolean; message: string }>('/pro/availability', {
      method: 'POST',
      body: JSON.stringify({ is_available }),
    }),
  completionList: () =>
    proRequest<{
      pending: { id: number; booking_code: string; service?: string; customer?: string; amount: number }[];
      completed: { id: number; booking_code: string; service?: string; customer?: string; amount: number }[];
    }>('/pro/completion'),
  completionShow: (id: number) => proRequest<ProCompletionPayload>(`/pro/completion/${id}`),
  completionMethod: (id: number, method: 'cod' | 'online') =>
    proRequest<{ success: boolean; data: ProCompletionPayload }>(`/pro/completion/${id}/method`, {
      method: 'POST',
      body: JSON.stringify({ method }),
    }),
  completionConfirm: (id: number, cash_amount?: number) =>
    proRequest<{ success: boolean; message: string; completed: boolean; data: ProCompletionPayload }>(
      `/pro/completion/${id}/confirm-payment`,
      { method: 'POST', body: JSON.stringify({ cash_amount }) },
    ),
  completionFinalize: (id: number) =>
    proRequest<{ success: boolean; message: string }>(`/pro/completion/${id}/finalize`, { method: 'POST' }),
  categories: () => proRequest<{ id: number; name: string; slug: string }[]>('/pro/categories'),
  updateProfile: (payload: Record<string, unknown>) =>
    proRequest<{ success: boolean; user: Record<string, unknown> }>('/pro/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};

export { API_BASE_URL };
