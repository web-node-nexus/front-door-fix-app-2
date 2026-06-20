import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/mock_data.dart';
import '../../core/providers/booking_flow_provider.dart';
import '../../core/providers/catalog_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/category_icons.dart';
import '../../shared/widgets/glass_card.dart';
import '../../shared/widgets/section_header.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final homeAsync = ref.watch(homeDataProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: homeAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (_, __) => _HomeBody(categories: const [], services: MockData.popularServices.map((s) => ServiceModel(id: int.tryParse(s.id) ?? 0, name: s.name, price: s.price, categoryName: s.category)).toList(), offline: true),
          data: (home) {
            final services = home.featured.isNotEmpty
                ? home.featured
                : MockData.popularServices.map((s) => ServiceModel(id: int.tryParse(s.id) ?? 0, name: s.name, price: s.price, categoryName: s.category)).toList();
            return _HomeBody(categories: home.categories, services: services);
          },
        ),
      ),
    );
  }
}

class _HomeBody extends StatelessWidget {
  final List<Map<String, dynamic>> categories;
  final List<ServiceModel> services;
  final bool offline;

  const _HomeBody({required this.categories, required this.services, this.offline = false});

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(child: _Header(offline: offline)),
        SliverToBoxAdapter(child: _SearchBar()),
        SliverToBoxAdapter(child: _HeroBanner(onBook: () => context.push('/services?category=ac-service'))),
        const SliverToBoxAdapter(child: SizedBox(height: 24)),
        SliverToBoxAdapter(child: SectionHeader(title: 'Popular Services', action: 'See All', onAction: () => context.push('/services'))),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          sliver: SliverGrid(
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 4, mainAxisSpacing: 12, crossAxisSpacing: 12, childAspectRatio: 0.82),
            delegate: SliverChildBuilderDelegate(
              (context, i) {
                if (i >= services.length) {
                  return _ServiceTile(name: 'More', icon: Icons.grid_view_rounded, color: AppColors.lavender, onTap: () => context.push('/services'));
                }
                final s = services[i];
                return _ServiceTile(
                  name: s.name,
                  icon: iconForCategory(s.categorySlug, s.categoryName),
                  color: colorForIndex(i),
                  onTap: () => context.push('/book-service', extra: {'service': s}),
                );
              },
              childCount: services.length + 1,
            ),
          ),
        ),
        const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(child: SectionHeader(title: 'Why Choose Us')),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        const SliverToBoxAdapter(child: _WhyChooseUs()),
        const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(child: SectionHeader(title: 'Featured Offers')),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        SliverToBoxAdapter(child: _OffersSection(onOffer: (cat) => context.push('/services?category=$cat'))),
        const SliverToBoxAdapter(child: SizedBox(height: 28)),
        SliverToBoxAdapter(child: SectionHeader(title: 'Customer Reviews')),
        const SliverToBoxAdapter(child: SizedBox(height: 12)),
        const SliverToBoxAdapter(child: _ReviewsSection()),
        const SliverToBoxAdapter(child: SizedBox(height: 100)),
      ],
    );
  }
}

class _Header extends StatelessWidget {
  final bool offline;
  const _Header({this.offline = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => _showLocations(context),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    const Text('Your Location', style: TextStyle(fontSize: 12, color: AppColors.inkMuted)),
                    if (offline) ...[const SizedBox(width: 8), Container(padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2), decoration: BoxDecoration(color: AppColors.warning.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)), child: const Text('Offline', style: TextStyle(fontSize: 10, color: AppColors.warning, fontWeight: FontWeight.w700)))],
                  ]),
                  const SizedBox(height: 2),
                  Row(children: [
                    const Icon(Icons.location_on, color: AppColors.primary, size: 18),
                    const SizedBox(width: 4),
                    Text(MockData.location, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    const Icon(Icons.keyboard_arrow_down, color: AppColors.inkMuted, size: 20),
                  ]),
                ],
              ),
            ),
          ),
          GestureDetector(
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No new notifications'))),
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(color: AppColors.canvas, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border), boxShadow: AppColors.softShadow),
              child: const Icon(Icons.notifications_none_rounded),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: 400.ms);
  }

  void _showLocations(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: ['Powai, Mumbai', 'Andheri, Mumbai', 'Bandra, Mumbai'].map((l) => ListTile(
          leading: const Icon(Icons.location_on, color: AppColors.primary),
          title: Text(l),
          onTap: () { Navigator.pop(ctx); ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Location set to $l'))); },
        )).toList(),
      ),
    );
  }
}

class _SearchBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
      child: Row(
        children: [
          Expanded(
            child: GestureDetector(
              onTap: () => context.push('/services'),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                height: 50,
                decoration: BoxDecoration(color: AppColors.canvas, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border), boxShadow: AppColors.softShadow),
                child: const Row(children: [Icon(Icons.search, color: AppColors.inkMuted), SizedBox(width: 10), Text('Search for services...', style: TextStyle(color: AppColors.inkLight))]),
              ),
            ),
          ),
          const SizedBox(width: 10),
          GestureDetector(
            onTap: () => context.push('/services'),
            child: Container(
              height: 50,
              width: 50,
              decoration: BoxDecoration(gradient: AppColors.gradientPrimary, borderRadius: BorderRadius.circular(16)),
              child: const Icon(Icons.tune_rounded, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  final VoidCallback onBook;
  const _HeroBanner({required this.onBook});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      child: GestureDetector(
        onTap: onBook,
        child: Container(
          height: 170,
          decoration: BoxDecoration(gradient: AppColors.gradientHero, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: AppColors.primary.withValues(alpha: 0.3), blurRadius: 24, offset: const Offset(0, 10))]),
          child: Stack(
            children: [
              Positioned(right: -10, bottom: -10, child: Icon(Icons.ac_unit, size: 120, color: Colors.white.withValues(alpha: 0.15))),
              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4), decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(8)), child: const Text('SUMMER DEAL', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1))),
                    const SizedBox(height: 8),
                    const Text('Up to 20% OFF', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
                    const Text('on AC Services', style: TextStyle(color: Colors.white70)),
                    const Spacer(),
                    Container(padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)), child: const Text('Book Now', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ServiceTile extends StatelessWidget {
  final String name;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;
  const _ServiceTile({required this.name, required this.icon, required this.color, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(children: [
        Container(width: 64, height: 64, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(18), border: Border.all(color: AppColors.border)), child: Icon(icon, color: AppColors.primary, size: 28)),
        const SizedBox(height: 8),
        Text(name, textAlign: TextAlign.center, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
      ]),
    );
  }
}

class _WhyChooseUs extends StatelessWidget {
  const _WhyChooseUs();
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 110,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: MockData.whyChooseUs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final item = MockData.whyChooseUs[i];
          return GlassCard(
            padding: const EdgeInsets.all(14),
            child: SizedBox(
              width: 130,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(padding: const EdgeInsets.all(10), decoration: const BoxDecoration(color: AppColors.lavender, shape: BoxShape.circle), child: Icon(item['icon'] as IconData, color: AppColors.primary, size: 22)),
                  const SizedBox(height: 8),
                  Text(item['title'] as String, textAlign: TextAlign.center, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                  Text(item['subtitle'] as String, textAlign: TextAlign.center, style: const TextStyle(fontSize: 10, color: AppColors.inkMuted)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _OffersSection extends StatelessWidget {
  final void Function(String category) onOffer;
  const _OffersSection({required this.onOffer});
  @override
  Widget build(BuildContext context) {
    final offers = [
      ('SUMMER DEAL', 'Up to 20% OFF on AC Services', 'Book Now', 'ac-service'),
      ('NEW USER', 'Flat ₹200 OFF on first booking', 'Claim Offer', 'cleaning'),
    ];
    return SizedBox(
      height: 132,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: offers.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final o = offers[i];
          return GestureDetector(
            onTap: () => onOffer(o.$4),
            child: Container(
              width: 260,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(gradient: AppColors.gradientLavender, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.lavenderDark)),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.center, children: [
                  Text(o.$1, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                  const SizedBox(height: 4),
                  Text(o.$2, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Text(o.$3, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.primary)),
                ])),
                const Icon(Icons.local_offer, color: AppColors.primary, size: 40),
              ]),
            ),
          );
        },
      ),
    );
  }
}

class _ReviewsSection extends StatelessWidget {
  const _ReviewsSection();
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 140,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: MockData.reviews.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, i) {
          final r = MockData.reviews[i];
          return AppCard(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: 260,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    CircleAvatar(radius: 18, backgroundColor: AppColors.lavender, child: Text(r.name[0], style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary))),
                    const SizedBox(width: 10),
                    Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [Text(r.name, style: const TextStyle(fontWeight: FontWeight.w700)), Row(children: List.generate(5, (j) => Icon(j < r.rating.floor() ? Icons.star : Icons.star_border, size: 14, color: AppColors.gold)))])),
                    Text(r.date, style: const TextStyle(fontSize: 11, color: AppColors.inkMuted)),
                  ]),
                  const SizedBox(height: 10),
                  Text(r.text, maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 13, color: AppColors.inkMuted, height: 1.4)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
