import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/category_icons.dart';
import '../../shared/widgets/glass_card.dart';

class ServiceListScreen extends ConsumerStatefulWidget {
  final String? category;

  const ServiceListScreen({super.key, this.category});

  @override
  ConsumerState<ServiceListScreen> createState() => _ServiceListScreenState();
}

class _ServiceListScreenState extends ConsumerState<ServiceListScreen> {
  late String _selectedCategory;
  final _searchController = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.category ?? 'All';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  static const _categories = ['All', 'ac-service', 'cleaning', 'appliance-repair', 'electrician', 'plumbing', 'carpentry', 'painting', 'pest-control', 'ro-service'];

  String _categoryLabel(String slug) => switch (slug) {
        'All' => 'All',
        'ac-service' => 'AC Service',
        'cleaning' => 'Cleaning',
        'appliance-repair' => 'Appliance',
        'electrician' => 'Electrician',
        'plumbing' => 'Plumbing',
        'carpentry' => 'Carpentry',
        'painting' => 'Painting',
        'pest-control' => 'Pest Control',
        'ro-service' => 'RO Service',
        _ => slug,
      };

  @override
  Widget build(BuildContext context) {
    final categoryParam = _selectedCategory == 'All' ? null : _selectedCategory;
    final async = ref.watch(servicesProvider((category: categoryParam, q: _query.isEmpty ? null : _query)));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Select Service'),
        leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new, size: 20), onPressed: () => context.pop()),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () => showSearch(
              context: context,
              delegate: _ServiceSearchDelegate((q) => setState(() => _query = q)),
            ),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          SizedBox(
            height: 44,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, i) {
                final cat = _categories[i];
                final selected = cat == _selectedCategory;
                return GestureDetector(
                  onTap: () => setState(() => _selectedCategory = cat),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      gradient: selected ? AppColors.gradientPrimary : null,
                      color: selected ? null : AppColors.canvas,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: selected ? Colors.transparent : AppColors.border),
                    ),
                    child: Text(_categoryLabel(cat), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: selected ? Colors.white : AppColors.inkMuted)),
                  ),
                );
              },
            ),
          ),
          if (_query.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
              child: Row(
                children: [
                  Expanded(child: Text('Results for "$_query"', style: const TextStyle(fontSize: 13, color: AppColors.inkMuted))),
                  GestureDetector(onTap: () => setState(() => _query = ''), child: const Text('Clear', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
                ],
              ),
            ),
          const SizedBox(height: 16),
          Expanded(
            child: async.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Text('Could not load services'),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: () => ref.invalidate(servicesProvider), child: const Text('Retry')),
              ])),
              data: (services) {
                if (services.isEmpty) return const Center(child: Text('No services found'));
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
                  itemCount: services.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, i) {
                    final s = services[i];
                    return AppCard(
                      onTap: () => context.push('/book-service', extra: {'service': s}),
                      padding: const EdgeInsets.all(14),
                      child: Row(
                        children: [
                          Container(
                            width: 56,
                            height: 56,
                            decoration: BoxDecoration(color: colorForIndex(i), borderRadius: BorderRadius.circular(16)),
                            child: Icon(iconForCategory(s.categorySlug, s.categoryName), color: AppColors.primary, size: 28),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(s.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                                const SizedBox(height: 4),
                                const Row(children: [
                                  Icon(Icons.star, size: 14, color: AppColors.gold),
                                  SizedBox(width: 4),
                                  Text('4.5', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                                  Text(' (120 reviews)', style: TextStyle(fontSize: 12, color: AppColors.inkMuted)),
                                ]),
                              ],
                            ),
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              const Text('Starting from', style: TextStyle(fontSize: 11, color: AppColors.inkMuted)),
                              Text('₹${s.price}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary)),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _ServiceSearchDelegate extends SearchDelegate<void> {
  final void Function(String) onQuery;
  _ServiceSearchDelegate(this.onQuery);

  @override
  List<Widget>? buildActions(BuildContext context) => [
        IconButton(icon: const Icon(Icons.clear), onPressed: () { query = ''; showSuggestions(context); }),
      ];

  @override
  Widget? buildLeading(BuildContext context) => IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => close(context, null));

  @override
  Widget buildResults(BuildContext context) {
    onQuery(query);
    close(context, null);
    return const SizedBox.shrink();
  }

  @override
  Widget buildSuggestions(BuildContext context) => const SizedBox.shrink();
}
