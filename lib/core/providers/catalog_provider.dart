import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import 'booking_flow_provider.dart';

class HomeData {
  final List<Map<String, dynamic>> categories;
  final List<ServiceModel> featured;

  const HomeData({required this.categories, required this.featured});
}

final homeDataProvider = FutureProvider<HomeData>((ref) async {
  try {
    final data = await apiClient.get('/home') as Map<String, dynamic>;
    final categories = (data['categories'] as List).cast<Map<String, dynamic>>();
    final featured = (data['featured_services'] as List)
        .map((e) => ServiceModel.fromJson(e as Map<String, dynamic>))
        .toList();
    return HomeData(categories: categories, featured: featured);
  } catch (_) {
    rethrow;
  }
});

final servicesProvider = FutureProvider.family<List<ServiceModel>, ({String? category, String? q})>((ref, params) async {
  final query = <String, String>{};
  if (params.category != null && params.category!.isNotEmpty && params.category != 'All') {
    query['category'] = params.category!;
  }
  if (params.q != null && params.q!.isNotEmpty) query['q'] = params.q!;

  final data = await apiClient.get('/services', query: query.isEmpty ? null : query) as List;
  return data.map((e) => ServiceModel.fromJson(e as Map<String, dynamic>)).toList();
});

class BookingSummary {
  final int id;
  final String bookingCode;
  final String service;
  final String status;
  final String tab;
  final String? workflowStage;
  final double amount;
  final String date;
  final String timeSlot;
  final String address;
  final String? professional;
  final String? professionalPhone;
  final String? paymentMethod;
  final String? paymentStatus;

  const BookingSummary({
    required this.id,
    required this.bookingCode,
    required this.service,
    required this.status,
    required this.tab,
    this.workflowStage,
    required this.amount,
    required this.date,
    required this.timeSlot,
    required this.address,
    this.professional,
    this.professionalPhone,
    this.paymentMethod,
    this.paymentStatus,
  });

  factory BookingSummary.fromJson(Map<String, dynamic> json) => BookingSummary(
        id: json['id'] as int,
        bookingCode: json['booking_code'] as String? ?? '',
        service: json['service'] as String? ?? '',
        status: json['status'] as String? ?? '',
        tab: json['tab'] as String? ?? 'Upcoming',
        workflowStage: json['workflow_stage'] as String?,
        amount: (json['amount'] as num?)?.toDouble() ?? 0,
        date: json['date'] as String? ?? '',
        timeSlot: json['time_slot'] as String? ?? '',
        address: json['address'] as String? ?? '',
        professional: json['professional'] as String?,
        professionalPhone: json['professional_phone'] as String?,
        paymentMethod: json['payment_method'] as String?,
        paymentStatus: json['payment_status'] as String?,
      );
}

final bookingsListProvider = FutureProvider<List<BookingSummary>>((ref) async {
  final data = await apiClient.get('/bookings') as List;
  return data.map((e) => BookingSummary.fromJson(e as Map<String, dynamic>)).toList();
});

final addressesProvider = FutureProvider<List<Map<String, dynamic>>>((ref) async {
  final data = await apiClient.get('/addresses') as List;
  return data.cast<Map<String, dynamic>>();
});
