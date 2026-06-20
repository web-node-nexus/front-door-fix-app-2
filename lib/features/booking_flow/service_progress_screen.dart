import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/gradient_button.dart';

class ServiceProgressScreen extends ConsumerStatefulWidget {
  const ServiceProgressScreen({super.key});

  @override
  ConsumerState<ServiceProgressScreen> createState() => _ServiceProgressScreenState();
}

class _ServiceProgressScreenState extends ConsumerState<ServiceProgressScreen> {
  Map<String, dynamic>? _track;
  Timer? _poll;

  @override
  void initState() {
    super.initState();
    _load();
    _poll = Timer.periodic(const Duration(seconds: 3), (_) => _load());
  }

  Future<void> _load() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    try {
      final data = await fetchTracking(id);
      if (!mounted) return;
      setState(() => _track = data);
      if (data['is_completed'] == true) {
        _poll?.cancel();
        context.push('/completed');
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final checklist = (_track?['checklist'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final service = _track?['service'] as String? ?? 'Service';
    final pro = _track?['professional'] as Map<String, dynamic>?;
    final bookingId = ref.watch(activeBookingIdProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Service in Progress')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: AppColors.gradientLavender,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.lavenderDark),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Your professional is working on', style: TextStyle(fontSize: 13, color: AppColors.inkMuted)),
                      Text(service, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(8)),
                  child: const Row(children: [Icon(Icons.circle, size: 8, color: AppColors.success), SizedBox(width: 4), Text('LIVE', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w800, fontSize: 11))]),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          if (checklist.isEmpty)
            ...['Inspection Completed', 'Work Started', 'Testing', 'Completed'].asMap().entries.map((e) => _TimelineStep(
                  title: e.value,
                  done: e.key < 2,
                  active: e.key == 2,
                  isLast: e.key == 3,
                ))
          else
            ...checklist.asMap().entries.map((e) {
              final item = e.value;
              return _TimelineStep(
                title: item['label'] as String? ?? '',
                done: item['done'] == true,
                active: item['active'] == true,
                isLast: e.key == checklist.length - 1,
              );
            }),
          const SizedBox(height: 32),
          GradientButton(
            label: 'Chat with Professional',
            icon: Icons.chat_bubble_outline,
            onPressed: bookingId != null ? () => context.push('/chat/$bookingId?name=${Uri.encodeComponent(pro?['name'] as String? ?? 'Professional')}') : null,
          ),
        ],
      ),
    );
  }
}

class _TimelineStep extends StatelessWidget {
  final String title;
  final bool done;
  final bool active;
  final bool isLast;
  const _TimelineStep({required this.title, required this.done, required this.active, required this.isLast});
  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: done ? AppColors.gradientPrimary : null,
                  color: done ? null : (active ? AppColors.lavender : AppColors.border),
                  shape: BoxShape.circle,
                ),
                child: done
                    ? const Icon(Icons.check, color: Colors.white, size: 16)
                    : active
                        ? const Padding(padding: EdgeInsets.all(6), child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary))
                        : null,
              ),
              if (!isLast) Expanded(child: Container(width: 2, color: done ? AppColors.primary : AppColors.border)),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(child: Padding(padding: const EdgeInsets.only(bottom: 28), child: Text(title, style: TextStyle(fontWeight: active || done ? FontWeight.w700 : FontWeight.w500, color: active || done ? AppColors.ink : AppColors.inkMuted)))),
        ],
      ),
    );
  }
}
