import { DailyTask, FaceScan, TaskCategory } from '../types';
import { TASK_BANK, TaskTemplate, WeightKey } from '../constants/taskBank';

const TOTAL_TASKS = 10;

/** Map scan score keys to a numeric value for ranking (waterRetention is categorical) */
function getNumericScores(scores: FaceScan['scores']): Record<WeightKey, number> {
  const wrScore = scores.waterRetention === 'low' ? 85 : scores.waterRetention === 'moderate' ? 55 : 25;
  return {
    symmetry: scores.symmetry,
    jawlineDefinition: scores.jawlineDefinition,
    facialDefinition: scores.facialDefinition,
    skinClarity: scores.skinClarity,
    waterRetention: wrScore,
  };
}

/** Rank weight keys from lowest to highest score */
function rankWeaknesses(scores: Record<WeightKey, number>): WeightKey[] {
  return (Object.entries(scores) as [WeightKey, number][])
    .sort((a, b) => a[1] - b[1])
    .map(([key]) => key);
}

/** Assign priority based on how weak the mapped scan score is */
function getPriority(
  weightKey: WeightKey,
  ranked: WeightKey[]
): 'high' | 'medium' | 'low' {
  const idx = ranked.indexOf(weightKey);
  if (idx <= 1) return 'high';   // bottom 2 scores
  if (idx <= 3) return 'medium'; // middle
  return 'low';                   // top score
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function generateDailyTasks(
  scan: FaceScan | null,
  yesterdayTaskIds: string[] = []
): DailyTask[] {
  const dateStr = today();

  // Default scores if no scan yet
  const numScores = scan
    ? getNumericScores(scan.scores)
    : {
        symmetry: 70,
        jawlineDefinition: 60,
        facialDefinition: 65,
        skinClarity: 60,
        waterRetention: 55,
      };

  const ranked = rankWeaknesses(numScores);
  const selected: TaskTemplate[] = [];
  const usedIds = new Set<string>();

  // ── Step 1: Always include mandatory daily tasks ──────────
  const morningCare = TASK_BANK.find((t) => t.id === 'skin-am-routine')!;
  const nightCare = TASK_BANK.find((t) => t.id === 'skin-pm-routine')!;
  const waterGoal = TASK_BANK.find((t) => t.id === 'bloat-water-goal')!;

  [morningCare, nightCare, waterGoal].forEach((t) => {
    selected.push(t);
    usedIds.add(t.id);
  });

  // ── Step 2: Fill remaining 7 slots weighted by weaknesses ─
  const remaining = TOTAL_TASKS - selected.length;

  // Build a weighted pool: tasks mapping to weaker scores get more copies
  const pool: TaskTemplate[] = [];
  const available = TASK_BANK.filter(
    (t) => !usedIds.has(t.id) && (t.frequency === 'daily' || !yesterdayTaskIds.includes(t.id))
  );

  for (const task of available) {
    const weaknessIdx = ranked.indexOf(task.weightKey);
    // weight: weakest score → 5 copies, strongest → 1 copy
    const weight = 5 - weaknessIdx;
    for (let i = 0; i < weight; i++) {
      pool.push(task);
    }
  }

  const shuffled = shuffle(pool);
  const categoryCounts: Partial<Record<TaskCategory, number>> = {
    skincare: 2, // already have morning + night
  };

  for (const task of shuffled) {
    if (selected.length >= TOTAL_TASKS) break;
    if (usedIds.has(task.id)) continue;

    // Limit per category to ensure variety (max 3 from any one category)
    const catCount = categoryCounts[task.category] ?? 0;
    if (catCount >= 3) continue;

    selected.push(task);
    usedIds.add(task.id);
    categoryCounts[task.category] = catCount + 1;
  }

  // ── Convert to DailyTask objects ──────────────────────────
  return selected.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    category: t.category,
    estimatedMinutes: t.estimatedMinutes,
    completed: false,
    date: dateStr,
    priority: getPriority(t.weightKey, ranked),
  }));
}
