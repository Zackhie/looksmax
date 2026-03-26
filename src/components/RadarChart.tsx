import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { COLORS, SIZES } from '../constants';

interface Props {
  scores: {
    symmetry: number;
    jawlineDefinition: number;
    facialDefinition: number;
    skinClarity: number;
    overallPotential: number;
  };
  size?: number;
}

const LABELS = ['Symmetry', 'Jawline', 'Definition', 'Skin', 'Overall'];

export default function RadarChart({ scores, size = 260 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const values = [
    scores.symmetry,
    scores.jawlineDefinition,
    scores.facialDefinition,
    scores.skinClarity,
    scores.overallPotential,
  ];
  const n = values.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2; // start from top

  const getPoint = (index: number, value: number) => {
    const angle = startAngle + index * angleStep;
    const r = (value / 100) * radius;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = startAngle + index * angleStep;
    const r = radius + 28;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Grid levels
  const levels = [25, 50, 75, 100];

  // Score polygon points
  const scorePoints = values
    .map((v, i) => {
      const p = getPoint(i, v);
      return `${p.x},${p.y}`;
    })
    .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grid polygons */}
        {levels.map((level) => {
          const points = Array.from({ length: n })
            .map((_, i) => {
              const p = getPoint(i, level);
              return `${p.x},${p.y}`;
            })
            .join(' ');
          return (
            <Polygon
              key={level}
              points={points}
              fill="none"
              stroke={COLORS.border}
              strokeWidth={1}
              opacity={0.5}
            />
          );
        })}

        {/* Axis lines */}
        {Array.from({ length: n }).map((_, i) => {
          const p = getPoint(i, 100);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke={COLORS.border}
              strokeWidth={1}
              opacity={0.4}
            />
          );
        })}

        {/* Score polygon */}
        <Polygon
          points={scorePoints}
          fill={COLORS.primary}
          fillOpacity={0.15}
          stroke={COLORS.primary}
          strokeWidth={2}
        />

        {/* Score dots */}
        {values.map((v, i) => {
          const p = getPoint(i, v);
          return (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={COLORS.primary}
            />
          );
        })}

        {/* Labels */}
        {LABELS.map((label, i) => {
          const p = getLabelPoint(i);
          return (
            <SvgText
              key={i}
              x={p.x}
              y={p.y}
              fill={COLORS.textSecondary}
              fontSize={11}
              fontWeight="600"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
