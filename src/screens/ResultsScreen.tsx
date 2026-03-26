import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { FaceScan } from '../types';
import { generateMockScores, createFaceScan } from '../services/mockScanner';
import { saveScan, getLatestScan } from '../services/scanStorage';
import AnimatedCounter from '../components/AnimatedCounter';
import RadarChart from '../components/RadarChart';
import ScoreCard from '../components/ScoreCard';
import LandmarkOverlay from '../components/LandmarkOverlay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_HEIGHT = SCREEN_WIDTH * 1.1;

const EXPLANATIONS = {
  symmetry:
    'Measures how evenly balanced your facial features are between left and right sides. Higher symmetry is associated with perceived attractiveness. Improve with consistent sleep position and mewing.',
  jawlineDefinition:
    'Evaluates the sharpness and angle of your jaw. A defined jawline comes from lower body fat, strong masseter muscles, and good bone structure. Improve with body recomposition, chewing exercises, and mewing.',
  facialDefinition:
    'Assesses how lean and sculpted your face appears. Cheekbone visibility, under-eye area, and overall facial fat level. Improve with caloric deficit, cardio, hydration, and reducing sodium intake.',
  waterRetention:
    'Detects puffiness and bloating in your face. Caused by high sodium, dehydration, poor sleep, or alcohol. Reduce with proper hydration, potassium-rich foods, and consistent sleep.',
  skinClarity:
    'Evaluates skin texture, tone evenness, and visible concerns like acne or dark circles. Improve with a consistent skincare routine, SPF daily, retinol, and proper nutrition.',
};

const WATER_RETENTION_SCORE: Record<string, number> = {
  low: 85,
  moderate: 55,
  high: 25,
};

interface Props {
  photoUri: string;
  mlScores?: FaceScan['scores'] | null;
  onScanAgain: () => void;
  onDone: () => void;
}

export default function ResultsScreen({ photoUri, mlScores, onScanAgain, onDone }: Props) {
  const [scan, setScan] = useState<FaceScan | null>(null);
  const [previousScan, setPreviousScan] = useState<FaceScan | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    initScan();
  }, []);

  const initScan = async () => {
    const prev = await getLatestScan();
    setPreviousScan(prev);

    // Use real ML Kit scores if available, otherwise fall back to mock
    const scores = mlScores ?? generateMockScores(prev);
    const newScan = createFaceScan(photoUri, scores);
    setScan(newScan);
  };

  const handleSave = async () => {
    if (!scan) return;
    await saveScan(scan);
    setSaved(true);
    Alert.alert('Scan Saved', 'Your scan has been saved to your history.');
  };

  if (!scan) return null;

  const { scores } = scan;
  const prev = previousScan?.scores;

  const getDelta = (key: 'symmetry' | 'jawlineDefinition' | 'facialDefinition' | 'skinClarity' | 'overallPotential'): number | null => {
    if (!prev) return null;
    return scores[key] - prev[key];
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Photo with landmark overlay */}
      <View style={styles.photoContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} />
        <View style={styles.photoOverlay} />
        <LandmarkOverlay width={SCREEN_WIDTH} height={PHOTO_HEIGHT} />
      </View>

      {/* Overall Potential Score */}
      <View style={styles.overallSection}>
        <Text style={styles.overallLabel}>OVERALL POTENTIAL</Text>
        <AnimatedCounter
          target={scores.overallPotential}
          duration={2000}
          style={styles.overallScore}
        />
        <Text style={styles.overallMax}>/100</Text>
      </View>

      {/* Comparison line */}
      {prev && (
        <View style={styles.comparisonContainer}>
          <Text style={styles.comparisonTitle}>Compared to your last scan:</Text>
          <View style={styles.comparisonRow}>
            {([
              ['Symmetry', getDelta('symmetry')],
              ['Jawline', getDelta('jawlineDefinition')],
              ['Definition', getDelta('facialDefinition')],
              ['Skin', getDelta('skinClarity')],
            ] as [string, number | null][]).map(([name, delta]) => {
              if (delta == null) return null;
              return (
                <View key={name} style={styles.comparisonItem}>
                  <Ionicons
                    name={delta >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={12}
                    color={delta >= 0 ? COLORS.success : COLORS.error}
                  />
                  <Text style={[styles.comparisonDelta, { color: delta >= 0 ? COLORS.success : COLORS.error }]}>
                    {name} {delta >= 0 ? '+' : ''}{delta}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Radar Chart */}
      <View style={styles.radarSection}>
        <Text style={styles.sectionTitle}>Score Breakdown</Text>
        <RadarChart scores={scores} />
      </View>

      {/* Individual Score Cards */}
      <View style={styles.cardsSection}>
        <ScoreCard
          icon="git-compare-outline"
          label="Symmetry"
          score={scores.symmetry}
          explanation={EXPLANATIONS.symmetry}
          delay={200}
          comparison={getDelta('symmetry')}
        />
        <ScoreCard
          icon="triangle-outline"
          label="Jawline Definition"
          score={scores.jawlineDefinition}
          explanation={EXPLANATIONS.jawlineDefinition}
          delay={350}
          comparison={getDelta('jawlineDefinition')}
        />
        <ScoreCard
          icon="diamond-outline"
          label="Facial Definition"
          score={scores.facialDefinition}
          explanation={EXPLANATIONS.facialDefinition}
          delay={500}
          comparison={getDelta('facialDefinition')}
        />
        <ScoreCard
          icon="water-outline"
          label="Water Retention"
          score={WATER_RETENTION_SCORE[scores.waterRetention]}
          explanation={EXPLANATIONS.waterRetention}
          delay={650}
        />
        <ScoreCard
          icon="sparkles-outline"
          label="Skin Clarity"
          score={scores.skinClarity}
          explanation={EXPLANATIONS.skinClarity}
          delay={800}
          comparison={getDelta('skinClarity')}
        />
      </View>

      {/* Insights */}
      {scan.insights.length > 0 && (
        <View style={styles.insightsSection}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {scan.insights.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <Ionicons name="bulb-outline" size={16} color={COLORS.secondary} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, saved && styles.savedButton]}
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saved}
        >
          <Ionicons name={saved ? 'checkmark' : 'save-outline'} size={20} color={saved ? COLORS.success : COLORS.background} />
          <Text style={[styles.actionButtonText, saved && styles.savedButtonText]}>
            {saved ? 'Saved' : 'Save Scan'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.scanAgainButton]}
          onPress={onScanAgain}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
          <Text style={[styles.actionButtonText, styles.scanAgainText]}>Scan Again</Text>
        </TouchableOpacity>
      </View>

      {/* Done button */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={onDone}
        activeOpacity={0.8}
      >
        <Text style={styles.doneText}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoContainer: {
    width: SCREEN_WIDTH,
    height: PHOTO_HEIGHT,
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 229, 255, 0.05)',
  },
  overallSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    paddingVertical: SIZES.lg,
    gap: 4,
  },
  overallLabel: {
    position: 'absolute',
    top: SIZES.md,
    fontSize: SIZES.fontXs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
  },
  overallScore: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.text,
  },
  overallMax: {
    fontSize: SIZES.fontXl,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  comparisonContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SIZES.md,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.lg,
  },
  comparisonTitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  comparisonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonDelta: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  radarSection: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
    paddingHorizontal: SIZES.md,
  },
  cardsSection: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.md,
  },
  insightsSection: {
    paddingHorizontal: SIZES.md,
    marginTop: SIZES.lg,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  insightText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
    marginTop: SIZES.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    paddingVertical: 14,
    borderRadius: SIZES.radiusLg,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  savedButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  actionButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.background,
  },
  savedButtonText: {
    color: COLORS.success,
  },
  scanAgainButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  scanAgainText: {
    color: COLORS.primary,
  },
  doneButton: {
    alignItems: 'center',
    marginTop: SIZES.md,
    paddingVertical: SIZES.md,
  },
  doneText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textMuted,
  },
});
