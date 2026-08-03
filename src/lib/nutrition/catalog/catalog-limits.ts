import type { NutritionalRole } from "../types"

export function roleLimitsForMealCount(
  mealCount: number,
): Record<NutritionalRole, number> {
  return {
    protein: Math.min(mealCount + 2, 12),
    carbohydrate: Math.min(Math.ceil(mealCount / 2) + 3, 10),
    vegetable: Math.min(mealCount, 6),
    fruit: Math.min(Math.ceil(mealCount / 2) + 2, 6),
    dairy: 4,
    fat: 3,
    beverage: 2,
    complement: 2,
  }
}
