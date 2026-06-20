import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:front_door/app.dart';

void main() {
  testWidgets('App loads home screen', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: FrontDoorApp()));
    await tester.pumpAndSettle();
    expect(find.text('Popular Services'), findsOneWidget);
  });
}
