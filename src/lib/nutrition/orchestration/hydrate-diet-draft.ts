import type { GeneratedDietDraft } from "@/lib/ai/types"
import type { TBACFood } from "@/generated/prisma"
import { formatFoodDisplayName } from "../catalog/food-display-name"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import { sumNutritionTotals } from "../calculations/sum-nutrition"
import type { FoodNutritionPer100g, MealTarget, NutritionTotals } from "../types"

export interface HydrationFood extends FoodNutritionPer100g {
  id: string
  name: string
}

export interface HydratedMealItem {
  foodId: string
  name: string
  quantityGrams: number
  nutrition: NutritionTotals
}

export interface HydratedMeal {
  id: string
  name: string
  startHour: number
  endHour: number
  order: number
  kcalTarget: number
  kcalActual: number
  nutrition: NutritionTotals
  items: HydratedMealItem[]
}

export interface HydratedDietPlan {
  dailyKcalTarget: number
  dailyActual: NutritionTotals
  meals: HydratedMeal[]
}

export class DietPlanHydrationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "DietPlanHydrationError"
  }
}

export function sumMealNutrition(items: HydratedMealItem[]): NutritionTotals {
  return sumNutritionTotals(items.map((item) => item.nutrition))
}

/**
 * Turns the LLM draft into a plan with real nutrients from the catalog.
 * Meal targets stay untouched — only `kcalActual` comes from the items.
 */
export function hydrateDietDraft(params: {
  draft: GeneratedDietDraft
  mealTargets: MealTarget[]
  foodsById: Map<string, TBACFood>
}): HydratedDietPlan {
  if (params.draft.status !== "ok" || !params.draft.meals) {
    throw new DietPlanHydrationError(
      params.draft.reason ?? "Rascunho de plano inviável",
    )
  }

  const draftByMealId = new Map(
    params.draft.meals.map((meal) => [meal.mealId, meal]),
  )

  const meals: HydratedMeal[] = params.mealTargets.map((target, index) => {
    const draftMeal = draftByMealId.get(target.id)

    const items: HydratedMealItem[] = (draftMeal?.items ?? []).map((item) => {
      const food = params.foodsById.get(item.foodId)

      if (!food) {
        throw new DietPlanHydrationError(
          `Alimento fora do catálogo: ${item.foodId}`,
        )
      }

      return {
        foodId: food.id,
        name: formatFoodDisplayName(food.name, food.synonyms),
        quantityGrams: item.quantityGrams,
        nutrition: computeFoodNutrition(food, item.quantityGrams),
      }
    })

    const nutrition = sumMealNutrition(items)

    return {
      id: target.id,
      name: target.name,
      startHour: target.startHour,
      endHour: target.endHour,
      order: index,
      kcalTarget: target.kcalTarget,
      kcalActual: nutrition.calories,
      nutrition,
      items,
    }
  })

  return {
    dailyKcalTarget: params.mealTargets.reduce(
      (sum, meal) => sum + meal.kcalTarget,
      0,
    ),
    dailyActual: sumNutritionTotals(meals.map((meal) => meal.nutrition)),
    meals,
  }
}
