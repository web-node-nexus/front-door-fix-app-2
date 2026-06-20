import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/mock_data.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/booking_footer.dart';
import '../../shared/widgets/glass_card.dart';

class PaymentScreen extends ConsumerStatefulWidget {
  const PaymentScreen({super.key});

  @override
  ConsumerState<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends ConsumerState<PaymentScreen> {
  String _selected = 'upi';
  bool _paying = false;

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(bookingDraftProvider);
    if (draft == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Payment')),
        body: const Center(child: Text('No booking draft found')),
      );
    }

    final serviceAmount = draft.price;
    const platformFee = 49;
    final gst = (serviceAmount * 0.18).round();
    final total = serviceAmount + platformFee + gst;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Payment'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new, size: 20), onPressed: () => context.pop()),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
        children: [
          AppCard(
            child: Column(
              children: [
                _PriceRow('Service Amount', serviceAmount),
                _PriceRow('Platform Fee', platformFee),
                _PriceRow('GST (18%)', gst),
                const Divider(height: 24),
                _PriceRow('Total Amount', total, isBold: true),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Text('Payment Method', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          ...MockData.paymentMethods.map((m) {
            final selected = _selected == m['id'];
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppCard(
                onTap: () => setState(() => _selected = m['id'] as String),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                color: selected ? AppColors.lavender.withValues(alpha: 0.5) : null,
                child: Row(
                  children: [
                    Icon(m['icon'] as IconData, color: AppColors.primary),
                    const SizedBox(width: 14),
                    Expanded(child: Text(m['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600))),
                    Icon(selected ? Icons.radio_button_checked : Icons.radio_button_off, color: AppColors.primary),
                  ],
                ),
              ),
            );
          }),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.lock_outline, size: 18, color: AppColors.success),
                SizedBox(width: 8),
                Text('100% Secure Payment', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.success)),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: BookingFooter(
        total: total,
        buttonLabel: _paying ? 'Processing...' : 'Pay Now',
        onPressed: _paying ? null : () => _pay(draft, total),
      ),
    );
  }

  Future<void> _pay(BookingDraft draft, int total) async {
    setState(() => _paying = true);
    try {
      final result = await createBooking(draft, _selected);
      final booking = result['booking'] as Map<String, dynamic>;
      final id = booking['id'] as int;
      ref.read(activeBookingIdProvider.notifier).setId(id);
      ref.invalidate(bookingsListProvider);
      if (!mounted) return;
      context.push('/booking-confirmed');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }
}

class _PriceRow extends StatelessWidget {
  final String label;
  final int amount;
  final bool isBold;
  const _PriceRow(this.label, this.amount, {this.isBold = false});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(label, style: TextStyle(fontSize: isBold ? 16 : 14, fontWeight: isBold ? FontWeight.w800 : FontWeight.w500)),
          const Spacer(),
          Text('₹$amount', style: TextStyle(fontSize: isBold ? 18 : 14, fontWeight: isBold ? FontWeight.w800 : FontWeight.w600)),
        ],
      ),
    );
  }
}
