import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { FaceDetectionProvider } from '@infinitered/react-native-mlkit-face-detection';
import { COLORS } from './src/constants';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
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
  );
}
