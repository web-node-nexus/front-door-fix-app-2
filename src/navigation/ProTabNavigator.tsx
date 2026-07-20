import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BRAND } from '../config';
import ProDashboardScreen from '../screens/pro/ProDashboardScreen';
import ProEarningsScreen from '../screens/pro/ProEarningsScreen';
import ProJobsScreen from '../screens/pro/ProJobsScreen';
import ProMoreScreen from '../screens/pro/ProMoreScreen';
import ProRequestsScreen from '../screens/pro/ProRequestsScreen';

const Tabs = createBottomTabNavigator();

const TAB_ICONS: Record<string, { outline: keyof typeof Ionicons.glyphMap; filled: keyof typeof Ionicons.glyphMap }> = {
  ProHome: { outline: 'grid-outline', filled: 'grid' },
  ProRequests: { outline: 'notifications-outline', filled: 'notifications' },
  ProJobs: { outline: 'hammer-outline', filled: 'hammer' },
  ProEarnings: { outline: 'wallet-outline', filled: 'wallet' },
  ProMore: { outline: 'menu-outline', filled: 'menu' },
};

export default function ProTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: [styles.bar, { height: 58 + insets.bottom, paddingBottom: insets.bottom + 4 }],
        tabBarActiveTintColor: '#1A1A2E',
        tabBarInactiveTintColor: BRAND.muted,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          return <Ionicons name={focused ? icons.filled : icons.outline} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="ProHome" component={ProDashboardScreen} options={{ title: 'Home' }} />
      <Tabs.Screen name="ProRequests" component={ProRequestsScreen} options={{ title: 'Requests' }} />
      <Tabs.Screen name="ProJobs" component={ProJobsScreen} options={{ title: 'Jobs' }} />
      <Tabs.Screen name="ProEarnings" component={ProEarningsScreen} options={{ title: 'Earnings' }} />
      <Tabs.Screen name="ProMore" component={ProMoreScreen} options={{ title: 'More' }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#fff',
    borderTopColor: '#E5E7EB',
    borderTopWidth: 1,
    paddingTop: 6,
  },
  label: { fontSize: 10, fontWeight: '700' },
});
