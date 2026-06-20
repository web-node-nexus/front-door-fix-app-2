import { Booking } from '../api/client';

export type PaymentTone = 'paid' | 'pending' | 'cod';

export type PaymentDisplay = {
  label: string;
  sublabel: string;
  tone: PaymentTone;
  icon: 'cash' | 'card' | 'phone-portrait' | 'globe-outline';
  shortTag: string;
};

const ONLINE_METHODS: Record<string, string> = {
  upi: 'UPI',
  card: 'Card',
  netbanking: 'Net Banking',
};

export function isCodBooking(booking: Booking): boolean {
  return (booking.payment_mode || booking.payment_method || 'cod') === 'cash'
    || (booking.payment_method || 'cod') === 'cod';
}

export function isPaymentSettled(booking: Booking): boolean {
  if (booking.is_paid) return true;
  if (booking.payment_status === 'paid') return true;
  if (booking.collection_status === 'received') return true;
  return false;
}

export function getPaymentDisplay(booking: Booking): PaymentDisplay {
  if (booking.payment_label) {
    const cod = isCodBooking(booking);
    const paid = isPaymentSettled(booking);
    return {
      label: booking.payment_label,
      sublabel: cod
        ? (paid ? 'Cash on Delivery' : booking.needs_payment ? 'Pay after service' : 'Pay after service')
        : (ONLINE_METHODS[booking.payment_method || ''] || 'Online'),
      tone: paid ? 'paid' : cod ? 'cod' : 'pending',
      icon: cod ? 'cash' : booking.payment_method === 'upi' ? 'phone-portrait' : 'card',
      shortTag: cod ? 'Cash' : (ONLINE_METHODS[booking.payment_method || ''] || 'Online'),
    };
  }

  const method = booking.payment_method || 'cod';
  const paid = isPaymentSettled(booking);
  const cod = method === 'cod';

  if (cod) {
    if (paid) {
      return { label: 'Paid in Cash', sublabel: 'Cash on Delivery', tone: 'paid', icon: 'cash', shortTag: 'Cash' };
    }
    if (booking.needs_payment || booking.workflow_stage === 'awaiting_payment') {
      return { label: 'Pay Cash to Pro', sublabel: 'Cash on Delivery', tone: 'pending', icon: 'cash', shortTag: 'Cash' };
    }
    return { label: 'Cash on Delivery', sublabel: 'Pay after service', tone: 'cod', icon: 'cash', shortTag: 'Cash' };
  }

  const methodLabel = ONLINE_METHODS[method] || 'Online';
  if (paid) {
    return { label: 'Paid Online', sublabel: methodLabel, tone: 'paid', icon: method === 'upi' ? 'phone-portrait' : 'card', shortTag: methodLabel };
  }
  return { label: 'Online Payment', sublabel: `${methodLabel} · Pending`, tone: 'pending', icon: 'card', shortTag: methodLabel };
}
