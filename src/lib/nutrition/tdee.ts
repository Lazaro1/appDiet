import type { ActivityLevel } from "@/generated/prisma"

/**
 * Activity multipliers for TDEE calculation.
 * Based on the Mifflin-St Jeor activity factors.
 */
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/**
 * Calculate Total Daily Energy Expenditure.
 *
 * TDEE = BMR × activity multiplier
 *
 * @param bmr - Basal Metabolic Rate in kcal/day
 * @param activityLevel - User's activity level
 * @returns TDEE in kcal/day, rounded to nearest integer
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel]
  return Math.round(bmr * multiplier)
}

/**
 * Get the activity multiplier for a given level.
 * Useful for display purposes.
 */
export function getActivityMultiplier(activityLevel: ActivityLevel): number {
  return ACTIVITY_MULTIPLIERS[activityLevel]
}
