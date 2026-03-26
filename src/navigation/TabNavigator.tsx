import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { isHydrationReminder } from '../services/waterStorage';
import { getUserProfile } from '../services/storage';

import HomeScreen from '../screens/HomeScreen';
import ScanScreen from '../screens/ScanScreen';
import WaterScreen from '../screens/WaterScreen';
import ProgressScreen from '../screens/ProgressScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ScanTabButton from '../components/ScanTabButton';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const [waterBadge, setWaterBadge] = useState(false);

  useEffect(() => {
    checkHydration();
    // Re-check every 5 minutes
    const interval = setInterval(checkHydration, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const checkHydration = async () => {
    const profile = await getUserProfile();
    const goalOz = profile?.waterGoalOz ?? 80;
    const needsReminder = await isHydrationReminder(goalOz);
    setWaterBadge(needsReminder);
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
      screenListeners={{
        tabPress: () => {
          // Refresh hydration badge when switching tabs
          checkHydration();
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Water"
        component={WaterScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water-outline" size={size} color={color} />
          ),
          tabBarBadge: waterBadge ? '!' : undefined,
          tabBarBadgeStyle: waterBadge ? styles.waterBadge : undefined,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => (
            <ScanTabButton
              onPress={props.onPress as any}
              focused={props.accessibilityState?.selected ?? false}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  waterBadge: {
    backgroundColor: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
  },
});
