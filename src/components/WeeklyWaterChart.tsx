import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { COLORS, SIZES } from '../constants';
import { DailyTotal } from '../services/waterStorage';

interface Props {
  data: DailyTotal[];
  goalOz: number;
  width?: number;
  height?: number;
}

export default function WeeklyWaterChart({
  data,
  goalOz,
  width = 340,
  height = 180,
}: Props) {
  const padding = { top: 20, bottom: 30, left: 10, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxOz = Math.max(goalOz * 1.2, ...data.map((d) => d.totalOz));
  const barWidth = chartW / data.length - 8;
  const goalY = padding.top + chartH * (1 - goalOz / maxOz);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last 7 Days</Text>
      <Svg width={width} height={height}>
        {/* Goal dashed line */}
        <Line
          x1={padding.left}
          y1={goalY}
          x2={width - padding.right}
          y2={goalY}
          stroke={COLORS.textMuted}
          strokeWidth={1}
          strokeDasharray="6 4"
          opacity={0.5}
        />
        <SvgText
          x={width - padding.right - 2}
          y={goalY - 4}
          fill={COLORS.textMuted}
          fontSize={9}
          textAnchor="end"
        >
          Goal
        </SvgText>

        {/* Bars */}
        {data.map((d, i) => {
          const barH = Math.max((d.totalOz / maxOz) * chartH, 2);
          const x = padding.left + i * (chartW / data.length) + 4;
          const y = padding.top + chartH - barH;
          const metGoal = d.totalOz >= goalOz;

          return (
            <React.Fragment key={d.date}>
              {/* Bar background */}
              <Rect
                x={x}
                y={padding.top}
                width={barWidth}
                height={chartH}
                rx={4}
                fill={COLORS.surface}
                opacity={0.5}
              />
              {/* Bar fill */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={barH}
                rx={4}
                fill={metGoal ? COLORS.primary : COLORS.textMuted}
                opacity={metGoal ? 1 : 0.4}
              />
              {/* Day label */}
              <SvgText
                x={x + barWidth / 2}
                y={height - 6}
                fill={COLORS.textMuted}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
              >
                {d.dayLabel}
              </SvgText>
              {/* Amount label */}
              {d.totalOz > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fill={metGoal ? COLORS.primary : COLORS.textMuted}
                  fontSize={9}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {d.totalOz}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
    alignSelf: 'flex-start',
  },
});
