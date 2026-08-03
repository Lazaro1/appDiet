import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import { sumNutritionTotals } from "../calculations/sum-nutrition"
import type {
  HydratedDietPlan,
  HydratedMeal,
  HydrationFood,
} from "../orchestration/hydrate-diet-draft"
import { sumMealNutrition } from "../orchestration/hydrate-diet-draft"
import type { PortionSource } from "../validation/portion-validator"
import { generatePortionOptions } from "./portion-options"

export type OptimizableFood = HydrationFood & PortionSource

const MAX_PASSES = 6

function mealDeviation(meal: HydratedMeal): number {
  return Math.abs(meal.kcalActual - meal.kcalTarget)
}

/**
 * Coordinate descent over portion sizes: on each pass, apply the single item
 * resize that most reduces the meal's calorie gap. Stops when no move helps.
 */
function optimizeMeal(
  meal: HydratedMeal,
  foodsById: Map<string, OptimizableFood>,
  optionsCache: Map<string, number[]>,
): HydratedMeal {
  let current = meal

  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    let bestDeviation = mealDeviation(current)
    let bestItemIndex = -1
    let bestGrams = 0

    for (const [index, item] of current.items.entries()) {
      const food = foodsById.get(item.foodId)
      if (!food) continue

      let options = optionsCache.get(item.foodId)
      if (!options) {
        options = generatePortionOptions(food)
        optionsCache.set(item.foodId, options)
      }

      const othersKcal = current.kcalActual - item.nutrition.calories

      for (const grams of options) {
        if (grams === item.quantityGrams) continue

        const candidateKcal =
          othersKcal + computeFoodNutrition(food, grams).calories
        const deviation = Math.abs(candidateKcal - current.kcalTarget)

        if (deviation < bestDeviation - 0.01) {
          bestDeviation = deviation
          bestItemIndex = index
          bestGrams = grams
        }
      }
    }

    if (bestItemIndex === -1) break

    const food = foodsById.get(current.items[bestItemIndex].foodId)!
    const items = current.items.map((item, index) =>
      index === bestItemIndex
        ? {
            ...item,
            quantityGrams: bestGrams,
            nutrition: computeFoodNutrition(food, bestGrams),
          }
        : item,
    )

    const nutrition = sumMealNutrition(items)
    current = { ...current, items, nutrition, kcalActual: nutrition.calories }
  }

  return current
}

/**
 * Adjusts portions to pull each meal toward its calorie target without
 * calling the LLM again. Food choices are never changed.
 */
export function optimizeDietPlan(params: {
  plan: HydratedDietPlan
  foodsById: Map<string, OptimizableFood>
}): HydratedDietPlan {
  const optionsCache = new Map<string, number[]>()

  const meals = params.plan.meals.map((meal) =>
    meal.items.length === 0
      ? meal
      : optimizeMeal(meal, params.foodsById, optionsCache),
  )

  return {
    ...params.plan,
    meals,
    dailyActual: sumNutritionTotals(meals.map((meal) => meal.nutrition)),
  }
}
