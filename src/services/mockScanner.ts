import { FaceScan } from '../types';

interface ScoreRanges {
  symmetry: [number, number];
  jawlineDefinition: [number, number];
  facialDefinition: [number, number];
  skinClarity: [number, number];
  overallPotential: [number, number];
}

const RANGES: ScoreRanges = {
  symmetry: [62, 88],
  jawlineDefinition: [45, 82],
  facialDefinition: [50, 85],
  skinClarity: [48, 80],
  overallPotential: [55, 82],
};

const WATER_RETENTION_WEIGHTS = {
  low: 0.2,
  moderate: 0.55,
  high: 0.25,
};

function randomInRange(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function pickWaterRetention(): 'low' | 'moderate' | 'high' {
  const roll = Math.random();
  if (roll < WATER_RETENTION_WEIGHTS.low) return 'low';
  if (roll < WATER_RETENTION_WEIGHTS.low + WATER_RETENTION_WEIGHTS.moderate) return 'moderate';
  return 'high';
}

function generateInsights(scores: FaceScan['scores']): string[] {
  const insights: string[] = [];

  if (scores.symmetry >= 75) {
    insights.push('Your facial symmetry is above average — great foundation.');
  } else {
    insights.push('Your symmetry has room for improvement. Consistent mewing and sleeping on your back can help.');
  }

  if (scores.jawlineDefinition >= 65) {
    insights.push('Solid jawline definition. Keep up the jaw exercises and maintain low body fat.');
  } else {
    insights.push('Focus on jawline exercises — mewing, chewing gum, and reducing overall body fat will make a difference.');
  }

  if (scores.facialDefinition >= 65) {
    insights.push('Good facial leanness. Your features are well-defined.');
  } else {
    insights.push('Reduce facial bloat through cardio, hydration, and cutting sodium to reveal more defined features.');
  }

  if (scores.waterRetention === 'high') {
    insights.push('Significant water retention detected. Cut sodium, increase water intake, and try sleeping slightly elevated.');
  } else if (scores.waterRetention === 'moderate') {
    insights.push('Moderate bloating present. Stay hydrated and monitor your sodium intake.');
  }

  if (scores.skinClarity >= 65) {
    insights.push('Your skin is looking good. Maintain your routine with SPF and retinol.');
  } else {
    insights.push('Skin could use attention — prioritize a consistent AM/PM skincare routine with vitamin C and retinol.');
  }

  return insights;
}

export function generateMockScores(previousScan?: FaceScan | null): FaceScan['scores'] {
  if (previousScan) {
    // Generate scores within ±5 of previous scan for realistic progression
    const prev = previousScan.scores;
    return {
      symmetry: clamp(
        prev.symmetry + randomInRange(-5, 5),
        RANGES.symmetry[0],
        RANGES.symmetry[1]
      ),
      jawlineDefinition: clamp(
        prev.jawlineDefinition + randomInRange(-5, 5),
        RANGES.jawlineDefinition[0],
        RANGES.jawlineDefinition[1]
      ),
      facialDefinition: clamp(
        prev.facialDefinition + randomInRange(-5, 5),
        RANGES.facialDefinition[0],
        RANGES.facialDefinition[1]
      ),
      skinClarity: clamp(
        prev.skinClarity + randomInRange(-5, 5),
        RANGES.skinClarity[0],
        RANGES.skinClarity[1]
      ),
      overallPotential: clamp(
        prev.overallPotential + randomInRange(-5, 5),
        RANGES.overallPotential[0],
        RANGES.overallPotential[1]
      ),
      waterRetention: pickWaterRetention(),
    };
  }

  return {
    symmetry: randomInRange(...RANGES.symmetry),
    jawlineDefinition: randomInRange(...RANGES.jawlineDefinition),
    facialDefinition: randomInRange(...RANGES.facialDefinition),
    skinClarity: randomInRange(...RANGES.skinClarity),
    overallPotential: randomInRange(...RANGES.overallPotential),
    waterRetention: pickWaterRetention(),
  };
}

export function createFaceScan(
  photoUri: string,
  scores: FaceScan['scores'],
  userId: string = 'default'
): FaceScan {
  return {
    id: Date.now().toString(),
    userId,
    photoUri,
    timestamp: new Date().toISOString(),
    scores,
    insights: generateInsights(scores),
  };
}
