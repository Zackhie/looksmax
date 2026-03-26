export { COLORS, FONTS, SIZES } from './theme';

export const STORAGE_KEYS = {
  USER_PROFILE: '@lockin_user_profile',
  ONBOARDING_COMPLETE: '@lockin_onboarding_complete',
  SCAN_HISTORY: '@lockin_scan_history',
  WATER_LOG: '@lockin_water_log',
  DAILY_TASKS: '@lockin_daily_tasks',
  USER_STATS: '@lockin_user_stats',
  NOTIFICATION_PREFS: '@lockin_notification_prefs',
} as const;

export const DEFAULT_WATER_GOAL_OZ = 80; // ~2.4 liters
