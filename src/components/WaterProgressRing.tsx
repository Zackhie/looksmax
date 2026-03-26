import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SIZES } from '../constants';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  currentOz: number;
  goalOz: number;
  size?: number;
}

function getMessage(pct: number): string {
  if (pct >= 100) return "Goal crushed — you're locked in";
  if (pct >= 75) return 'Almost there — finish strong';
  if (pct >= 50) return 'Over halfway — keep pushing';
  if (pct >= 25) return 'Building momentum — stay consistent';
  return 'Just getting started — keep sipping';
}

export default function WaterProgressRing({ currentOz, goalOz, size = 240 }: Props) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((currentOz / goalOz) * 100, 100);
  const goalHit = currentOz >= goalOz;

  const animProgress = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue: percentage,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  useEffect(() => {
    if (goalHit) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [goalHit]);

  const strokeDashoffset = animProgress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  const ringColor = goalHit ? COLORS.secondary : COLORS.primary;

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Svg width={size} height={size}>
          {/* Track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={COLORS.surface}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            rotation={-90}
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center text */}
        <View style={[styles.centerText, { width: size, height: size }]}>
          <Text style={[styles.currentOz, goalHit && { color: COLORS.secondary }]}>
            {currentOz}
          </Text>
          <Text style={styles.goalOz}>/ {goalOz} oz</Text>
          <Text style={[styles.percent, goalHit && { color: COLORS.secondary }]}>
            {Math.round(percentage)}%
          </Text>
        </View>
      </Animated.View>

      <Text style={[styles.message, goalHit && { color: COLORS.secondary }]}>
        {getMessage(percentage)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  centerText: {
    position: 'absolute',
    top: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentOz: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.text,
  },
  goalOz: {
    fontSize: SIZES.fontMd,
    color: COLORS.textMuted,
    marginTop: -4,
  },
  percent: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 4,
  },
  message: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.md,
    textAlign: 'center',
  },
});
