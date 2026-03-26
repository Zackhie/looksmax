import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { DailyTask, FaceScan } from '../types';
import { getScans } from './scanStorage';
import { getStreakData } from './taskStorage';

/** Get task completion rate over last 7 days */
async function getWeeklyTaskRate(): Promise<number> {
  let totalTasks = 0;
  let completedTasks = 0;

  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const key = `${STORAGE_KEYS.DAILY_TASKS}_${dateStr}`;
    const data = await AsyncStorage.getItem(key);
    if (data) {
      const tasks: DailyTask[] = JSON.parse(data);
      totalTasks += tasks.length;
      completedTasks += tasks.filter((t) => t.completed).length;
    }
  }

  if (totalTasks === 0) return 0;
  return completedTasks / totalTasks;
}

export interface LockInScoreBreakdown {
  total: number;
  taskComponent: number;     // 0-40
  streakComponent: number;   // 0-30
  scanComponent: number;     // 0-30
  daysActive: number;
}

export async function calculateLockInScore(): Promise<LockInScoreBreakdown> {
  // Task completion rate → 40 points
  const taskRate = await getWeeklyTaskRate();
  const taskComponent = Math.round(taskRate * 40);

  // Streak bonus → 30 points (maxes at 30 days)
  const streak = await getStreakData();
  const streakRatio = Math.min(streak.currentStreak / 30, 1.0);
  const streakComponent = Math.round(streakRatio * 30);

  // Scan improvement → 30 points
  const scans = await getScans();
  let scanComponent = 10; // base
  if (scans.length >= 2) {
    const first = scans[0];
    const latest = scans[scans.length - 1];
    const improvement = latest.scores.overallPotential - first.scores.overallPotential;
    if (improvement > 0) {
      // Scale improvement (0-30 points improvement → 10-30 component points)
      scanComponent = Math.min(10 + Math.round(improvement * (20 / 30)), 30);
    }
  } else if (scans.length === 0) {
    scanComponent = 0;
  }

  // Calculate days active from first task or scan
  let daysActive = 0;
  if (scans.length > 0) {
    const firstDate = new Date(scans[0].timestamp);
    daysActive = Math.floor((Date.now() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  } else if (streak.lastLockedInDate) {
    daysActive = streak.currentStreak;
  }

  const total = taskComponent + streakComponent + scanComponent;

  return {
    total: Math.min(total, 100),
    taskComponent,
    streakComponent,
    scanComponent,
    daysActive,
  };
}
