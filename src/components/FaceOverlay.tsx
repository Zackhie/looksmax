import React from 'react';
import Svg, { Ellipse, Line, Circle, Path } from 'react-native-svg';
import { COLORS } from '../constants';

interface Props {
  width: number;
  height: number;
  opacity?: number;
}

export default function FaceOverlay({ width, height, opacity = 0.6 }: Props) {
  const cx = width / 2;
  const cy = height / 2;
  const rx = width * 0.28; // oval width
  const ry = height * 0.22; // oval height

  // Eye positions relative to center
  const eyeY = cy - ry * 0.2;
  const eyeSpread = rx * 0.45;

  // Nose
  const noseTopY = cy - ry * 0.05;
  const noseBottomY = cy + ry * 0.2;

  // Mouth
  const mouthY = cy + ry * 0.45;
  const mouthWidth = rx * 0.4;

  // Jawline control points
  const jawLeftX = cx - rx * 0.85;
  const jawRightX = cx + rx * 0.85;
  const jawY = cy + ry * 0.7;
  const chinY = cy + ry * 0.95;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }}>
      {/* Face oval outline */}
      <Ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth={2}
        opacity={opacity}
      />

      {/* Left eye */}
      <Ellipse
        cx={cx - eyeSpread}
        cy={eyeY}
        rx={rx * 0.16}
        ry={rx * 0.08}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth={1.5}
        opacity={opacity * 0.7}
      />

      {/* Right eye */}
      <Ellipse
        cx={cx + eyeSpread}
        cy={eyeY}
        rx={rx * 0.16}
        ry={rx * 0.08}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth={1.5}
        opacity={opacity * 0.7}
      />

      {/* Nose center line */}
      <Line
        x1={cx}
        y1={noseTopY}
        x2={cx}
        y2={noseBottomY}
        stroke={COLORS.primary}
        strokeWidth={1.5}
        opacity={opacity * 0.5}
      />

      {/* Nose tip markers */}
      <Circle cx={cx - rx * 0.08} cy={noseBottomY} r={2} fill={COLORS.primary} opacity={opacity * 0.6} />
      <Circle cx={cx + rx * 0.08} cy={noseBottomY} r={2} fill={COLORS.primary} opacity={opacity * 0.6} />

      {/* Mouth line */}
      <Line
        x1={cx - mouthWidth}
        y1={mouthY}
        x2={cx + mouthWidth}
        y2={mouthY}
        stroke={COLORS.primary}
        strokeWidth={1.5}
        opacity={opacity * 0.5}
      />

      {/* Jawline path */}
      <Path
        d={`M ${jawLeftX} ${jawY} Q ${cx - rx * 0.3} ${chinY} ${cx} ${chinY + 5} Q ${cx + rx * 0.3} ${chinY} ${jawRightX} ${jawY}`}
        fill="none"
        stroke={COLORS.primary}
        strokeWidth={1.5}
        opacity={opacity * 0.6}
        strokeDasharray="6 4"
      />

      {/* Symmetry center line */}
      <Line
        x1={cx}
        y1={cy - ry - 10}
        x2={cx}
        y2={cy + ry + 10}
        stroke={COLORS.primary}
        strokeWidth={1}
        opacity={opacity * 0.25}
        strokeDasharray="4 6"
      />
    </Svg>
  );
}
