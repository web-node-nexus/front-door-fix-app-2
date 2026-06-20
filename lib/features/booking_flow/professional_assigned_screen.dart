import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/glass_card.dart';
import '../../shared/widgets/gradient_button.dart';

class ProfessionalAssignedScreen extends ConsumerStatefulWidget {
  const ProfessionalAssignedScreen({super.key});

  @override
  ConsumerState<ProfessionalAssignedScreen> createState() => _ProfessionalAssignedScreenState();
}

class _ProfessionalAssignedScreenState extends ConsumerState<ProfessionalAssignedScreen> {
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

  Map<String, dynamic>? get _pro => _track?['professional'] as Map<String, dynamic>?;

  @override
  Widget build(BuildContext context) {
    final pro = _pro;
    final name = pro?['name'] as String? ?? 'Professional';
    final phone = pro?['phone'] as String?;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Professional Assigned'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new, size: 20), onPressed: () => context.pop()),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(gradient: AppColors.gradientHero, borderRadius: BorderRadius.circular(20)),
            child: const Text('Your Professional is\nOn The Way!', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, height: 1.3)),
          ),
          const SizedBox(height: 20),
          AppCard(
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: const BoxDecoration(gradient: AppColors.gradientPrimary, shape: BoxShape.circle),
                  child: Center(child: Text(name.isNotEmpty ? name[0] : 'P', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800))),
                ),
                const SizedBox(height: 12),
                Text(name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
                Text(_track?['category'] as String? ?? 'Service Expert', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.star, color: AppColors.gold, size: 18),
                    const SizedBox(width: 4),
                    Text('${pro?['rating'] ?? '4.8'}', style: const TextStyle(fontWeight: FontWeight.w700)),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(child: _ActionBtn(icon: Icons.phone, label: 'Call', onTap: () => launchPhone(phone))),
                    const SizedBox(width: 12),
                    Expanded(child: _ActionBtn(icon: Icons.message, label: 'WhatsApp', onTap: () => launchWhatsApp(phone))),
                    const SizedBox(width: 12),
                    Expanded(child: _ActionBtn(icon: Icons.chat_bubble_outline, label: 'Chat', onTap: () {
                      final id = ref.read(activeBookingIdProvider);
                      if (id != null) context.push('/chat/$id?name=${Uri.encodeComponent(name)}');
                    })),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          if (pro != null)
            AppCard(
              child: Column(
                children: [
                  _StatRow('Experience', pro['experience'] as String? ?? ''),
                  _StatRow('Jobs Completed', pro['jobs'] as String? ?? ''),
                  _StatRow('Language', pro['languages'] as String? ?? 'Hindi, English'),
                  _StatRow('Vehicle Number', pro['vehicle_plate'] as String? ?? ''),
                ],
              ),
            ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: SafeArea(child: GradientButton(label: 'Track Live', icon: Icons.my_location, onPressed: () => context.push('/tracking'))),
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _ActionBtn({required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(color: AppColors.lavender, borderRadius: BorderRadius.circular(14)),
        child: Column(children: [Icon(icon, color: AppColors.primary, size: 22), const SizedBox(height: 4), Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700))]),
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  const _StatRow(this.label, this.value);
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: Row(children: [Text(label, style: const TextStyle(color: AppColors.inkMuted)), const Spacer(), Text(value, style: const TextStyle(fontWeight: FontWeight.w700))]),
    );
  }
}
