import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS, SIZES } from '../constants';
import { FaceScan } from '../types';

interface Props {
  scans: FaceScan[];
  width?: number;
  height?: number;
}

const METRICS = [
  { key: 'symmetry' as const, label: 'Symmetry', color: '#00E5FF' },
  { key: 'jawlineDefinition' as const, label: 'Jawline', color: '#FFB800' },
  { key: 'facialDefinition' as const, label: 'Definition', color: '#4CAF50' },
  { key: 'skinClarity' as const, label: 'Skin', color: '#BB86FC' },
  { key: 'overallPotential' as const, label: 'Overall', color: '#FFFFFF' },
];

export default function ScoreTrendsChart({ scans, width = 340, height = 200 }: Props) {
  const padding = { top: 20, bottom: 35, left: 35, right: 15 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (scans.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Take your first scan to see trends</Text>
      </View>
    );
  }

  if (scans.length === 1) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Scan again to see your trends</Text>
      </View>
    );
  }

  const getX = (i: number) => padding.left + (i / (scans.length - 1)) * chartW;
  const getY = (score: number) => padding.top + chartH * (1 - score / 100);

  // Date labels
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // Y-axis labels
  const yLabels = [0, 25, 50, 75, 100];

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Y-axis grid lines and labels */}
        {yLabels.map((val) => (
          <React.Fragment key={val}>
            <Line
              x1={padding.left}
              y1={getY(val)}
              x2={width - padding.right}
              y2={getY(val)}
              stroke={COLORS.border}
              strokeWidth={0.5}
              opacity={0.5}
            />
            <SvgText
              x={padding.left - 6}
              y={getY(val) + 3}
              fill={COLORS.textMuted}
              fontSize={9}
              textAnchor="end"
            >
              {val}
            </SvgText>
          </React.Fragment>
        ))}

        {/* X-axis date labels */}
        {scans.map((scan, i) => {
          // Show max 6 labels to avoid crowding
          if (scans.length > 6 && i % Math.ceil(scans.length / 6) !== 0 && i !== scans.length - 1) {
            return null;
          }
          return (
            <SvgText
              key={i}
              x={getX(i)}
              y={height - 5}
              fill={COLORS.textMuted}
              fontSize={9}
              textAnchor="middle"
            >
              {formatDate(scan.timestamp)}
            </SvgText>
          );
        })}

        {/* Metric lines */}
        {METRICS.map((metric) => {
          const points = scans
            .map((s, i) => `${getX(i)},${getY(s.scores[metric.key])}`)
            .join(' ');

          return (
            <React.Fragment key={metric.key}>
              <Polyline
                points={points}
                fill="none"
                stroke={metric.color}
                strokeWidth={2}
                opacity={0.8}
              />
              {/* Dots on each data point */}
              {scans.map((s, i) => (
                <Circle
                  key={i}
                  cx={getX(i)}
                  cy={getY(s.scores[metric.key])}
                  r={3}
                  fill={metric.color}
                />
              ))}
            </React.Fragment>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {METRICS.map((m) => (
          <View key={m.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: m.color }]} />
            <Text style={styles.legendLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  empty: {
    padding: SIZES.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.md,
    marginTop: SIZES.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
});
