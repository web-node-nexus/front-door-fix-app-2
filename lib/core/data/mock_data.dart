import 'package:flutter/material.dart';

class ServiceItem {
  final String id;
  final String name;
  final IconData icon;
  final Color color;
  final double rating;
  final int reviews;
  final int price;
  final String category;

  const ServiceItem({
    required this.id,
    required this.name,
    required this.icon,
    required this.color,
    this.rating = 4.5,
    this.reviews = 120,
    this.price = 299,
    this.category = 'AC Service',
  });
}

class BookingItem {
  final String id;
  final String service;
  final String date;
  final String time;
  final String address;
  final String status;
  final int amount;
  final String? proName;

  const BookingItem({
    required this.id,
    required this.service,
    required this.date,
    required this.time,
    required this.address,
    required this.status,
    required this.amount,
    this.proName,
  });
}

class ReviewItem {
  final String name;
  final String text;
  final double rating;
  final String date;

  const ReviewItem({
    required this.name,
    required this.text,
    required this.rating,
    required this.date,
  });
}

class MockData {
  static const location = 'Powai, Mumbai';
  static const userName = 'Rahul Sharma';
  static const userPhone = '+91 98765 43210';
  static const userAddress = 'Flat 402, Hiranandani Gardens, Powai';

  static const professional = <String, String>{
    'name': 'Amit Kumar',
    'rating': '4.8',
    'experience': '5+ Years',
    'jobs': '650+',
    'language': 'Hindi, English',
    'vehicle': 'MH 01 AB 4521',
    'specialty': 'AC Specialist',
  };

  static final popularServices = [
    const ServiceItem(id: '1', name: 'AC Repair', icon: Icons.ac_unit, color: Color(0xFFE0F2FE), price: 399, category: 'AC Service'),
    const ServiceItem(id: '2', name: 'AC Installation', icon: Icons.install_desktop, color: Color(0xFFFCE7F3), price: 1499, category: 'AC Service'),
    const ServiceItem(id: '3', name: 'AC Gas Refill', icon: Icons.air, color: Color(0xFFDBEAFE), price: 599, category: 'AC Service'),
    const ServiceItem(id: '4', name: 'Deep Cleaning', icon: Icons.cleaning_services, color: Color(0xFFD1FAE5), price: 2499, category: 'Cleaning'),
    const ServiceItem(id: '5', name: 'Bathroom Cleaning', icon: Icons.bathtub_outlined, color: Color(0xFFE0E7FF), price: 499, category: 'Cleaning'),
    const ServiceItem(id: '6', name: 'Kitchen Cleaning', icon: Icons.kitchen_outlined, color: Color(0xFFFEF3C7), price: 699, category: 'Cleaning'),
    const ServiceItem(id: '7', name: 'Refrigerator Repair', icon: Icons.kitchen, color: Color(0xFFECFDF5), price: 449, category: 'Appliance'),
    const ServiceItem(id: '8', name: 'Washing Machine', icon: Icons.local_laundry_service, color: Color(0xFFF3E8FF), price: 399, category: 'Appliance'),
    const ServiceItem(id: '9', name: 'Electrician', icon: Icons.electrical_services, color: Color(0xFFFFF7ED), price: 199, category: 'Electrician'),
    const ServiceItem(id: '10', name: 'Plumber', icon: Icons.plumbing, color: Color(0xFFE0F2FE), price: 199, category: 'Plumbing'),
    const ServiceItem(id: '11', name: 'Carpenter', icon: Icons.carpenter, color: Color(0xFFFEF9C3), price: 299, category: 'Carpentry'),
    const ServiceItem(id: '12', name: 'Painting', icon: Icons.format_paint, color: Color(0xFFFCE7F3), price: 999, category: 'Painting'),
    const ServiceItem(id: '13', name: 'Pest Control', icon: Icons.bug_report_outlined, color: Color(0xFFD1FAE5), price: 799, category: 'Pest Control'),
    const ServiceItem(id: '14', name: 'RO Service', icon: Icons.water_drop_outlined, color: Color(0xFFDBEAFE), price: 349, category: 'RO Service'),
  ];

  static const whyChooseUs = [
    {'icon': Icons.verified_user, 'title': 'Verified Pros', 'subtitle': 'Background checked'},
    {'icon': Icons.schedule, 'title': 'On-time Service', 'subtitle': 'Punctual arrival'},
    {'icon': Icons.receipt_long, 'title': 'Transparent Pricing', 'subtitle': 'No hidden charges'},
    {'icon': Icons.thumb_up_alt_outlined, 'title': 'Satisfaction Guarantee', 'subtitle': '100% quality assured'},
  ];

  static const offers = [
    {'title': 'SUMMER DEAL', 'subtitle': 'Up to 20% OFF on AC Services', 'cta': 'Book Now'},
    {'title': 'NEW USER', 'subtitle': 'Flat ₹200 OFF on first booking', 'cta': 'Claim Offer'},
  ];

  static const reviews = [
    ReviewItem(name: 'Priya M.', text: 'Excellent AC service! Professional and on time.', rating: 5, date: '2 days ago'),
    ReviewItem(name: 'Arjun K.', text: 'Deep cleaning was thorough. Highly recommend!', rating: 4.5, date: '1 week ago'),
    ReviewItem(name: 'Sneha R.', text: 'Transparent pricing, no surprises. Great experience.', rating: 5, date: '2 weeks ago'),
  ];

  static const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM',
  ];

  static const paymentMethods = [
    {'id': 'upi', 'name': 'UPI', 'icon': Icons.account_balance_wallet},
    {'id': 'credit', 'name': 'Credit Card', 'icon': Icons.credit_card},
    {'id': 'debit', 'name': 'Debit Card', 'icon': Icons.payment},
    {'id': 'netbanking', 'name': 'Net Banking', 'icon': Icons.account_balance},
    {'id': 'wallet', 'name': 'Wallet', 'icon': Icons.wallet},
    {'id': 'cod', 'name': 'Cash on Delivery', 'icon': Icons.money},
  ];

  static final bookings = [
    const BookingItem(
      id: 'FD-2847',
      service: 'AC Installation',
      date: '8 Jun 2026',
      time: '11:00 AM',
      address: 'Flat 402, Hiranandani Gardens',
      status: 'Upcoming',
      amount: 1499,
      proName: 'Amit Kumar',
    ),
    const BookingItem(
      id: 'FD-2812',
      service: 'Deep Cleaning',
      date: '5 Jun 2026',
      time: '10:00 AM',
      address: 'Flat 402, Hiranandani Gardens',
      status: 'Active',
      amount: 2499,
      proName: 'Rajesh Singh',
    ),
    const BookingItem(
      id: 'FD-2756',
      service: 'AC Repair',
      date: '28 May 2026',
      time: '03:00 PM',
      address: 'Flat 402, Hiranandani Gardens',
      status: 'Completed',
      amount: 399,
      proName: 'Amit Kumar',
    ),
    const BookingItem(
      id: 'FD-2701',
      service: 'Plumbing',
      date: '20 May 2026',
      time: '09:00 AM',
      address: 'Flat 402, Hiranandani Gardens',
      status: 'Cancelled',
      amount: 199,
    ),
  ];

  static const faqs = [
    {'q': 'How do I book a service?', 'a': 'Select a service, choose date & time, and confirm payment.'},
    {'q': 'Can I reschedule my booking?', 'a': 'Yes, you can reschedule up to 2 hours before the slot.'},
    {'q': 'What is the cancellation policy?', 'a': 'Free cancellation up to 4 hours before the scheduled time.'},
    {'q': 'Are professionals verified?', 'a': 'All professionals undergo background checks and skill verification.'},
  ];
}
