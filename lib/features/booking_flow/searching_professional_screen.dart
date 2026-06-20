import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';

class SearchingProfessionalScreen extends ConsumerStatefulWidget {
  const SearchingProfessionalScreen({super.key});

  @override
  ConsumerState<SearchingProfessionalScreen> createState() => _SearchingProfessionalScreenState();
}

class _SearchingProfessionalScreenState extends ConsumerState<SearchingProfessionalScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  int _step = 0;
  Timer? _poll;
  final _steps = ['Searching nearby professionals', 'Checking availability', 'Finding best match', 'Professional assigned!'];

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: const Duration(seconds: 2))..repeat();
    _poll = Timer.periodic(const Duration(seconds: 2), (_) => _check());
    Future.delayed(const Duration(milliseconds: 500), () { if (mounted) setState(() => _step = 1); });
    Future.delayed(const Duration(milliseconds: 1500), () { if (mounted) setState(() => _step = 2); });
  }

  Future<void> _check() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    try {
      final track = await fetchTracking(id);
      if (track['searching'] != true && track['professional'] != null) {
        _poll?.cancel();
        if (mounted) {
          setState(() => _step = 3);
          await Future.delayed(const Duration(milliseconds: 600));
          if (mounted) context.go('/professional');
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _poll?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              const Text('Searching for best\nProfessional...', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, height: 1.3)),
              const SizedBox(height: 40),
              SizedBox(
                width: 160,
                height: 160,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    RotationTransition(
                      turns: _controller,
                      child: Container(
                        width: 160,
                        height: 160,
                        decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.primary.withValues(alpha: 0.2), width: 4)),
                      ),
                    ),
                    Container(
                      width: 80,
                      height: 80,
                      decoration: const BoxDecoration(gradient: AppColors.gradientPrimary, shape: BoxShape.circle),
                      child: const Icon(Icons.person, color: Colors.white, size: 40),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),
              ...List.generate(_steps.length, (i) {
                final done = i <= _step;
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: Row(
                    children: [
                      Container(
                        width: 28,
                        height: 28,
                        decoration: BoxDecoration(color: done ? AppColors.success : AppColors.border, shape: BoxShape.circle),
                        child: done ? const Icon(Icons.check, color: Colors.white, size: 16) : null,
                      ),
                      const SizedBox(width: 14),
                      Text(_steps[i], style: TextStyle(fontWeight: done ? FontWeight.w700 : FontWeight.w500, color: done ? AppColors.ink : AppColors.inkMuted)),
                    ],
                  ),
                );
              }),
              const Spacer(),
              TextButton(onPressed: () => context.go('/bookings'), child: const Text('View in Bookings')),
            ],
          ),
        ),
      ),
    );
  }
}
