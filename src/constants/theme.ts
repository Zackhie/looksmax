export const COLORS = {
  // Backgrounds
  background: '#0A0A0F',
  surface: '#141420',
  surfaceLight: '#1E1E2E',
  card: '#1A1A2A',

  // Primary accent — electric cyan
  primary: '#00E5FF',
  primaryDim: '#00B8D4',
  primaryGlow: 'rgba(0, 229, 255, 0.15)',

  // Secondary accent — gold/amber
  secondary: '#FFB800',
  secondaryDim: '#CC9300',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A0B8',
  textMuted: '#6B6B80',

  // Status
  success: '#00E676',
  warning: '#FFB800',
  error: '#FF5252',

  // Misc
  border: '#2A2A3E',
  overlay: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const FONTS = {
  bold: 'PlusJakartaSans-Bold',
  semiBold: 'PlusJakartaSans-SemiBold',
  medium: 'PlusJakartaSans-Medium',
  regular: 'PlusJakartaSans-Regular',
  // Fallback to system font until custom fonts are loaded
  system: 'System',
} as const;

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Border radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Font sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 20,
  fontXl: 24,
  fontXxl: 32,
  fontDisplay: 48,
} as const;
