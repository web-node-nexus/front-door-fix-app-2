import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/glass_card.dart';
import '../../shared/widgets/gradient_button.dart';

class BookingConfirmedScreen extends ConsumerWidget {
  const BookingConfirmedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(bookingDraftProvider);
    final bookingId = ref.watch(activeBookingIdProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                width: 100,
                height: 100,
                decoration: BoxDecoration(
                  gradient: AppColors.gradientPrimary,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.4), blurRadius: 24, offset: const Offset(0, 8))],
                ),
                child: const Icon(Icons.check, color: Colors.white, size: 52),
              ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
              const SizedBox(height: 24),
              const Text('Booking Confirmed!', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              Text('Booking ID: #BK${bookingId?.toString().padLeft(6, '0') ?? '------'}',
                  style: const TextStyle(color: AppColors.inkMuted, fontWeight: FontWeight.w600)),
              const SizedBox(height: 28),
              AppCard(
                child: Column(
                  children: [
                    _DetailRow('Service', draft?.serviceName ?? ''),
                    _DetailRow('Date', draft != null ? '${draft.date.day} ${_month(draft.date.month)} ${draft.date.year} · ${draft.timeSlot}' : ''),
                    _DetailRow('Address', draft?.address ?? ''),
                  ],
                ),
              ),
              const Spacer(),
              GradientButton(label: 'Track Booking', onPressed: () => context.go('/searching')),
              const SizedBox(height: 12),
              GradientButton(label: 'View Bookings', outlined: true, onPressed: () => context.go('/bookings')),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  String _month(int m) => const ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 100, child: Text(label, style: const TextStyle(color: AppColors.inkMuted, fontSize: 14))),
          Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
        ],
      ),
    );
  }
}
