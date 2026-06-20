class ApiConfig {
  /// USB phone: run `adb reverse tcp:8000 tcp:8000` then use 127.0.0.1
  /// Emulator: use http://10.0.2.2:8000/api
  static const baseUrl = String.fromEnvironment(
    'API_BASE',
    defaultValue: 'http://127.0.0.1:8000/api',
  );

  static const supportPhone = '+919876543210';
  static const supportWhatsApp = '919876543210';
}
