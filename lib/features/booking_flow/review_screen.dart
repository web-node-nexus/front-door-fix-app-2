import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/gradient_button.dart';

class ReviewScreen extends ConsumerStatefulWidget {
  const ReviewScreen({super.key});

  @override
  ConsumerState<ReviewScreen> createState() => _ReviewScreenState();
}

class _ReviewScreenState extends ConsumerState<ReviewScreen> {
  int _rating = 5;
  final _reviewController = TextEditingController();
  bool _submitting = false;
  String _proName = 'Professional';

  @override
  void initState() {
    super.initState();
    _loadPro();
  }

  Future<void> _loadPro() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    try {
      final data = await fetchTracking(id);
      final pro = data['professional'] as Map<String, dynamic>?;
      if (mounted) setState(() => _proName = pro?['name'] as String? ?? 'Professional');
    } catch (_) {}
  }

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final id = ref.read(activeBookingIdProvider);
    if (id == null) return;
    setState(() => _submitting = true);
    try {
      await apiClient.post('/bookings/$id/review', body: {
        'rating': _rating,
        'comment': _reviewController.text.trim(),
      });
      ref.invalidate(bookingsListProvider);
      if (!mounted) return;
      showSnack(context, 'Thank you for your review!');
      context.go('/home');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Rate & Review'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new, size: 20), onPressed: () => context.pop()),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 120),
        children: [
          const SizedBox(height: 12),
          Center(
            child: Column(
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: const BoxDecoration(gradient: AppColors.gradientPrimary, shape: BoxShape.circle),
                  child: Center(child: Text(_proName.isNotEmpty ? _proName[0] : 'P', style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800))),
                ),
                const SizedBox(height: 12),
                Text(_proName, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
          const SizedBox(height: 32),
          const Text('How was your experience?', textAlign: TextAlign.center, style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (i) => GestureDetector(
              onTap: () => setState(() => _rating = i + 1),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Icon(i < _rating ? Icons.star : Icons.star_border, size: 44, color: AppColors.gold),
              ),
            )),
          ),
          const SizedBox(height: 28),
          const Text('Write a review', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          TextField(controller: _reviewController, maxLines: 5, decoration: const InputDecoration(hintText: 'Share your experience...')),
          const SizedBox(height: 24),
          const Text('Add Photos', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700)),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: () => showSnack(context, 'Photo upload coming soon'),
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(color: AppColors.lavender, borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.add_a_photo_outlined, color: AppColors.primary, size: 28),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
        child: SafeArea(child: GradientButton(label: _submitting ? 'Submitting...' : 'Submit Review', onPressed: _submitting ? null : _submit)),
      ),
    );
  }
}
