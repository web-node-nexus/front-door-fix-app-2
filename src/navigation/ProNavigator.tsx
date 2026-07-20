import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { BRAND } from '../config';
import ProTabNavigator from './ProTabNavigator';
import ProCompletionDetailScreen from '../screens/pro/ProCompletionDetailScreen';
import ProCompletionListScreen from '../screens/pro/ProCompletionListScreen';
import ProJobDetailScreen from '../screens/pro/ProJobDetailScreen';
import ProNotificationsScreen from '../screens/pro/ProNotificationsScreen';
import ProProfileScreen from '../screens/pro/ProProfileScreen';
import ProReviewsScreen from '../screens/pro/ProReviewsScreen';
import ProSettingsScreen from '../screens/pro/ProSettingsScreen';

const Stack = createNativeStackNavigator();

export default function ProNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#F5F5F7' },
        headerTintColor: BRAND.ink,
        headerTitleStyle: { fontWeight: '800' },
      }}
    >
      <Stack.Screen name="ProTabs" component={ProTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="ProJobDetail" component={ProJobDetailScreen} options={{ title: 'Active Job' }} />
      <Stack.Screen name="ProCompletionList" component={ProCompletionListScreen} options={{ title: 'Payment Collection' }} />
      <Stack.Screen name="ProCompletionDetail" component={ProCompletionDetailScreen} options={{ title: 'Collect Payment' }} />
      <Stack.Screen name="ProReviews" component={ProReviewsScreen} options={{ title: 'Reviews' }} />
      <Stack.Screen name="ProNotifications" component={ProNotificationsScreen} options={{ title: 'Notifications' }} />
      <Stack.Screen name="ProProfile" component={ProProfileScreen} options={{ title: 'Profile' }} />
      <Stack.Screen name="ProSettings" component={ProSettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
