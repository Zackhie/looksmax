import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import FaceOverlay from '../components/FaceOverlay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SCAN_MESSAGES = [
  'Detecting landmarks...',
  'Analyzing symmetry...',
  'Measuring jawline...',
  'Evaluating skin...',
];

interface Props {
  onPhotoTaken: (uri: string) => void;
}

export default function CameraScreen({ onPhotoTaken }: Props) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessageIndex, setScanMessageIndex] = useState(0);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineY = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!isScanning) return;

    // Pulse the overlay
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    // Scan line sweeps
    const scanLine = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // Glow overlay
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(overlayOpacity, {
          toValue: 0.9,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    scanLine.start();
    glow.start();

    // Cycle through scan messages
    const messageInterval = setInterval(() => {
      setScanMessageIndex((prev) => (prev + 1) % SCAN_MESSAGES.length);
    }, 750);

    return () => {
      pulse.stop();
      scanLine.stop();
      glow.stop();
      clearInterval(messageInterval);
    };
  }, [isScanning]);

  const handleScan = async () => {
    if (!cameraRef.current || isScanning) return;

    setIsScanning(true);
    setScanMessageIndex(0);

    // Take photo
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    // Wait for scanning animation (3 seconds)
    setTimeout(() => {
      setIsScanning(false);
      if (photo?.uri) {
        onPhotoTaken(photo.uri);
      }
    }, 3000);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={COLORS.primary} />
        <Text style={styles.permissionTitle}>Camera Access Needed</Text>
        <Text style={styles.permissionText}>
          We need camera access to scan and analyze your facial features. Photos are stored only on your device.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanLineTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.15, SCREEN_HEIGHT * 0.65],
  });

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="front"
      >
        {/* Guide text */}
        <View style={styles.topBar}>
          <Text style={styles.guideText}>
            {isScanning ? SCAN_MESSAGES[scanMessageIndex] : 'Position your face within the outline'}
          </Text>
        </View>

        {/* Face overlay */}
        <Animated.View
          style={[
            styles.overlayContainer,
            {
              transform: [{ scale: isScanning ? pulseAnim : 1 }],
              opacity: isScanning ? overlayOpacity : 0.6,
            },
          ]}
        >
          <FaceOverlay width={SCREEN_WIDTH} height={SCREEN_HEIGHT} />
        </Animated.View>

        {/* Scanning line */}
        {isScanning && (
          <Animated.View
            style={[
              styles.scanLine,
              {
                transform: [{ translateY: scanLineTranslate }],
              },
            ]}
          />
        )}

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {isScanning ? (
            <View style={styles.scanningIndicator}>
              <Animated.View
                style={[
                  styles.scanningDot,
                  {
                    opacity: overlayOpacity,
                  },
                ]}
              />
              <Text style={styles.scanningText}>Scanning...</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleScan}
              activeOpacity={0.8}
            >
              <View style={styles.scanButtonInner}>
                <Ionicons name="scan" size={32} color={COLORS.background} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  camera: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  guideText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    overflow: 'hidden',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  scanLine: {
    position: 'absolute',
    left: SCREEN_WIDTH * 0.15,
    right: SCREEN_WIDTH * 0.15,
    height: 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scanButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusFull,
  },
  scanningDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  scanningText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.primary,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
    gap: SIZES.md,
  },
  permissionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  permissionText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginTop: SIZES.md,
  },
  permissionButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.background,
  },
});
