import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { WaterEntry } from '../types';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getAllEntries(): Promise<WaterEntry[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.WATER_LOG);
  return data ? JSON.parse(data) : [];
}

async function saveAllEntries(entries: WaterEntry[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.WATER_LOG, JSON.stringify(entries));
}

export async function addWaterEntry(amountOz: number): Promise<WaterEntry> {
  const entry: WaterEntry = {
    id: Date.now().toString(),
    amountOz,
    timestamp: new Date().toISOString(),
    date: todayKey(),
  };
  const entries = await getAllEntries();
  entries.push(entry);
  await saveAllEntries(entries);
  return entry;
}

export async function getEntriesToday(): Promise<WaterEntry[]> {
  const today = todayKey();
  const entries = await getAllEntries();
  return entries.filter((e) => e.date === today);
}

export async function getEntriesForDate(date: string): Promise<WaterEntry[]> {
  const entries = await getAllEntries();
  return entries.filter((e) => e.date === date);
}

export async function deleteEntry(entryId: string): Promise<void> {
  const entries = await getAllEntries();
  const filtered = entries.filter((e) => e.id !== entryId);
  await saveAllEntries(filtered);
}

export async function getTodayTotal(): Promise<number> {
  const entries = await getEntriesToday();
  return entries.reduce((sum, e) => sum + e.amountOz, 0);
}

export interface DailyTotal {
  date: string;
  dayLabel: string;
  totalOz: number;
}

export async function getWeeklyTotals(): Promise<DailyTotal[]> {
  const entries = await getAllEntries();
  const days: DailyTotal[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = dateKey(d);
    const dayEntries = entries.filter((e) => e.date === key);
    const total = dayEntries.reduce((sum, e) => sum + e.amountOz, 0);
    days.push({
      date: key,
      dayLabel: dayNames[d.getDay()],
      totalOz: total,
    });
  }

  return days;
}

export async function getLastEntryTime(): Promise<Date | null> {
  const entries = await getEntriesToday();
  if (entries.length === 0) return null;
  const sorted = entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return new Date(sorted[0].timestamp);
}

/** Returns true if it's been 2+ hours since last entry and goal not met */
export async function isHydrationReminder(goalOz: number): Promise<boolean> {
  const total = await getTodayTotal();
  if (total >= goalOz) return false;

  const lastTime = await getLastEntryTime();
  if (!lastTime) return true; // No entries today at all

  const hoursSince = (Date.now() - lastTime.getTime()) / (1000 * 60 * 60);
  return hoursSince >= 2;
}
