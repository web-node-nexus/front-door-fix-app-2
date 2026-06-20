import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/glass_card.dart';
import '../../shared/widgets/gradient_button.dart';

class LiveTrackingScreen extends ConsumerStatefulWidget {
  const LiveTrackingScreen({super.key});

  @override
  ConsumerState<LiveTrackingScreen> createState() => _LiveTrackingScreenState();
}

class _LiveTrackingScreenState extends ConsumerState<LiveTrackingScreen> {
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
      if (mounted) setState(() => _track = data);
      final stage = data['workflow_stage'] as String?;
      if (stage == 'arrived' && mounted) {
        _poll?.cancel();
        context.push('/otp');
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
    final pro = _track?['professional'] as Map<String, dynamic>?;
    final name = pro?['name'] as String? ?? 'Professional';
    final phone = pro?['phone'] as String?;
    final distance = _track?['distance_km'] ?? 2.5;
    final eta = _track?['eta_minutes'] ?? 12;
    final stage = _track?['workflow_stage'] as String? ?? 'on_the_way';

    return Scaffold(
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0xFFE8F4F8), Color(0xFFD4E8ED)]),
            ),
            child: CustomPaint(painter: _MapPainter(), size: Size.infinite),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: GestureDetector(
                onTap: () => context.pop(),
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: AppColors.softShadow),
                  child: const Icon(Icons.arrow_back_ios_new, size: 18),
                ),
              ),
            ),
          ),
          Positioned(
            top: 80,
            left: 20,
            right: 20,
            child: GlassCard(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: AppColors.lavender, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.route, color: AppColors.primary),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('$distance km away', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800)),
                        Text(eta > 0 ? 'Arriving in $eta mins' : _statusLabel(stage), style: const TextStyle(color: AppColors.inkMuted, fontSize: 13)),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(color: AppColors.success.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: const Text('LIVE', style: TextStyle(color: AppColors.success, fontWeight: FontWeight.w800, fontSize: 11)),
                  ),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, -4))],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: const BoxDecoration(gradient: AppColors.gradientPrimary, shape: BoxShape.circle),
                        child: Center(child: Text(name.isNotEmpty ? name[0] : 'P', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800))),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(name, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                            Text(_statusLabel(stage), style: const TextStyle(color: AppColors.inkMuted, fontSize: 13)),
                          ],
                        ),
                      ),
                      _IconBtn(Icons.phone, () => launchPhone(phone)),
                      const SizedBox(width: 8),
                      _IconBtn(Icons.chat_bubble_outline, () {
                        final id = ref.read(activeBookingIdProvider);
                        if (id != null) context.push('/chat/$id?name=${Uri.encodeComponent(name)}');
                      }),
                    ],
                  ),
                  const SizedBox(height: 16),
                  GradientButton(
                    label: stage == 'arrived' ? 'Show OTP' : 'Refresh Status',
                    onPressed: () => stage == 'arrived' ? context.push('/otp') : _load(),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _statusLabel(String stage) => switch (stage) {
        'accepted' => 'Professional accepted',
        'on_the_way' => 'On The Way',
        'arrived' => 'Professional Arrived',
        _ => 'Live Status: On The Way',
      };
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;
  const _IconBtn(this.icon, this.onTap);
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(color: AppColors.lavender, borderRadius: BorderRadius.circular(12)),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
    );
  }
}

class _MapPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final routePaint = Paint()..color = AppColors.primary..strokeWidth = 4..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final path = Path()
      ..moveTo(size.width * 0.2, size.height * 0.7)
      ..quadraticBezierTo(size.width * 0.5, size.height * 0.5, size.width * 0.7, size.height * 0.35);
    canvas.drawPath(path, routePaint);
    canvas.drawCircle(Offset(size.width * 0.7, size.height * 0.35), 12, Paint()..color = AppColors.primary);
    canvas.drawCircle(Offset(size.width * 0.2, size.height * 0.7), 12, Paint()..color = AppColors.success);
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
