import { Ionicons } from '@expo/vector-icons';

import { NavigationContainer } from '@react-navigation/native';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import ActiveBookingBanner from '../components/ActiveBookingBanner';
import CustomTabBar from '../components/CustomTabBar';

import { BRAND } from '../config';

import { useAuth } from '../context/AuthContext';
import { navigationRef } from './navigationRef';

import BookingsScreen from '../screens/BookingsScreen';
import BookingDetailScreen from '../screens/BookingDetailScreen';
import LiveTrackingScreen from '../screens/LiveTrackingScreen';
import RescheduleBookingScreen from '../screens/bookings/RescheduleBookingScreen';
import CancelBookingScreen from '../screens/bookings/CancelBookingScreen';
import BookServiceScreen from '../screens/bookings/BookServiceScreen';
import CartCheckoutScreen from '../screens/bookings/CartCheckoutScreen';
import RateReviewScreen from '../screens/bookings/RateReviewScreen';
import ServiceCartScreen from '../screens/bookings/ServiceCartScreen';
import ServicePaymentScreen from '../screens/bookings/ServicePaymentScreen';

import HomeScreen from '../screens/HomeScreen';

import LocationPickerScreen from '../screens/LocationPickerScreen';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import NotificationsScreen from '../screens/NotificationsScreen';

import ProfileScreen from '../screens/ProfileScreen';

import ServicesScreen from '../screens/ServicesScreen';
import WishlistScreen from '../screens/WishlistScreen';

import SupportScreen from '../screens/SupportScreen';
import RaiseTicketScreen from '../screens/support/RaiseTicketScreen';
import SafetyScreen from '../screens/support/SafetyScreen';
import SupportFAQScreen from '../screens/support/SupportFAQScreen';
import SupportTicketDetailScreen from '../screens/support/SupportTicketDetailScreen';
import SupportTicketsScreen from '../screens/support/SupportTicketsScreen';

import AddressesScreen from '../screens/profile/AddressesScreen';

import AppSettingsScreen from '../screens/profile/AppSettingsScreen';

import OffersScreen from '../screens/profile/OffersScreen';

import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';

import PersonalInfoScreen from '../screens/profile/PersonalInfoScreen';

import ReferEarnScreen from '../screens/profile/ReferEarnScreen';

import ReviewsScreen from '../screens/profile/ReviewsScreen';

import SecurityScreen from '../screens/profile/SecurityScreen';

import ServiceHistoryScreen from '../screens/profile/ServiceHistoryScreen';

import SubscriptionScreen from '../screens/profile/SubscriptionScreen';

import WalletScreen from '../screens/profile/WalletScreen';



const RootStack = createNativeStackNavigator();

const MainStack = createNativeStackNavigator();

const Tabs = createBottomTabNavigator();



const profileScreens = [

  { name: 'Wallet', component: WalletScreen, title: 'My Wallet' },

  { name: 'Addresses', component: AddressesScreen, title: 'Saved Addresses' },

  { name: 'PaymentMethods', component: PaymentMethodsScreen, title: 'Payment Methods' },

  { name: 'PersonalInfo', component: PersonalInfoScreen, title: 'Personal Information' },

  { name: 'Security', component: SecurityScreen, title: 'Privacy & Security' },

  { name: 'ReferEarn', component: ReferEarnScreen, title: 'Refer & Earn' },

  { name: 'Reviews', component: ReviewsScreen, title: 'My Reviews' },

  { name: 'ServiceHistory', component: ServiceHistoryScreen, title: 'Service History' },

  { name: 'Subscription', component: SubscriptionScreen, title: 'Premium Membership' },

  { name: 'AppSettings', component: AppSettingsScreen, title: 'App Settings' },

  { name: 'Favorites', component: WishlistScreen, title: 'My Wishlist' },

  { name: 'Offers', component: OffersScreen, title: 'Exclusive Offers' },

] as const;

const supportScreens = [
  { name: 'SupportFAQ', component: SupportFAQScreen, title: 'All FAQs' },
  { name: 'SupportTickets', component: SupportTicketsScreen, title: 'Your Tickets' },
  { name: 'SupportTicketDetail', component: SupportTicketDetailScreen, title: 'Ticket Details' },
  { name: 'RaiseTicket', component: RaiseTicketScreen, title: 'Raise a Ticket' },
  { name: 'Safety', component: SafetyScreen, title: 'Your Safety' },
] as const;



function MainTabs() {

  return (

    <Tabs.Navigator

      tabBar={(props) => <CustomTabBar {...props} />}

      screenOptions={{ headerShown: false }}

    >

      <Tabs.Screen name="Home" component={HomeScreen} />

      <Tabs.Screen name="Bookings" component={BookingsScreen} />
      <Tabs.Screen name="Support" component={SupportScreen} />

      <Tabs.Screen name="Profile" component={ProfileScreen} />

    </Tabs.Navigator>

  );

}



function AppStack() {

  return (

    <View style={{ flex: 1 }}>
      <ActiveBookingBanner />
      <View style={{ flex: 1 }}>
    <MainStack.Navigator>

      <MainStack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />

      <MainStack.Screen
        name="Services"
        component={ServicesScreen}
        options={{ headerShown: false }}
      />

      <MainStack.Screen
        name="Wishlist"
        component={WishlistScreen}
        options={{ headerShown: false }}
      />

      <MainStack.Screen name="LocationPicker" component={LocationPickerScreen} options={{ headerShown: false, presentation: 'modal' }} />

      <MainStack.Screen

        name="Notifications"

        component={NotificationsScreen}

        options={{

          headerStyle: { backgroundColor: BRAND.canvas },

          headerTintColor: BRAND.ink,

          headerTitle: 'Notifications',

          headerTitleStyle: { fontWeight: '800' },

        }}

      />

      {profileScreens.map((s) => (
        <MainStack.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          options={{
            headerShown: s.name !== 'Favorites',
            headerStyle: { backgroundColor: BRAND.canvas },
            headerTintColor: BRAND.ink,
            headerTitle: s.title,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      ))}
      {supportScreens.map((s) => (
        <MainStack.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          options={{
            headerStyle: { backgroundColor: BRAND.canvas },
            headerTintColor: BRAND.ink,
            headerTitle: s.title,
            headerTitleStyle: { fontWeight: '800' },
          }}
        />
      ))}
      <MainStack.Screen
        name="BookService"
        component={BookServiceScreen}
        options={{
          headerStyle: { backgroundColor: BRAND.canvas },
          headerTintColor: BRAND.ink,
          headerTitle: 'Book Service',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <MainStack.Screen
        name="ServiceCart"
        component={ServiceCartScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="CartCheckout"
        component={CartCheckoutScreen}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="RescheduleBooking"
        component={RescheduleBookingScreen}
        options={{
          headerStyle: { backgroundColor: BRAND.canvas },
          headerTintColor: BRAND.ink,
          headerTitle: 'Reschedule Booking',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <MainStack.Screen
        name="CancelBooking"
        component={CancelBookingScreen}
        options={{
          headerStyle: { backgroundColor: BRAND.canvas },
          headerTintColor: BRAND.ink,
          headerTitle: 'Cancel Booking',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <MainStack.Screen
        name="ServicePayment"
        component={ServicePaymentScreen}
        options={{
          headerStyle: { backgroundColor: BRAND.canvas },
          headerTintColor: BRAND.ink,
          headerTitle: 'Service Payment',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />
      <MainStack.Screen
        name="LiveTracking"
        component={LiveTrackingScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
      />
      <MainStack.Screen
        name="RateReview"
        component={RateReviewScreen}
        options={{ headerShown: false, presentation: 'modal' }}
      />
      <MainStack.Screen
        name="BookingDetail"
        component={BookingDetailScreen}
        options={{
          headerStyle: { backgroundColor: BRAND.canvas },
          headerTintColor: BRAND.ink,
          headerTitle: 'Booking Details',
          headerTitleStyle: { fontWeight: '800' },
        }}
      />

    </MainStack.Navigator>
      </View>
    </View>

  );

}



export default function RootNavigator() {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BRAND.canvas }}>
        <ActivityIndicator size="large" color={BRAND.primary} />
      </View>
    );
  }

  return (

    <NavigationContainer ref={navigationRef}>

      <RootStack.Navigator screenOptions={{ headerShown: false }}>

        {user ? (

          <RootStack.Screen name="Main" component={AppStack} />

        ) : (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}

      </RootStack.Navigator>

    </NavigationContainer>

  );

}


