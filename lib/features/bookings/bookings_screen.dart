import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_client.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/glass_card.dart';

class BookingsScreen extends ConsumerStatefulWidget {
  const BookingsScreen({super.key});

  @override
  ConsumerState<BookingsScreen> createState() => _BookingsScreenState();
}

class _BookingsScreenState extends ConsumerState<BookingsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _tabs = ['Upcoming', 'Active', 'Completed', 'Cancelled'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _cancel(BookingSummary b) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Cancel booking?'),
        content: Text('Cancel ${b.service}?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Yes, Cancel')),
        ],
      ),
    );
    if (ok != true) return;
    try {
      await apiClient.post('/bookings/${b.id}/cancel');
      ref.invalidate(bookingsListProvider);
      if (mounted) showSnack(context, 'Booking cancelled');
    } catch (e) {
      if (mounted) showSnack(context, e.toString(), error: true);
    }
  }

  void _track(BookingSummary b) {
    ref.read(activeBookingIdProvider.notifier).setId(b.id);
    if (b.tab == 'Active') {
      final stage = b.workflowStage ?? '';
      if (stage == 'arrived') {
        context.push('/otp');
      } else if (['work_started', 'otp_verified'].contains(stage)) {
        context.push('/progress');
      } else if (b.professional != null) {
        context.push('/tracking');
      } else {
        context.push('/searching');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final async = ref.watch(bookingsListProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('My Bookings'), actions: [
        IconButton(icon: const Icon(Icons.refresh), onPressed: () => ref.invalidate(bookingsListProvider)),
      ]),
      body: Column(
        children: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(color: AppColors.canvas, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
            child: TabBar(
              controller: _tabController,
              isScrollable: true,
              tabAlignment: TabAlignment.start,
              indicator: BoxDecoration(gradient: AppColors.gradientPrimary, borderRadius: BorderRadius.circular(12)),
              indicatorSize: TabBarIndicatorSize.tab,
              labelColor: Colors.white,
              unselectedLabelColor: AppColors.inkMuted,
              dividerColor: Colors.transparent,
              labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
              padding: const EdgeInsets.all(4),
              tabs: _tabs.map((t) => Tab(text: t)).toList(),
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: async.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Could not load bookings'),
                    const SizedBox(height: 8),
                    ElevatedButton(onPressed: () => ref.invalidate(bookingsListProvider), child: const Text('Retry')),
                  ],
                ),
              ),
              data: (bookings) => TabBarView(
                controller: _tabController,
                children: _tabs.map((tab) {
                  final filtered = bookings.where((b) => b.tab == tab).toList();
                  return _BookingList(
                    bookings: filtered,
                    onTrack: tab == 'Active' ? _track : null,
                    onCancel: tab == 'Upcoming' ? _cancel : null,
                    onReview: tab == 'Completed' ? (b) {
                      ref.read(activeBookingIdProvider.notifier).setId(b.id);
                      context.push('/review');
                    } : null,
                  );
                }).toList(),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BookingList extends StatelessWidget {
  final List<BookingSummary> bookings;
  final void Function(BookingSummary)? onTrack;
  final void Function(BookingSummary)? onCancel;
  final void Function(BookingSummary)? onReview;

  const _BookingList({required this.bookings, this.onTrack, this.onCancel, this.onReview});

  @override
  Widget build(BuildContext context) {
    if (bookings.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.calendar_today_outlined, size: 64, color: AppColors.inkLight.withValues(alpha: 0.5)),
            const SizedBox(height: 16),
            const Text('No bookings here', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: AppColors.inkMuted)),
            const SizedBox(height: 12),
            TextButton(onPressed: () => context.go('/services'), child: const Text('Book a service')),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
      itemCount: bookings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, i) {
        final b = bookings[i];
        return AppCard(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(color: _statusColor(b.tab).withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(b.tab, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _statusColor(b.tab))),
                  ),
                  const Spacer(),
                  Text('#${b.bookingCode}', style: const TextStyle(fontSize: 12, color: AppColors.inkMuted)),
                ],
              ),
              const SizedBox(height: 12),
              Text(b.service, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              _InfoRow(icon: Icons.calendar_today, text: '${b.date} · ${b.timeSlot}'),
              const SizedBox(height: 4),
              _InfoRow(icon: Icons.location_on_outlined, text: b.address),
              if (b.professional != null) ...[
                const SizedBox(height: 4),
                _InfoRow(icon: Icons.person_outline, text: b.professional!),
              ],
              const Divider(height: 24),
              Row(
                children: [
                  Text('₹${b.amount.round()}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  const Spacer(),
                  if (onCancel != null)
                    TextButton(onPressed: () => onCancel!(b), child: const Text('Cancel', style: TextStyle(color: Colors.red))),
                  if (onTrack != null)
                    TextButton(onPressed: () => onTrack!(b), child: const Text('Track Live', style: TextStyle(fontWeight: FontWeight.w700))),
                  if (onReview != null)
                    TextButton(onPressed: () => onReview!(b), child: const Text('Rate', style: TextStyle(fontWeight: FontWeight.w700))),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Color _statusColor(String tab) => switch (tab) {
        'Active' => AppColors.primary,
        'Completed' => AppColors.success,
        'Cancelled' => AppColors.inkMuted,
        _ => AppColors.warning,
      };
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const _InfoRow({required this.icon, required this.text});
  @override
  Widget build(BuildContext context) {
    return Row(children: [Icon(icon, size: 16, color: AppColors.inkMuted), const SizedBox(width: 8), Expanded(child: Text(text, style: const TextStyle(fontSize: 13, color: AppColors.inkMuted)))]);
  }
}
