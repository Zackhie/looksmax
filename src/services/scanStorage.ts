import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { FaceScan } from '../types';

export async function saveScan(scan: FaceScan): Promise<void> {
  const existing = await getScans();
  existing.push(scan);
  await AsyncStorage.setItem(
    STORAGE_KEYS.SCAN_HISTORY,
    JSON.stringify(existing)
  );
}

export async function getScans(): Promise<FaceScan[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.SCAN_HISTORY);
  return data ? JSON.parse(data) : [];
}

export async function getLatestScan(): Promise<FaceScan | null> {
  const scans = await getScans();
  if (scans.length === 0) return null;
  return scans[scans.length - 1];
}
