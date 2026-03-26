import React from 'react';
import Svg, { Ellipse, Line, Circle, Path } from 'react-native-svg';
import { COLORS } from '../constants';

interface Props {
  width: number;
  height: number;
}

export default function LandmarkOverlay({ width, height }: Props) {
  const cx = width / 2;
  const cy = height * 0.42;
  const faceRx = width * 0.32;
  const faceRy = height * 0.25;

  const eyeY = cy - faceRy * 0.18;
  const eyeSpread = faceRx * 0.45;
  const noseTopY = cy + faceRy * 0.0;
  const noseBottomY = cy + faceRy * 0.25;
  const mouthY = cy + faceRy * 0.45;
  const jawY = cy + faceRy * 0.7;
  const chinY = cy + faceRy * 0.95;

  const color = COLORS.primary;
  const op = 0.5;

  return (
    <Svg width={width} height={height} style={{ position: 'absolute' }}>
      {/* Jawline path */}
      <Path
        d={`M ${cx - faceRx * 0.9} ${jawY} Q ${cx - faceRx * 0.35} ${chinY + 8} ${cx} ${chinY + 12} Q ${cx + faceRx * 0.35} ${chinY + 8} ${cx + faceRx * 0.9} ${jawY}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={op}
      />

      {/* Left eye outline */}
      <Ellipse cx={cx - eyeSpread} cy={eyeY} rx={faceRx * 0.18} ry={faceRx * 0.09} fill="none" stroke={color} strokeWidth={1.5} opacity={op} />
      {/* Right eye outline */}
      <Ellipse cx={cx + eyeSpread} cy={eyeY} rx={faceRx * 0.18} ry={faceRx * 0.09} fill="none" stroke={color} strokeWidth={1.5} opacity={op} />

      {/* Nose center line */}
      <Line x1={cx} y1={noseTopY} x2={cx} y2={noseBottomY} stroke={color} strokeWidth={1.5} opacity={op} />
      {/* Nose width markers */}
      <Line x1={cx - faceRx * 0.12} y1={noseBottomY} x2={cx + faceRx * 0.12} y2={noseBottomY} stroke={color} strokeWidth={1.5} opacity={op} />

      {/* Mouth line */}
      <Path
        d={`M ${cx - faceRx * 0.3} ${mouthY} Q ${cx} ${mouthY + 8} ${cx + faceRx * 0.3} ${mouthY}`}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={op}
      />

      {/* Symmetry center line */}
      <Line x1={cx} y1={cy - faceRy - 15} x2={cx} y2={chinY + 20} stroke={color} strokeWidth={1} opacity={0.2} strokeDasharray="5 5" />

      {/* Landmark dots */}
      {[
        [cx - eyeSpread, eyeY],
        [cx + eyeSpread, eyeY],
        [cx, noseBottomY],
        [cx - faceRx * 0.3, mouthY],
        [cx + faceRx * 0.3, mouthY],
        [cx, chinY + 12],
        [cx - faceRx * 0.9, jawY],
        [cx + faceRx * 0.9, jawY],
      ].map(([x, y], i) => (
        <Circle key={i} cx={x} cy={y} r={3} fill={color} opacity={0.7} />
      ))}
    </Svg>
  );
}
