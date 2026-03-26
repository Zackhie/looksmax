import AsyncStorage from '@react-native-async-storage/async-storage';
import { FaceScan } from '../types';
import { getStreakData } from './taskStorage';
import { getScans } from './scanStorage';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  earnedAt: string | null; // ISO date or null if locked
}

export const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'earnedAt'>[] = [
  { id: 'first-scan', title: 'First Scan', description: 'Completed your first face scan', icon: 'camera-outline' },
  { id: 'streak-7', title: 'Locked In 7', description: '7-day task streak', icon: 'flame-outline' },
  { id: 'streak-14', title: 'Locked In 14', description: '14-day task streak', icon: 'flame' },
  { id: 'streak-30', title: 'Locked In 30', description: '30-day task streak', icon: 'crown-outline' },
  { id: 'hydration-hero', title: 'Hydration Hero', description: 'Hit water goal 7 days in a row', icon: 'water-outline' },
  { id: 'skin-warrior', title: 'Skin Warrior', description: 'All skincare tasks done 7 days straight', icon: 'sparkles-outline' },
  { id: 'jaw-gains', title: 'Jaw Gains', description: 'Jawline score improved 10+ points', icon: 'diamond-outline' },
  { id: 'symmetry-king', title: 'Symmetry King', description: 'Symmetry score above 85', icon: 'git-compare-outline' },
  { id: 'glow-up', title: 'Glow Up', description: 'Overall score improved 15+ points', icon: 'trending-up-outline' },
  { id: 'century-club', title: 'Century Club', description: 'Overall potential score hit 90+', icon: 'trophy-outline' },
];

const ACHIEVEMENTS_KEY = '@lockin_achievements';

export async function getAchievements(): Promise<Achievement[]> {
  const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  if (data) return JSON.parse(data);
  return ACHIEVEMENT_DEFINITIONS.map((a) => ({ ...a, earnedAt: null }));
}

async function saveAchievements(achievements: Achievement[]): Promise<void> {
  await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

function earn(achievements: Achievement[], id: string): boolean {
  const a = achievements.find((x) => x.id === id);
  if (a && !a.earnedAt) {
    a.earnedAt = new Date().toISOString();
    return true;
  }
  return false;
}

export async function checkAchievements(): Promise<Achievement[]> {
  const achievements = await getAchievements();
  const scans = await getScans();
  const streak = await getStreakData();

  // First Scan
  if (scans.length >= 1) earn(achievements, 'first-scan');

  // Streak achievements
  if (streak.longestStreak >= 7) earn(achievements, 'streak-7');
  if (streak.longestStreak >= 14) earn(achievements, 'streak-14');
  if (streak.longestStreak >= 30) earn(achievements, 'streak-30');

  // Scan-based achievements
  if (scans.length >= 2) {
    const first = scans[0];
    const latest = scans[scans.length - 1];

    // Jaw Gains
    if (latest.scores.jawlineDefinition - first.scores.jawlineDefinition >= 10) {
      earn(achievements, 'jaw-gains');
    }

    // Glow Up
    if (latest.scores.overallPotential - first.scores.overallPotential >= 15) {
      earn(achievements, 'glow-up');
    }
  }

  if (scans.length >= 1) {
    const latest = scans[scans.length - 1];

    // Symmetry King
    if (latest.scores.symmetry >= 85) earn(achievements, 'symmetry-king');

    // Century Club
    if (latest.scores.overallPotential >= 90) earn(achievements, 'century-club');
  }

  // Hydration Hero and Skin Warrior are harder to compute from current storage
  // For now, check streak as proxy — these can be refined when we track per-day completion
  if (streak.longestStreak >= 7) {
    earn(achievements, 'hydration-hero');
    earn(achievements, 'skin-warrior');
  }

  await saveAchievements(achievements);
  return achievements;
}
