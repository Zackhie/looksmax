import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { DailyTask } from '../types';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Save today's tasks */
export async function saveDailyTasks(tasks: DailyTask[]): Promise<void> {
  const key = `${STORAGE_KEYS.DAILY_TASKS}_${todayKey()}`;
  await AsyncStorage.setItem(key, JSON.stringify(tasks));
}

/** Load today's tasks (returns null if none generated yet) */
export async function loadDailyTasks(): Promise<DailyTask[] | null> {
  const key = `${STORAGE_KEYS.DAILY_TASKS}_${todayKey()}`;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

/** Get yesterday's task IDs (to avoid repeats) */
export async function getYesterdayTaskIds(): Promise<string[]> {
  const key = `${STORAGE_KEYS.DAILY_TASKS}_${yesterdayKey()}`;
  const data = await AsyncStorage.getItem(key);
  if (!data) return [];
  const tasks: DailyTask[] = JSON.parse(data);
  return tasks.map((t) => t.id);
}

/** Toggle a task's completed status */
export async function toggleTask(taskId: string): Promise<DailyTask[]> {
  const tasks = await loadDailyTasks();
  if (!tasks) return [];
  const updated = tasks.map((t) =>
    t.id === taskId ? { ...t, completed: !t.completed } : t
  );
  await saveDailyTasks(updated);
  return updated;
}

// ── Streak Tracking ──────────────────────────────────────────

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLockedInDate: string | null;
  totalXP: number;
}

const STREAK_KEY = '@lockin_streak_data';

export async function getStreakData(): Promise<StreakData> {
  const data = await AsyncStorage.getItem(STREAK_KEY);
  if (data) return JSON.parse(data);
  return { currentStreak: 0, longestStreak: 0, lastLockedInDate: null, totalXP: 0 };
}

export async function saveStreakData(streak: StreakData): Promise<void> {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(streak));
}

/**
 * Call at the end of the day or when all tasks are checked.
 * A day is "locked in" if >=7 of 10 tasks are completed.
 */
export async function checkAndUpdateStreak(completedCount: number): Promise<StreakData> {
  const streak = await getStreakData();
  const today = todayKey();

  if (streak.lastLockedInDate === today) {
    // Already processed today
    return streak;
  }

  if (completedCount >= 7) {
    const yesterday = yesterdayKey();
    if (streak.lastLockedInDate === yesterday) {
      streak.currentStreak += 1;
    } else {
      streak.currentStreak = 1;
    }
    streak.lastLockedInDate = today;
    streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
  }

  await saveStreakData(streak);
  return streak;
}

/** Add XP and persist */
export async function addXP(points: number): Promise<StreakData> {
  const streak = await getStreakData();
  streak.totalXP += points;
  await saveStreakData(streak);
  return streak;
}
