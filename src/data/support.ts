export type SupportTicket = {
  id: string;
  title: string;
  status: 'in_progress' | 'resolved' | 'open';
  time: string;
  icon: 'star' | 'checkmark';
};

export const QUICK_HELP = [
  { id: '1', icon: 'calendar-outline', title: 'How to Book a Service?', answer: 'Go to Home → select a service → choose date & time → confirm payment. You can also tap Book Now in the bottom nav.' },
  { id: '2', icon: 'location-outline', title: 'How to Track My Booking?', answer: 'Open My Bookings → Active tab to see live status. You will get push updates when the professional is on the way.' },
  { id: '3', icon: 'card-outline', title: 'Payment & Refund Issues', answer: 'Refunds are processed within 5-7 business days. For failed payments, check Payment Methods in Profile or contact support.' },
  { id: '4', icon: 'time-outline', title: 'Reschedule / Cancel Booking', answer: 'Free reschedule up to 2 hours before slot. Free cancellation up to 4 hours before scheduled time.' },
  { id: '5', icon: 'construct-outline', title: 'Service Related Issues', answer: 'If service quality was not satisfactory, raise a ticket within 24 hours. We offer free re-service or full refund.' },
  { id: '6', icon: 'document-text-outline', title: 'Billing & Invoice', answer: 'Download invoices from Profile → Service History or Invoices. GST invoices are emailed after payment.' },
] as const;

export const ALL_FAQS = [
  ...QUICK_HELP,
  { id: '7', icon: 'shield-checkmark-outline', title: 'Are professionals verified?', answer: 'Yes. All professionals undergo background checks, skill verification, and training before joining Front Door.' },
  { id: '8', icon: 'wallet-outline', title: 'How does wallet cashback work?', answer: 'Earn cashback on every booking. Cashback is credited to your wallet and can be used on future bookings.' },
  { id: '9', icon: 'diamond-outline', title: 'What is Premium Membership?', answer: 'Premium members get exclusive discounts, priority support, free cancellation, and 2x reward points.' },
] as const;

export const RECENT_TICKETS: SupportTicket[] = [
  { id: 'TK785412', title: 'AC Installation - Technician Delay', status: 'in_progress', time: '2 hours ago', icon: 'star' },
  { id: 'TK785125', title: 'Payment Failed - Double Deduction', status: 'resolved', time: '1 day ago', icon: 'checkmark' },
];

export const SUPPORT_PHONE = '+919876543210';
export const SUPPORT_WHATSAPP = 'https://wa.me/919876543210';
