export type AppNotification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'booking' | 'offer' | 'system';
  read: boolean;
};

export const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: '1',
    title: 'Booking Confirmed',
    body: 'Your AC service is scheduled for tomorrow at 10:00 AM.',
    time: '2h ago',
    type: 'booking',
    read: false,
  },
  {
    id: '2',
    title: '20% OFF — Summer Deal',
    body: 'Get 20% off on all AC services this week. Book now!',
    time: '5h ago',
    type: 'offer',
    read: false,
  },
  {
    id: '3',
    title: 'Professional Assigned',
    body: 'Rahul Sharma will arrive for your deep cleaning service.',
    time: '1d ago',
    type: 'booking',
    read: false,
  },
  {
    id: '4',
    title: 'Payment Successful',
    body: '₹1,299 paid for Home Deep Cleaning. Receipt saved.',
    time: '2d ago',
    type: 'system',
    read: true,
  },
  {
    id: '5',
    title: 'Rate Your Experience',
    body: 'How was your recent plumbing service? Leave a review.',
    time: '3d ago',
    type: 'system',
    read: true,
  },
];
