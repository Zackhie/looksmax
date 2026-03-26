import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';
import CameraScreen from './CameraScreen';
import ResultsScreen from './ResultsScreen';

type ScanState =
  | { step: 'camera' }
  | { step: 'results'; photoUri: string };

export default function ScanScreen() {
  const [state, setState] = useState<ScanState>({ step: 'camera' });

  const handlePhotoTaken = (uri: string) => {
    setState({ step: 'results', photoUri: uri });
  };

  const handleScanAgain = () => {
    setState({ step: 'camera' });
  };

  const handleDone = () => {
    setState({ step: 'camera' });
  };

  return (
    <View style={styles.container}>
      {state.step === 'camera' ? (
        <CameraScreen onPhotoTaken={handlePhotoTaken} />
      ) : (
        <ResultsScreen
          photoUri={state.photoUri}
          onScanAgain={handleScanAgain}
          onDone={handleDone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
