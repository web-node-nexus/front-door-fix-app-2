import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/theme/app_colors.dart';
import '../../shared/widgets/glass_text_field.dart';
import '../../shared/widgets/gradient_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _email = TextEditingController(text: 'customer@frontdoor.in');
  final _password = TextEditingController(text: 'password');
  final _formKey = GlobalKey<FormState>();
  bool _obscure = true;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    final ok = await ref.read(authProvider.notifier).login(_email.text.trim(), _password.text);
    if (!mounted) return;
    if (ok) {
      final redirect = GoRouterState.of(context).uri.queryParameters['from'];
      context.go(redirect ?? '/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final size = MediaQuery.sizeOf(context);

    return Scaffold(
      body: Stack(
        children: [
          // Premium gradient background
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFFFFF5F9), Color(0xFFFDF4FF), Color(0xFFF8F9FC), Color(0xFFFFF0F6)],
              ),
            ),
          ),
          // Decorative orbs
          Positioned(top: -80, right: -60, child: _Orb(size: 220, color: AppColors.primary.withValues(alpha: 0.18))),
          Positioned(top: size.height * 0.15, left: -90, child: _Orb(size: 180, color: const Color(0xFFE879F9).withValues(alpha: 0.15))),
          Positioned(bottom: -50, right: -40, child: _Orb(size: 160, color: AppColors.primaryLight.withValues(alpha: 0.12))),
          Positioned(bottom: size.height * 0.2, left: size.width * 0.1, child: _Orb(size: 90, color: AppColors.lavenderDark.withValues(alpha: 0.35))),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: [
                      // Logo
                      Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          gradient: AppColors.gradientPrimary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: AppColors.primary.withValues(alpha: 0.45), blurRadius: 28, offset: const Offset(0, 12)),
                          ],
                        ),
                        child: const Icon(Icons.door_front_door_rounded, color: Colors.white, size: 44),
                      ).animate().scale(duration: 600.ms, curve: Curves.elasticOut).fadeIn(),
                      const SizedBox(height: 20),
                      const Text('Front Door', style: TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.ink, letterSpacing: -0.5))
                          .animate().fadeIn(delay: 100.ms).slideY(begin: 0.15),
                      const SizedBox(height: 6),
                      Text('Premium home services at your doorstep', textAlign: TextAlign.center,
                          style: TextStyle(fontSize: 14, color: AppColors.inkMuted.withValues(alpha: 0.9), height: 1.4))
                          .animate().fadeIn(delay: 180.ms),

                      const SizedBox(height: 36),

                      // Glass login card
                      ClipRRect(
                        borderRadius: BorderRadius.circular(28),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.fromLTRB(24, 28, 24, 28),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(28),
                              color: Colors.white.withValues(alpha: 0.42),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.75), width: 1.5),
                              boxShadow: [
                                BoxShadow(color: AppColors.primary.withValues(alpha: 0.1), blurRadius: 40, offset: const Offset(0, 16)),
                                BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 20, offset: const Offset(0, 8)),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('Welcome back', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.ink)),
                                const SizedBox(height: 4),
                                const Text('Sign in to book & track services', style: TextStyle(fontSize: 13, color: AppColors.inkMuted)),
                                const SizedBox(height: 24),
                                GlassTextField(
                                  controller: _email,
                                  label: 'Email',
                                  hint: 'you@email.com',
                                  icon: Icons.mail_outline_rounded,
                                  keyboardType: TextInputType.emailAddress,
                                  validator: (v) => v == null || v.trim().isEmpty ? 'Enter your email' : null,
                                ),
                                const SizedBox(height: 18),
                                GlassTextField(
                                  controller: _password,
                                  label: 'Password',
                                  hint: '••••••••',
                                  icon: Icons.lock_outline_rounded,
                                  obscure: _obscure,
                                  validator: (v) => v == null || v.isEmpty ? 'Enter your password' : null,
                                  suffix: IconButton(
                                    icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppColors.inkMuted, size: 22),
                                    onPressed: () => setState(() => _obscure = !_obscure),
                                  ),
                                ),
                                if (auth.error != null) ...[
                                  const SizedBox(height: 14),
                                  Container(
                                    width: double.infinity,
                                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                                    decoration: BoxDecoration(
                                      color: Colors.red.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(color: Colors.red.withValues(alpha: 0.2)),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(Icons.error_outline, color: Colors.red, size: 18),
                                        const SizedBox(width: 8),
                                        Expanded(child: Text(auth.error!, style: const TextStyle(color: Colors.red, fontSize: 13, fontWeight: FontWeight.w600))),
                                      ],
                                    ),
                                  ),
                                ],
                                const SizedBox(height: 24),
                                GradientButton(
                                  label: auth.loading ? 'Signing in...' : 'Login',
                                  onPressed: auth.loading ? null : _submit,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ).animate().fadeIn(delay: 250.ms).slideY(begin: 0.08, duration: 500.ms),

                      const SizedBox(height: 20),

                      // Demo credentials glass chip
                      ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            decoration: BoxDecoration(
                              color: AppColors.lavender.withValues(alpha: 0.5),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.6)),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.verified_user_outlined, color: AppColors.primary, size: 18),
                                SizedBox(width: 8),
                                Flexible(
                                  child: Text('Demo: customer@frontdoor.in · password',
                                      textAlign: TextAlign.center, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.inkMuted)),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ).animate().fadeIn(delay: 350.ms),

                      const SizedBox(height: 16),

                      TextButton(
                        onPressed: () => context.go('/home'),
                        child: const Text('Continue without login', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary, fontSize: 15)),
                      ),

                      const SizedBox(height: 8),

                      // Trust row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _TrustChip(icon: Icons.shield_outlined, label: 'Secure'),
                          const SizedBox(width: 12),
                          _TrustChip(icon: Icons.bolt_outlined, label: 'Fast booking'),
                          const SizedBox(width: 12),
                          _TrustChip(icon: Icons.star_outline_rounded, label: '4.8★ rated'),
                        ],
                      ).animate().fadeIn(delay: 450.ms),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Orb extends StatelessWidget {
  final double size;
  final Color color;
  const _Orb({required this.size, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color),
    );
  }
}

class _TrustChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _TrustChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: AppColors.inkLight),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 11, color: AppColors.inkLight, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
