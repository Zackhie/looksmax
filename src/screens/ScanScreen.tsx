import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFaceDetection } from '@infinitered/react-native-mlkit-face-detection';
import { COLORS } from '../constants';
import { analyzeFace } from '../services/landmarkAnalysis';
import { FaceScan } from '../types';
import CameraScreen from './CameraScreen';
import ResultsScreen from './ResultsScreen';

type ScanState =
  | { step: 'camera' }
  | { step: 'results'; photoUri: string; mlScores: FaceScan['scores'] | null };

export default function ScanScreen() {
  const [state, setState] = useState<ScanState>({ step: 'camera' });
  const faceDetector = useFaceDetection();

  const handlePhotoTaken = useCallback(async (uri: string) => {
    let mlScores: FaceScan['scores'] | null = null;

    try {
      if (faceDetector.status === 'ready' || faceDetector.status === 'done') {
        const result = await faceDetector.detectFaces(uri);
        if (result?.faces && result.faces.length > 0) {
          mlScores = analyzeFace(result.faces[0] as any);
        }
      }
    } catch (e) {
      console.warn('ML Kit detection failed, using mock fallback:', e);
    }

    setState({ step: 'results', photoUri: uri, mlScores });
  }, [faceDetector]);

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
          mlScores={state.mlScores}
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
