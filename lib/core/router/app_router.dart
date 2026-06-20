import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/login_screen.dart';
import '../../features/bookings/bookings_screen.dart';
import '../../features/booking_flow/book_service_screen.dart';
import '../../features/booking_flow/booking_confirmed_screen.dart';
import '../../features/booking_flow/chat_screen.dart';
import '../../features/booking_flow/live_tracking_screen.dart';
import '../../features/booking_flow/otp_screen.dart';
import '../../features/booking_flow/payment_screen.dart';
import '../../features/booking_flow/professional_assigned_screen.dart';
import '../../features/booking_flow/review_screen.dart';
import '../../features/booking_flow/searching_professional_screen.dart';
import '../../features/booking_flow/service_completed_screen.dart';
import '../../features/booking_flow/service_progress_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/profile/addresses_screen.dart';
import '../../features/profile/payment_history_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/services/service_list_screen.dart';
import '../../features/support/support_screen.dart';
import '../../shared/widgets/main_shell.dart';
import '../providers/auth_provider.dart';

final _rootKey = GlobalKey<NavigatorState>();

bool _needsAuth(String location) {
  const protected = [
    '/bookings', '/profile', '/book-service', '/payment', '/booking-confirmed',
    '/searching', '/professional', '/tracking', '/otp', '/progress', '/completed', '/review', '/chat',
    '/addresses', '/payment-history',
  ];
  return protected.any((p) => location.startsWith(p));
}

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/home',
    redirect: (context, state) {
      if (auth.loading) return null;
      final loc = state.matchedLocation;
      if (!auth.isAuthenticated && _needsAuth(loc)) {
        return '/login?from=${Uri.encodeComponent(state.uri.toString())}';
      }
      if (auth.isAuthenticated && loc == '/login') return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/home', pageBuilder: (_, __) => const NoTransitionPage(child: HomeScreen())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/bookings', pageBuilder: (_, __) => const NoTransitionPage(child: BookingsScreen())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/support', pageBuilder: (_, __) => const NoTransitionPage(child: SupportScreen())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/profile', pageBuilder: (_, __) => const NoTransitionPage(child: ProfileScreen())),
          ]),
        ],
      ),
      GoRoute(
        path: '/services',
        builder: (context, state) => ServiceListScreen(category: state.uri.queryParameters['category']),
      ),
      GoRoute(
        path: '/book-service',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is Map<String, dynamic>) {
            return BookServiceScreen(service: extra['service']);
          }
          return const BookServiceScreen();
        },
      ),
      GoRoute(path: '/payment', builder: (_, __) => const PaymentScreen()),
      GoRoute(path: '/booking-confirmed', builder: (_, __) => const BookingConfirmedScreen()),
      GoRoute(path: '/searching', builder: (_, __) => const SearchingProfessionalScreen()),
      GoRoute(path: '/professional', builder: (_, __) => const ProfessionalAssignedScreen()),
      GoRoute(path: '/tracking', builder: (_, __) => const LiveTrackingScreen()),
      GoRoute(path: '/otp', builder: (_, __) => const OtpScreen()),
      GoRoute(path: '/progress', builder: (_, __) => const ServiceProgressScreen()),
      GoRoute(path: '/completed', builder: (_, __) => const ServiceCompletedScreen()),
      GoRoute(path: '/review', builder: (_, __) => const ReviewScreen()),
      GoRoute(path: '/addresses', builder: (_, __) => const AddressesScreen()),
      GoRoute(path: '/payment-history', builder: (_, __) => const PaymentHistoryScreen()),
      GoRoute(
        path: '/chat/:id',
        builder: (context, state) => ChatScreen(
          bookingId: int.parse(state.pathParameters['id']!),
          peerName: state.uri.queryParameters['name'] ?? 'Professional',
        ),
      ),
    ],
  );
});
