import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';

class AuthUser {
  final int id;
  final String name;
  final String email;
  final String? phone;

  const AuthUser({required this.id, required this.name, required this.email, this.phone});

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
        id: json['id'] as int,
        name: json['name'] as String? ?? '',
        email: json['email'] as String? ?? '',
        phone: json['phone'] as String?,
      );
}

class AuthState {
  final bool loading;
  final bool isAuthenticated;
  final AuthUser? user;
  final String? error;

  const AuthState({
    this.loading = false,
    this.isAuthenticated = false,
    this.user,
    this.error,
  });

  AuthState copyWith({bool? loading, bool? isAuthenticated, AuthUser? user, String? error}) => AuthState(
        loading: loading ?? this.loading,
        isAuthenticated: isAuthenticated ?? this.isAuthenticated,
        user: user ?? this.user,
        error: error,
      );
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState(loading: true)) {
    _bootstrap();
  }

  static const _tokenKey = 'auth_token';

  Future<void> _bootstrap() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString(_tokenKey);
      if (token == null) {
        state = const AuthState(loading: false);
        return;
      }
      apiClient.setToken(token);
      final data = await apiClient.get('/user') as Map<String, dynamic>;
      state = AuthState(loading: false, isAuthenticated: true, user: AuthUser.fromJson(data));
    } catch (_) {
      await logout();
    }
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(loading: true, error: null);
    try {
      final data = await apiClient.post('/login', body: {'email': email, 'password': password}) as Map<String, dynamic>;
      final token = data['token'] as String;
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      apiClient.setToken(token);
      state = AuthState(
        loading: false,
        isAuthenticated: true,
        user: AuthUser.fromJson(data['user'] as Map<String, dynamic>),
      );
      return true;
    } on ApiException catch (e) {
      state = state.copyWith(loading: false, error: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(loading: false, error: 'Could not connect to server');
      return false;
    }
  }

  Future<void> refreshUser() async {
    if (!state.isAuthenticated) return;
    try {
      final data = await apiClient.get('/user') as Map<String, dynamic>;
      state = state.copyWith(user: AuthUser.fromJson(data));
    } catch (_) {}
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    apiClient.setToken(null);
    state = const AuthState(loading: false);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) => AuthNotifier());
