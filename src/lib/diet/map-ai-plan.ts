import type { MealPreset } from "@/lib/onboarding/types"
import type { ParsedFoodItem } from "@/lib/ai/types"
import type { PortionUnit } from "@/generated/prisma"
import type { HydratedDietPlan } from "@/lib/nutrition/orchestration/hydrate-diet-draft"

export interface UserMealPreferences {
  mealsPerDay: number
  meals: MealPreset[]
  foodPreferences?: string
}

export function parseUserPreferences(preferences: unknown): UserMealPreferences | null {
  if (!preferences || typeof preferences !== "object") return null
  const p = preferences as Record<string, unknown>
  if (!Array.isArray(p.meals)) return null
  return {
    mealsPerDay: Number(p.mealsPerDay) || p.meals.length,
    meals: p.meals as MealPreset[],
    foodPreferences: typeof p.foodPreferences === "string" ? p.foodPreferences : undefined,
  }
}

export function mapFoodItemToMealItem(item: ParsedFoodItem) {
  return {
    name: item.foodName,
    quantity: item.estimatedGrams,
    unit: "g" as PortionUnit,
    kcal: item.estimatedKcal,
    protein: item.estimatedProtein,
    carbs: item.estimatedCarbs,
    fat: item.estimatedFat,
  }
}

/**
 * Maps a plan whose nutrients were calculated by the backend, keeping the
 * TBCA `foodId` on every item so swaps and logs can trace back to the source.
 */
export function mapHydratedPlanToCreateInput(params: {
  userId: string
  planName: string
  plan: HydratedDietPlan
}) {
  const meals = params.plan.meals.map((meal) => ({
    name: meal.name,
    kcalTarget: meal.kcalTarget,
    windowStart: meal.startHour,
    windowEnd: meal.endHour,
    order: meal.order,
    mealItems: meal.items.map((item) => ({
      foodId: item.foodId,
      name: item.name,
      quantity: item.quantityGrams,
      unit: "g" as PortionUnit,
      kcal: item.nutrition.calories,
      protein: item.nutrition.proteinGrams,
      carbs: item.nutrition.carbsGrams,
      fat: item.nutrition.fatGrams,
    })),
  }))

  return {
    userId: params.userId,
    name: params.planName,
    totalKcal: meals.reduce((sum, meal) => sum + meal.kcalTarget, 0),
    meals,
  }
}

export function mapAiPlanToCreateInput(params: {
  userId: string
  planName: string
  mealPresets: MealPreset[]
  aiMeals: Array<{
    name: string
    kcalTarget: number
    items: ParsedFoodItem[]
  }>
}) {
  const meals = params.aiMeals.map((meal, index) => {
    const preset = params.mealPresets[index] ?? {
      name: meal.name,
      windowStart: Math.min(21, 6 + index * 3),
      windowEnd: Math.min(23, 9 + index * 3),
    }
    return {
      name: meal.name || preset.name,
      kcalTarget: meal.kcalTarget,
      windowStart: preset.windowStart,
      windowEnd: preset.windowEnd,
      order: index,
      mealItems: meal.items.map(mapFoodItemToMealItem),
    }
  })

  const totalKcal = meals.reduce((sum, m) => sum + m.kcalTarget, 0)

  return {
    userId: params.userId,
    name: params.planName,
    totalKcal,
    meals,
  }
}
