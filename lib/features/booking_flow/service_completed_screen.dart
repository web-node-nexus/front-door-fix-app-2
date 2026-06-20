import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/glass_card.dart';
import '../../shared/widgets/gradient_button.dart';

class ServiceCompletedScreen extends ConsumerStatefulWidget {
  const ServiceCompletedScreen({super.key});

  @override
  ConsumerState<ServiceCompletedScreen> createState() => _ServiceCompletedScreenState();
}

class _ServiceCompletedScreenState extends ConsumerState<ServiceCompletedScreen> {
  Map<String, dynamic>? _track;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    try {
      final data = await fetchTracking(id);
      if (mounted) setState(() => _track = data);
    } catch (_) {}
  }

  void _downloadInvoice() {
    final code = _track?['booking_code'] ?? '';
    final service = _track?['service'] ?? '';
    final amount = _track?['payment'] is Map ? (_track!['payment'] as Map)['amount'] : 0;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Invoice'),
        content: Text('Booking: $code\nService: $service\nAmount Paid: ₹$amount\n\nInvoice saved to your account.'),
        actions: [TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK'))],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final pro = _track?['professional'] as Map<String, dynamic>?;
    final payment = _track?['payment'] as Map<String, dynamic>?;
    final amount = payment?['amount'] ?? 0;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              const Text('🎉', style: TextStyle(fontSize: 64)).animate().scale(duration: 600.ms, curve: Curves.elasticOut),
              const SizedBox(height: 16),
              const Text('Service Completed!', style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800)),
              const SizedBox(height: 28),
              AppCard(
                child: Column(
                  children: [
                    _Row('Service', _track?['service'] as String? ?? ''),
                    _Row('Amount Paid', '₹$amount'),
                    _Row('Date & Time', '${_track?['date'] ?? ''} · ${_track?['time'] ?? ''}'),
                    _Row('Professional', pro?['name'] as String? ?? ''),
                    const Divider(height: 24),
                    Row(
                      children: [
                        const Icon(Icons.verified, color: AppColors.success, size: 18),
                        const SizedBox(width: 8),
                        Text(payment?['is_paid'] == true ? 'Paid Online' : 'Payment: ${payment?['method'] ?? 'COD'}',
                            style: const TextStyle(color: AppColors.success, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ],
                ),
              ),
              const Spacer(),
              GradientButton(label: 'Rate & Review', onPressed: () => context.push('/review')),
              const SizedBox(height: 12),
              GradientButton(label: 'Download Invoice', outlined: true, onPressed: _downloadInvoice),
              const SizedBox(height: 12),
              TextButton(onPressed: () => context.go('/home'), child: const Text('Back to Home', style: TextStyle(fontWeight: FontWeight.w700))),
            ],
          ),
        ),
      ),
    );
  }
}

class _Row extends StatelessWidget {
  final String label;
  final String value;
  const _Row(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [Text(label, style: const TextStyle(color: AppColors.inkMuted)), const Spacer(), Text(value, style: const TextStyle(fontWeight: FontWeight.w700))]),
    );
  }
}
