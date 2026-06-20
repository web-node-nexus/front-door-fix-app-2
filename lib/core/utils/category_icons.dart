import 'package:flutter/material.dart';

IconData iconForCategory(String? slug, String? name) {
  final key = (slug ?? name ?? '').toLowerCase();
  if (key.contains('ac') || key.contains('cool')) return Icons.ac_unit;
  if (key.contains('clean')) return Icons.cleaning_services;
  if (key.contains('plumb')) return Icons.plumbing;
  if (key.contains('electric')) return Icons.electrical_services;
  if (key.contains('paint')) return Icons.format_paint;
  if (key.contains('carpent')) return Icons.carpenter;
  if (key.contains('appliance') || key.contains('repair')) return Icons.build;
  if (key.contains('pest')) return Icons.bug_report_outlined;
  if (key.contains('ro') || key.contains('water')) return Icons.water_drop_outlined;
  if (key.contains('kitchen')) return Icons.kitchen_outlined;
  if (key.contains('bath')) return Icons.bathtub_outlined;
  return Icons.home_repair_service;
}

Color colorForIndex(int i) {
  const colors = [
    Color(0xFFE0F2FE),
    Color(0xFFFCE7F3),
    Color(0xFFDBEAFE),
    Color(0xFFD1FAE5),
    Color(0xFFE0E7FF),
    Color(0xFFFEF3C7),
    Color(0xFFECFDF5),
    Color(0xFFF3E8FF),
  ];
  return colors[i % colors.length];
}
