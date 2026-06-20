import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/gradient_button.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  int _countdown = 120;
  Timer? _timer;
  String _otp = '----';

  @override
  void initState() {
    super.initState();
    _loadOtp();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (_countdown > 0) setState(() => _countdown--);
    });
  }

  Future<void> _loadOtp() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    try {
      final data = await fetchTracking(id);
      final otp = data['otp'] as String? ?? '0000';
      if (mounted) setState(() => _otp = otp.padLeft(4, '0'));
    } catch (_) {}
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _timeStr {
    final m = (_countdown ~/ 60).toString().padLeft(2, '0');
    final s = (_countdown % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final digits = _otp.split('');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Spacer(),
              Container(
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(color: AppColors.lavender, shape: BoxShape.circle),
                child: const Icon(Icons.handshake_outlined, color: AppColors.primary, size: 64),
              ).animate().scale(duration: 500.ms, curve: Curves.elasticOut),
              const SizedBox(height: 28),
              const Text('Professional Has Arrived!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text('Share this OTP with your professional', style: TextStyle(color: AppColors.inkMuted)),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (i) {
                  return Container(
                    width: 64,
                    height: 72,
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    decoration: BoxDecoration(
                      color: AppColors.canvas,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.primary, width: 2),
                      boxShadow: AppColors.softShadow,
                    ),
                    child: Center(child: Text(digits.length > i ? digits[i] : '-', style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primary))),
                  );
                }),
              ),
              const SizedBox(height: 24),
              Text('OTP expires in $_timeStr', style: const TextStyle(color: AppColors.inkMuted, fontWeight: FontWeight.w600)),
              const Spacer(),
              GradientButton(label: 'Service Started', onPressed: () => context.push('/progress')),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
