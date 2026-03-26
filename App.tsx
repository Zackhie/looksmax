import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { FaceDetectionProvider } from '@infinitered/react-native-mlkit-face-detection';
import * as SplashScreen from 'expo-splash-screen';
import { COLORS } from './src/constants';
import RootNavigator from './src/navigation/RootNavigator';
import {
  configureNotifications,
  scheduleAllReminders,
  clearDeliveredNotifications,
} from './src/services/notifications';

// Keep splash screen visible while app initializes
SplashScreen.preventAutoHideAsync().catch(() => {});

// Configure notification handler on app start
configureNotifications();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Clear delivered notifications and reschedule on each app launch
        await clearDeliveredNotifications();
        await scheduleAllReminders();
      } catch {} finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) return null;

  return (
    <View style={styles.root} onLayout={onLayoutRootView}>
      <FaceDetectionProvider
        options={{
          performanceMode: 'accurate',
          landmarkMode: true,
          contourMode: true,
          classificationMode: true,
          minFaceSize: 0.15,
        }}
      >
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: COLORS.primary,
              background: COLORS.background,
              card: COLORS.surface,
              text: COLORS.text,
              border: COLORS.border,
              notification: COLORS.primary,
            },
            fonts: {
              regular: { fontFamily: 'System', fontWeight: '400' },
              medium: { fontFamily: 'System', fontWeight: '500' },
              bold: { fontFamily: 'System', fontWeight: '700' },
              heavy: { fontFamily: 'System', fontWeight: '800' },
            },
          }}
        >
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </FaceDetectionProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
