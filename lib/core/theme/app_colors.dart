import 'package:flutter/material.dart';

class AppColors {
  static const primary = Color(0xFFFF2D7A);
  static const primaryDark = Color(0xFFE91E63);
  static const primaryLight = Color(0xFFFF6B9D);
  static const lavender = Color(0xFFF3E8FF);
  static const lavenderDark = Color(0xFFE9D5FF);
  static const canvas = Color(0xFFFFFFFF);
  static const background = Color(0xFFF8F9FC);
  static const surface = Color(0xFFFFFFFF);
  static const ink = Color(0xFF1A1A2E);
  static const inkMuted = Color(0xFF6B7280);
  static const inkLight = Color(0xFF9CA3AF);
  static const border = Color(0xFFF0F0F5);
  static const success = Color(0xFF10B981);
  static const warning = Color(0xFFF59E0B);
  static const gold = Color(0xFFFFB800);

  static const gradientPrimary = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF2D7A), Color(0xFFFF6B9D), Color(0xFFE879F9)],
  );

  static const gradientHero = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFF2D7A), Color(0xFFC026D3)],
  );

  static const gradientLavender = LinearGradient(
    colors: [Color(0xFFFDF4FF), Color(0xFFF3E8FF)],
  );

  static List<BoxShadow> softShadow = [
    BoxShadow(
      color: const Color(0xFFFF2D7A).withValues(alpha: 0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
  ];
}
