import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../api/api_config.dart';

Future<void> launchPhone(String? phone) async {
  final raw = phone ?? ApiConfig.supportPhone;
  final uri = Uri.parse('tel:$raw');
  if (await canLaunchUrl(uri)) await launchUrl(uri);
}

Future<void> launchWhatsApp(String? phone, {String? message}) async {
  final raw = (phone ?? ApiConfig.supportWhatsApp).replaceAll(RegExp(r'\D'), '');
  final uri = Uri.parse('https://wa.me/$raw${message != null ? '?text=${Uri.encodeComponent(message)}' : ''}');
  if (await canLaunchUrl(uri)) await launchUrl(uri, mode: LaunchMode.externalApplication);
}

void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(content: Text(msg), backgroundColor: error ? Colors.red : null),
  );
}
