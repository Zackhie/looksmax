import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';
import { UserProfile } from '../types';

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.USER_PROFILE,
    JSON.stringify(profile)
  );
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function setOnboardingComplete(complete: boolean): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.ONBOARDING_COMPLETE,
    JSON.stringify(complete)
  );
}

export async function isOnboardingComplete(): Promise<boolean> {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return data ? JSON.parse(data) : false;
}

export async function clearAllData(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
}
