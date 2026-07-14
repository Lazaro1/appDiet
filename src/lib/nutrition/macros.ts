import type { Goal } from "@/generated/prisma"

/**
 * Macro distribution profiles based on goal.
 * Each profile defines the percentage of total kcal from protein, carbs, and fat.
 *
 * - lose: Higher protein for satiety and muscle preservation during deficit
 * - gain: Higher carbs for training energy and recovery
 * - maintain: Balanced distribution
 */
const MACRO_PROFILES: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  lose: { protein: 0.35, carbs: 0.35, fat: 0.30 },
  gain: { protein: 0.25, carbs: 0.50, fat: 0.25 },
  maintain: { protein: 0.30, carbs: 0.40, fat: 0.30 },
}

/** Calories per gram of macronutrient */
const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const

export interface MacroTargets {
  protein: number // grams
  carbs: number // grams
  fat: number // grams
  proteinKcal: number
  carbsKcal: number
  fatKcal: number
}

/**
 * Calculate daily macro targets from total kcal and goal.
 *
 * @param dailyKcal - Total daily calorie target
 * @param goal - User's goal (lose, gain, maintain)
 * @returns Macro targets in grams and kcal, rounded to nearest integer
 */
export function calculateMacros(dailyKcal: number, goal: Goal): MacroTargets {
  const profile = MACRO_PROFILES[goal]

  const proteinKcal = Math.round(dailyKcal * profile.protein)
  const carbsKcal = Math.round(dailyKcal * profile.carbs)
  const fatKcal = Math.round(dailyKcal * profile.fat)

  return {
    protein: Math.round(proteinKcal / KCAL_PER_GRAM.protein),
    carbs: Math.round(carbsKcal / KCAL_PER_GRAM.carbs),
    fat: Math.round(fatKcal / KCAL_PER_GRAM.fat),
    proteinKcal,
    carbsKcal,
    fatKcal,
  }
}

/**
 * Calculate daily calorie target based on TDEE and goal.
 *
 * - lose: 500 kcal deficit (moderate, ~0.5 kg/week)
 * - gain: 300 kcal surplus (lean bulk)
 * - maintain: TDEE as-is
 */
export function calculateDailyKcalTarget(tdee: number, goal: Goal): number {
  switch (goal) {
    case "lose":
      return Math.round(tdee - 500)
    case "gain":
      return Math.round(tdee + 300)
    case "maintain":
      return Math.round(tdee)
  }
}

/**
 * Get the macro profile percentages for a goal.
 * Useful for display purposes.
 */
export function getMacroProfile(goal: Goal): { protein: number; carbs: number; fat: number } {
  return MACRO_PROFILES[goal]
}
