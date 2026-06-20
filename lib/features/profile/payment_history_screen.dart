import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/glass_card.dart';

class PaymentHistoryScreen extends ConsumerWidget {
  const PaymentHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(bookingsListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Payment History')),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text('Login required or server error')),
        data: (bookings) {
          final paid = bookings.where((b) => b.paymentStatus == 'paid' || b.status == 'completed').toList();
          if (paid.isEmpty) return const Center(child: Text('No payments yet'));
          return ListView.separated(
            padding: const EdgeInsets.all(20),
            itemCount: paid.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              final b = paid[i];
              return AppCard(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(b.service, style: const TextStyle(fontWeight: FontWeight.w800)),
                          Text('#${b.bookingCode} · ${b.date}', style: const TextStyle(fontSize: 12, color: AppColors.inkMuted)),
                          Text(b.paymentMethod?.toUpperCase() ?? 'COD', style: const TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                    Text('₹${b.amount.round()}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
