import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/data/mock_data.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/launchers.dart';
import '../../shared/widgets/glass_card.dart';

class SupportScreen extends ConsumerStatefulWidget {
  const SupportScreen({super.key});

  @override
  ConsumerState<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends ConsumerState<SupportScreen> {
  final _expanded = <int>{};

  void _raiseTicket() {
    showDialog(
      context: context,
      builder: (ctx) {
        final subject = TextEditingController();
        final body = TextEditingController();
        return AlertDialog(
          title: const Text('Raise a Ticket'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(controller: subject, decoration: const InputDecoration(labelText: 'Subject')),
              const SizedBox(height: 12),
              TextField(controller: body, maxLines: 3, decoration: const InputDecoration(labelText: 'Describe your issue')),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                showSnack(context, 'Ticket submitted! We\'ll contact you soon.');
              },
              child: const Text('Submit'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Support')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 100),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(gradient: AppColors.gradientHero, borderRadius: BorderRadius.circular(20)),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('How can we help?', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                SizedBox(height: 4),
                Text('We\'re here 24/7 for you', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: _SupportAction(icon: Icons.chat_bubble_outline, label: 'Live Chat', color: AppColors.lavender, onTap: () => launchWhatsApp(null, message: 'Hi, I need help with my booking'))),
            const SizedBox(width: 12),
            Expanded(child: _SupportAction(icon: Icons.phone, label: 'Call', color: const Color(0xFFD1FAE5), onTap: () => launchPhone(null))),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: _SupportAction(icon: Icons.message, label: 'WhatsApp', color: const Color(0xFFDCFCE7), onTap: () => launchWhatsApp(null))),
            const SizedBox(width: 12),
            Expanded(child: _SupportAction(icon: Icons.confirmation_number_outlined, label: 'Raise Ticket', color: const Color(0xFFFFF7ED), onTap: _raiseTicket)),
          ]),
          const SizedBox(height: 28),
          const Text('Frequently Asked Questions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          ...List.generate(MockData.faqs.length, (i) {
            final faq = MockData.faqs[i];
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: AppCard(
                padding: EdgeInsets.zero,
                child: ExpansionTile(
                  onExpansionChanged: (v) => setState(() { if (v) _expanded.add(i); else _expanded.remove(i); }),
                  tilePadding: const EdgeInsets.symmetric(horizontal: 16),
                  title: Text(faq['q']!, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700)),
                  children: [Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16), child: Align(alignment: Alignment.centerLeft, child: Text(faq['a']!, style: const TextStyle(fontSize: 13, color: AppColors.inkMuted, height: 1.5))))],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _SupportAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _SupportAction({required this.icon, required this.label, required this.color, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 20),
      child: Column(children: [
        Container(padding: const EdgeInsets.all(12), decoration: BoxDecoration(color: color, shape: BoxShape.circle), child: Icon(icon, color: AppColors.primary, size: 24)),
        const SizedBox(height: 10),
        Text(label, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
      ]),
    );
  }
}
