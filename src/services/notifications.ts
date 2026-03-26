import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_WATER_GOAL_OZ } from '../constants';
import { getTodayTotal } from './waterStorage';
import { getLatestScan } from './scanStorage';
import { getUserProfile } from './storage';
import { loadDailyTasks } from './taskStorage';

// --- Types ---

export interface NotificationPrefs {
  taskReminders: boolean;
  waterReminders: boolean;
  scanReminders: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  taskReminders: true,
  waterReminders: true,
  scanReminders: true,
};

// Channel IDs for grouping scheduled notifications
const CHANNEL_TASK = 'task-reminder';
const CHANNEL_WATER = 'water-reminder';
const CHANNEL_SCAN = 'scan-reminder';

// --- Preferences ---

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_PREFS);
    if (data) return { ...DEFAULT_PREFS, ...JSON.parse(data) };
  } catch {}
  return DEFAULT_PREFS;
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_PREFS, JSON.stringify(prefs));
}

// --- Permissions ---

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      // Notifications don't work on simulator
      return false;
    }

    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === 'granted') return true;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export async function checkNotificationPermissions(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

export function openNotificationSettings(): void {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
}

// --- Configure ---

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Lock In Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
}

// --- Clear Delivered ---

export async function clearDeliveredNotifications(): Promise<void> {
  try {
    await Notifications.dismissAllNotificationsAsync();
  } catch {}
}

// --- Cancel Helpers ---

async function cancelByIdentifierPrefix(prefix: string): Promise<void> {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.identifier.startsWith(prefix)) {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }
  } catch {}
}

export async function cancelAllReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {}
}

export async function cancelTaskReminders(): Promise<void> {
  await cancelByIdentifierPrefix(CHANNEL_TASK);
}

export async function cancelWaterReminders(): Promise<void> {
  await cancelByIdentifierPrefix(CHANNEL_WATER);
}

export async function cancelScanReminders(): Promise<void> {
  await cancelByIdentifierPrefix(CHANNEL_SCAN);
}

// --- Schedule: Morning Task Reminder ---

async function scheduleTaskReminder(): Promise<void> {
  try {
    // Get pending task count for the body text
    const tasks = await loadDailyTasks();
    const pendingCount = tasks ? tasks.filter((t) => !t.completed).length : 10;

    await Notifications.scheduleNotificationAsync({
      identifier: `${CHANNEL_TASK}-daily`,
      content: {
        title: 'Time to lock in',
        body: `Your daily plan is ready — ${pendingCount} tasks waiting for you`,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
  } catch {}
}

// --- Schedule: Water Reminders (every 2h, 8AM–10PM) ---

async function scheduleWaterReminders(): Promise<void> {
  try {
    const profile = await getUserProfile();
    const goalOz = profile?.waterGoalOz ?? DEFAULT_WATER_GOAL_OZ;
    const currentTotal = await getTodayTotal();

    // If goal already met, don't schedule
    if (currentTotal >= goalOz) return;

    // Schedule for hours: 8, 10, 12, 14, 16, 18, 20, 22
    const hours = [8, 10, 12, 14, 16, 18, 20, 22];
    const now = new Date();
    const currentHour = now.getHours();

    for (const hour of hours) {
      // Calculate expected intake at this hour
      // Full day = 8AM to 10PM (14 hours), proportional
      const hoursIntoDay = hour - 8;
      const expectedAtHour = Math.round((hoursIntoDay / 14) * goalOz);
      const behindBy = Math.max(0, expectedAtHour - currentTotal);

      // Only schedule future reminders with a behind-pace message
      if (hour <= currentHour && behindBy === 0) continue;

      await Notifications.scheduleNotificationAsync({
        identifier: `${CHANNEL_WATER}-${hour}`,
        content: {
          title: 'Stay hydrated',
          body: `You're ${behindBy > 0 ? behindBy : '~' + Math.round(goalOz / 7)} oz behind pace — take a sip`,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute: 0,
        },
      });
    }
  } catch {}
}

// --- Schedule: Weekly Scan Reminder (Sunday 7PM) ---

async function scheduleScanReminder(): Promise<void> {
  try {
    // Check if user scanned recently (within 5 days)
    const latestScan = await getLatestScan();
    if (latestScan) {
      const daysSince =
        (Date.now() - new Date(latestScan.timestamp).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 5) return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: `${CHANNEL_SCAN}-weekly`,
      content: {
        title: 'Weekly check-in',
        body: "Time for your weekly scan — see how far you've come",
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1, // Sunday = 1 in expo-notifications
        hour: 19,
        minute: 0,
      },
    });
  } catch {}
}

// --- Public API ---

/**
 * Schedule all enabled reminders. Call after onboarding and on each app launch.
 */
export async function scheduleAllReminders(): Promise<void> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  const prefs = await getNotificationPrefs();

  // Cancel everything first to avoid duplicates
  await cancelAllReminders();

  if (prefs.taskReminders) {
    await scheduleTaskReminder();
  }
  if (prefs.waterReminders) {
    await scheduleWaterReminders();
  }
  if (prefs.scanReminders) {
    await scheduleScanReminder();
  }
}

/**
 * Recalculate water reminders based on current intake.
 * Call whenever water is logged.
 */
export async function updateWaterReminders(): Promise<void> {
  const hasPermission = await checkNotificationPermissions();
  if (!hasPermission) return;

  const prefs = await getNotificationPrefs();
  if (!prefs.waterReminders) return;

  await cancelWaterReminders();

  const profile = await getUserProfile();
  const goalOz = profile?.waterGoalOz ?? DEFAULT_WATER_GOAL_OZ;
  const currentTotal = await getTodayTotal();

  // If goal met, don't reschedule — water reminders stay cancelled for today
  if (currentTotal >= goalOz) return;

  await scheduleWaterReminders();
}

/**
 * Toggle a specific reminder category on/off.
 */
export async function toggleReminderCategory(
  category: keyof NotificationPrefs,
  enabled: boolean
): Promise<void> {
  const prefs = await getNotificationPrefs();
  prefs[category] = enabled;
  await saveNotificationPrefs(prefs);

  if (!enabled) {
    switch (category) {
      case 'taskReminders':
        await cancelTaskReminders();
        break;
      case 'waterReminders':
        await cancelWaterReminders();
        break;
      case 'scanReminders':
        await cancelScanReminders();
        break;
    }
  } else {
    // Re-schedule just that category
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) return;

    switch (category) {
      case 'taskReminders':
        await scheduleTaskReminder();
        break;
      case 'waterReminders':
        await scheduleWaterReminders();
        break;
      case 'scanReminders':
        await scheduleScanReminder();
        break;
    }
  }
}
