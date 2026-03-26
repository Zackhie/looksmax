import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants';
import { isOnboardingComplete } from '../services/storage';

import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileSetupScreen from '../screens/ProfileSetupScreen';
import TabNavigator from './TabNavigator';

export type RootStackParamList = {
  Onboarding: undefined;
  ProfileSetup: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [loading, setLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const complete = await isOnboardingComplete();
    setHasOnboarded(complete);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade' }}
      initialRouteName={hasOnboarded ? 'Main' : 'Onboarding'}
    >
      <Stack.Screen name="Onboarding">
        {(props) => (
          <OnboardingScreen
            onComplete={() => props.navigation.replace('ProfileSetup')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ProfileSetup">
        {(props) => (
          <ProfileSetupScreen
            onComplete={() => props.navigation.replace('Main')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Main" component={TabNavigator} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
