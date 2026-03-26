import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import AnimatedCounter from './AnimatedCounter';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  score: number;
  explanation: string;
  delay?: number;
  comparison?: number | null; // delta from last scan
}

function getBarColor(score: number): string {
  if (score < 40) return COLORS.error;
  if (score < 70) return COLORS.warning;
  return COLORS.success;
}

export default function ScoreCard({ icon, label, score, explanation, delay = 0, comparison }: Props) {
  const [expanded, setExpanded] = useState(false);
  const barWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(barWidth, {
        toValue: score,
        duration: 1200,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [score, delay]);

  const barColor = getBarColor(score);

  const widthInterp = barWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <View style={styles.scoreRow}>
          {comparison != null && comparison !== 0 && (
            <View style={styles.comparison}>
              <Ionicons
                name={comparison > 0 ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={comparison > 0 ? COLORS.success : COLORS.error}
              />
              <Text style={[styles.compText, { color: comparison > 0 ? COLORS.success : COLORS.error }]}>
                {Math.abs(comparison)}
              </Text>
            </View>
          )}
          <AnimatedCounter
            target={score}
            duration={1200}
            delay={delay}
            style={styles.score}
          />
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            { width: widthInterp, backgroundColor: barColor },
          ]}
        />
      </View>

      {/* Expandable explanation */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.expandButton}
        activeOpacity={0.7}
      >
        <Text style={styles.expandText}>What This Means</Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={COLORS.textMuted}
        />
      </TouchableOpacity>

      {expanded && (
        <Text style={styles.explanation}>{explanation}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  label: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  score: {
    fontSize: SIZES.fontXl,
    fontWeight: '800',
    color: COLORS.text,
  },
  comparison: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  compText: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.card,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  expandText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  explanation: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: SIZES.sm,
  },
});
