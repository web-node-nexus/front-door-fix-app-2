import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/data/mock_data.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/category_icons.dart';
import '../../shared/widgets/booking_footer.dart';
import '../../shared/widgets/glass_card.dart';

class BookServiceScreen extends ConsumerStatefulWidget {
  final ServiceModel? service;

  const BookServiceScreen({super.key, this.service});

  @override
  ConsumerState<BookServiceScreen> createState() => _BookServiceScreenState();
}

class _BookServiceScreenState extends ConsumerState<BookServiceScreen> {
  int _selectedDate = 0;
  int _selectedSlot = 2;
  final _instructions = TextEditingController();
  Map<String, dynamic>? _address;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(addressesProvider.future).then((list) {
        if (list.isNotEmpty && mounted) setState(() => _address = list.first);
      }).catchError((_) {});
    });
  }

  @override
  void dispose() {
    _instructions.dispose();
    super.dispose();
  }

  ServiceModel get _service => widget.service ?? const ServiceModel(id: 0, name: 'Service', price: 499);

  void _continue() {
    final addr = _address;
    final dates = List.generate(7, (i) => DateTime.now().add(Duration(days: i)));
    final draft = BookingDraft(
      serviceId: _service.id,
      serviceName: _service.name,
      price: _service.price,
      date: dates[_selectedDate],
      timeSlot: MockData.timeSlots[_selectedSlot],
      address: addr?['full_address'] as String? ?? MockData.userAddress,
      city: addr?['city'] as String? ?? 'Mumbai',
      pincode: addr?['pincode'] as String? ?? '400001',
    );
    ref.read(bookingDraftProvider.notifier).setDraft(draft);
    context.push('/payment');
  }

  Future<void> _pickAddress(List<Map<String, dynamic>> addresses) async {
    final picked = await showModalBottomSheet<Map<String, dynamic>>(
      context: context,
      builder: (ctx) => ListView(
        children: addresses.map((a) => ListTile(
          title: Text(a['label'] as String? ?? 'Address'),
          subtitle: Text(a['full_address'] as String? ?? ''),
          onTap: () => Navigator.pop(ctx, a),
        )).toList(),
      ),
    );
    if (picked != null) setState(() => _address = picked);
  }

  @override
  Widget build(BuildContext context) {
    final dates = List.generate(7, (i) => DateTime.now().add(Duration(days: i)));
    final total = _service.price + 49 + (_service.price * 0.18).round();
    final addressesAsync = ref.watch(addressesProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        flexibleSpace: Container(decoration: const BoxDecoration(gradient: AppColors.gradientPrimary)),
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Book Service', style: TextStyle(color: Colors.white)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: Colors.white),
          onPressed: () => context.pop(),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 120),
        children: [
          AppCard(
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.lavender, borderRadius: BorderRadius.circular(14)),
                  child: Icon(iconForCategory(_service.categorySlug, _service.categoryName), color: AppColors.primary, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_service.name, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
                      Text('Starting from ₹${_service.price}', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const _SectionTitle('Select Date'),
          const SizedBox(height: 12),
          SizedBox(
            height: 80,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: dates.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (context, i) {
                final d = dates[i];
                final selected = i == _selectedDate;
                return GestureDetector(
                  onTap: () => setState(() => _selectedDate = i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 64,
                    decoration: BoxDecoration(
                      gradient: selected ? AppColors.gradientPrimary : null,
                      color: selected ? null : AppColors.canvas,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: selected ? Colors.transparent : AppColors.border),
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(DateFormat('EEE').format(d), style: TextStyle(fontSize: 12, color: selected ? Colors.white70 : AppColors.inkMuted)),
                        Text('${d.day}', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: selected ? Colors.white : AppColors.ink)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          const _SectionTitle('Select Time Slot'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: List.generate(MockData.timeSlots.length, (i) {
              final selected = i == _selectedSlot;
              return GestureDetector(
                onTap: () => setState(() => _selectedSlot = i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    gradient: selected ? AppColors.gradientPrimary : null,
                    color: selected ? null : AppColors.canvas,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: selected ? Colors.transparent : AppColors.border),
                  ),
                  child: Text(MockData.timeSlots[i], style: TextStyle(fontWeight: FontWeight.w600, color: selected ? Colors.white : AppColors.ink)),
                ),
              );
            }),
          ),
          const SizedBox(height: 24),
          const _SectionTitle('Service Address'),
          const SizedBox(height: 12),
          AppCard(
            onTap: () => addressesAsync.whenData((list) { if (list.isNotEmpty) _pickAddress(list); }),
            child: Row(
              children: [
                const Icon(Icons.location_on, color: AppColors.primary),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_address?['label'] as String? ?? 'Home', style: const TextStyle(fontWeight: FontWeight.w700)),
                      Text(
                        _address?['full_address'] as String? ?? MockData.userAddress,
                        style: const TextStyle(fontSize: 13, color: AppColors.inkMuted),
                      ),
                    ],
                  ),
                ),
                const Text('Change', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const _SectionTitle('Special Instructions (Optional)'),
          const SizedBox(height: 12),
          TextField(controller: _instructions, maxLines: 3, decoration: const InputDecoration(hintText: 'Any special instructions...')),
        ],
      ),
      bottomNavigationBar: BookingFooter(total: total, buttonLabel: 'Continue', onPressed: _service.id > 0 ? _continue : null),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);
  @override
  Widget build(BuildContext context) => Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800));
}
