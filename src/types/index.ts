export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  goals: Goal[];
  bodyWeight?: number; // in pounds, optional
  waterGoalOz: number;
  createdAt: string;
  onboardingComplete: boolean;
}

export type Goal =
  | 'jawline'
  | 'skin'
  | 'symmetry'
  | 'bloat'
  | 'overall';

export const GOAL_LABELS: Record<Goal, string> = {
  jawline: 'Jawline Definition',
  skin: 'Skin Clarity',
  symmetry: 'Facial Symmetry',
  bloat: 'Reduce Bloating',
  overall: 'Overall Glow-Up',
};

export interface FaceScan {
  id: string;
  userId: string;
  photoUri: string;
  timestamp: string;
  scores: {
    symmetry: number;
    jawlineDefinition: number;
    facialDefinition: number;
    waterRetention: 'low' | 'moderate' | 'high';
    skinClarity: number;
    overallPotential: number;
  };
  insights: string[];
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  estimatedMinutes: number;
  completed: boolean;
  date: string; // YYYY-MM-DD
  priority: 'high' | 'medium' | 'low';
}

export type TaskCategory =
  | 'skincare'
  | 'jawline'
  | 'hydration'
  | 'fitness'
  | 'sleep'
  | 'grooming'
  | 'nutrition'
  | 'confidence';

export interface WaterEntry {
  id: string;
  amountOz: number;
  timestamp: string;
  date: string; // YYYY-MM-DD
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  totalTasksCompleted: number;
  totalWaterConsumed: number;
  scanHistory: FaceScan[];
}
