import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import 'gradient_button.dart';

class BookingFooter extends StatelessWidget {
  final int total;
  final String buttonLabel;
  final VoidCallback? onPressed;

  const BookingFooter({
    super.key,
    required this.total,
    required this.buttonLabel,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
      decoration: BoxDecoration(
        color: AppColors.canvas,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Total', style: TextStyle(color: AppColors.inkMuted, fontSize: 13)),
                  Text(
                    '₹$total',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: AppColors.ink,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              flex: 2,
              child: GradientButton(label: buttonLabel, onPressed: onPressed),
            ),
          ],
        ),
      ),
    );
  }
}
