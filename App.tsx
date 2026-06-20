import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActiveBookingProvider } from './src/context/ActiveBookingContext';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ProfileProvider } from './src/context/ProfileContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationProvider>
          <ActiveBookingProvider>
            <ProfileProvider>
              <CartProvider>
                <LocationProvider>
                  <RootNavigator />
                  <StatusBar style="dark" />
                </LocationProvider>
              </CartProvider>
            </ProfileProvider>
          </ActiveBookingProvider>
        </NotificationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
