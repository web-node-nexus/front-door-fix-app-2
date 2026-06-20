import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';

class ServiceModel {
  final int id;
  final String name;
  final int price;
  final String? categoryName;
  final String? categorySlug;
  final String? image;

  const ServiceModel({
    required this.id,
    required this.name,
    required this.price,
    this.categoryName,
    this.categorySlug,
    this.image,
  });

  factory ServiceModel.fromJson(Map<String, dynamic> json) => ServiceModel(
        id: json['id'] as int,
        name: json['name'] as String,
        price: (json['price'] as num).round(),
        categoryName: json['category'] is Map ? json['category']['name'] as String? : null,
        categorySlug: json['category'] is Map ? json['category']['slug'] as String? : null,
        image: json['image'] as String?,
      );
}

class BookingDraft {
  final int serviceId;
  final String serviceName;
  final int price;
  final DateTime date;
  final String timeSlot;
  final String address;
  final String city;
  final String pincode;

  const BookingDraft({
    required this.serviceId,
    required this.serviceName,
    required this.price,
    required this.date,
    required this.timeSlot,
    required this.address,
    required this.city,
    required this.pincode,
  });

  Map<String, dynamic> toJson(String paymentMethod) => {
        'service_id': serviceId,
        'booking_date': '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}',
        'time_slot': timeSlot,
        'address': address,
        'city': city,
        'pincode': pincode,
        'payment_method': paymentMethod,
      };
}

class BookingDraftNotifier extends StateNotifier<BookingDraft?> {
  BookingDraftNotifier() : super(null);

  void setDraft(BookingDraft draft) => state = draft;
  void clear() => state = null;
}

final bookingDraftProvider = StateNotifierProvider<BookingDraftNotifier, BookingDraft?>((ref) => BookingDraftNotifier());

class ActiveBookingNotifier extends StateNotifier<int?> {
  ActiveBookingNotifier() : super(null);

  void setId(int? id) => state = id;
}

final activeBookingIdProvider = StateNotifierProvider<ActiveBookingNotifier, int?>((ref) => ActiveBookingNotifier());

Future<Map<String, dynamic>> fetchTracking(int bookingId) async {
  return await apiClient.get('/bookings/$bookingId') as Map<String, dynamic>;
}

Future<Map<String, dynamic>> createBooking(BookingDraft draft, String paymentMethodId) async {
  final method = switch (paymentMethodId) {
    'upi' || 'wallet' => 'upi',
    'credit' || 'debit' => 'card',
    'netbanking' => 'netbanking',
    _ => 'cod',
  };

  final data = await apiClient.post('/bookings', body: draft.toJson(method)) as Map<String, dynamic>;
  return data;
}
