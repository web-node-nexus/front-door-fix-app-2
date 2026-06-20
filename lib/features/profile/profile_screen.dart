import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/glass_card.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
          children: [
            const Text('Profile', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800)),
            const SizedBox(height: 20),
            AppCard(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: const BoxDecoration(gradient: AppColors.gradientPrimary, shape: BoxShape.circle),
                    child: Center(child: Text((user?.name.isNotEmpty == true ? user!.name[0] : 'U').toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w800))),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user?.name ?? 'Guest', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                        Text(user?.phone ?? user?.email ?? 'Not logged in', style: const TextStyle(fontSize: 14, color: AppColors.inkMuted)),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
                    onPressed: () => showSnackBar(context, 'Edit profile coming soon'),
                  ),
                ],
              ),
            ),
            if (!auth.isAuthenticated) ...[
              const SizedBox(height: 16),
              ElevatedButton(onPressed: () => context.push('/login'), child: const Text('Login to access all features')),
            ],
            const SizedBox(height: 20),
            _MenuSection(title: 'Account', items: [
              _MenuItem(icon: Icons.location_city_outlined, title: 'Saved Addresses', subtitle: 'Manage addresses', onTap: () => context.push('/addresses')),
              _MenuItem(icon: Icons.payment_outlined, title: 'Payment History', subtitle: 'View past payments', onTap: () => context.push('/payment-history')),
              _MenuItem(icon: Icons.account_balance_wallet_outlined, title: 'Wallet', subtitle: '₹250 balance', onTap: () => showSnackBar(context, 'Wallet: ₹250 available')),
            ]),
            const SizedBox(height: 16),
            _MenuSection(title: 'Preferences', items: [
              _MenuItem(icon: Icons.notifications_outlined, title: 'Notifications', onTap: () => showSnackBar(context, 'Notifications enabled')),
              _MenuItem(icon: Icons.language, title: 'Language', subtitle: 'English', onTap: () => _pickLanguage(context)),
              _MenuItem(icon: Icons.help_outline, title: 'Help & Support', onTap: () => context.go('/support')),
            ]),
            const SizedBox(height: 16),
            _MenuSection(title: 'Settings', items: [
              _MenuItem(icon: Icons.privacy_tip_outlined, title: 'Privacy Policy', onTap: () => showSnackBar(context, 'Privacy Policy')),
              _MenuItem(icon: Icons.description_outlined, title: 'Terms of Service', onTap: () => showSnackBar(context, 'Terms of Service')),
              if (auth.isAuthenticated)
                _MenuItem(icon: Icons.logout, title: 'Logout', isDestructive: true, onTap: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (context.mounted) context.go('/login');
                }),
            ]),
          ],
        ),
      ),
    );
  }

  void _pickLanguage(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (ctx) => Column(
        mainAxisSize: MainAxisSize.min,
        children: ['English', 'Hindi', 'Marathi'].map((l) => ListTile(title: Text(l), onTap: () {
          Navigator.pop(ctx);
          showSnackBar(context, 'Language set to $l');
        })).toList(),
      ),
    );
  }

  void showSnackBar(BuildContext context, String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }
}

class _MenuSection extends StatelessWidget {
  final String title;
  final List<_MenuItem> items;
  const _MenuSection({required this.title, required this.items});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.inkMuted)),
        const SizedBox(height: 8),
        AppCard(
          padding: EdgeInsets.zero,
          child: Column(
            children: items.asMap().entries.map((e) {
              final item = e.value;
              return Column(children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: item.isDestructive ? Colors.red.withValues(alpha: 0.1) : AppColors.lavender, borderRadius: BorderRadius.circular(10)),
                    child: Icon(item.icon, color: item.isDestructive ? Colors.red : AppColors.primary, size: 20),
                  ),
                  title: Text(item.title, style: TextStyle(fontWeight: FontWeight.w600, color: item.isDestructive ? Colors.red : AppColors.ink)),
                  subtitle: item.subtitle != null ? Text(item.subtitle!, style: const TextStyle(fontSize: 12)) : null,
                  trailing: const Icon(Icons.chevron_right, color: AppColors.inkLight),
                  onTap: item.onTap,
                ),
                if (e.key < items.length - 1) const Divider(height: 1, indent: 56),
              ]);
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class _MenuItem {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool isDestructive;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.title, this.subtitle, this.isDestructive = false, required this.onTap});
}
