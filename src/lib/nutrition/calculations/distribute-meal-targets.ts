import { normalizeFoodName } from "../normalize-name"
import type { MealTarget, MealWindowInput } from "../types"

const MEAL_WEIGHT_PATTERNS: Array<{ pattern: RegExp; weight: number }> = [
  { pattern: /almoco|almoço/i, weight: 0.3 },
  { pattern: /jantar/i, weight: 0.25 },
  { pattern: /cafe|cafe da manha|café/i, weight: 0.2 },
  { pattern: /ceia/i, weight: 0.1 },
  { pattern: /lanche/i, weight: 0.15 },
]

function mealWeight(name: string, mealCount: number): number {
  const normalized = normalizeFoodName(name)

  for (const { pattern, weight } of MEAL_WEIGHT_PATTERNS) {
    if (pattern.test(normalized)) return weight
  }

  return 1 / mealCount
}

/**
 * Distributes daily kcal across meal windows before LLM generation.
 * Adjusts the last meal so the sum matches dailyKcalTarget exactly.
 */
export function distributeMealCalories(
  dailyKcalTarget: number,
  meals: MealWindowInput[],
): MealTarget[] {
  if (meals.length === 0) return []

  const weights = meals.map((meal) => mealWeight(meal.name, meals.length))
  const weightSum = weights.reduce((sum, w) => sum + w, 0)

  const targets = meals.map((meal, index) => ({
    ...meal,
    kcalTarget: Math.round(dailyKcalTarget * (weights[index] / weightSum)),
  }))

  const allocated = targets.reduce((sum, meal) => sum + meal.kcalTarget, 0)
  targets[targets.length - 1].kcalTarget += dailyKcalTarget - allocated

  return targets
}
