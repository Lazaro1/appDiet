import { describe, expect, it } from "vitest"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import type { HydratedDietPlan } from "../orchestration/hydrate-diet-draft"
import { sumMealNutrition } from "../orchestration/hydrate-diet-draft"
import { validateDietPlan } from "../validation/plan-validator"
import { optimizeDietPlan, type OptimizableFood } from "./optimize-plan"

const chicken = {
  id: "chicken",
  name: "Peito de frango grelhado",
  kcalPer100g: 165,
  proteinPer100g: 31,
  carbsPer100g: 0,
  fatPer100g: 3.6,
  fiberPer100g: 0,
  portionMinGrams: 80,
  portionMaxGrams: 250,
  portionStepGrams: 10,
  portionDefault: 120,
}

const rice = {
  id: "rice",
  name: "Arroz branco cozido",
  kcalPer100g: 130,
  proteinPer100g: 2.5,
  carbsPer100g: 28,
  fatPer100g: 0.3,
  fiberPer100g: 0.4,
  portionMinGrams: 50,
  portionMaxGrams: 300,
  portionStepGrams: 10,
  portionDefault: 150,
}

const catalog = new Map<string, OptimizableFood>([
  ["chicken", chicken],
  ["rice", rice],
])

function buildPlan(
  portions: Array<{ food: typeof chicken; grams: number }>,
  kcalTarget: number,
): HydratedDietPlan {
  const items = portions.map(({ food, grams }) => ({
    foodId: food.id,
    name: food.name,
    quantityGrams: grams,
    nutrition: computeFoodNutrition(food, grams),
  }))
  const nutrition = sumMealNutrition(items)

  return {
    dailyKcalTarget: kcalTarget,
    dailyActual: nutrition,
    meals: [
      {
        id: "meal-0",
        name: "Almoço",
        startHour: 11,
        endHour: 14,
        order: 0,
        kcalTarget,
        kcalActual: nutrition.calories,
        nutrition,
        items,
      },
    ],
  }
}

describe("optimizeDietPlan", () => {
  it("pulls an undershooting meal into the tolerance window", () => {
    const plan = buildPlan(
      [
        { food: chicken, grams: 80 },
        { food: rice, grams: 50 },
      ],
      500,
    )
    expect(validateDietPlan({ plan, foodsById: catalog }).valid).toBe(false)

    const optimized = optimizeDietPlan({ plan, foodsById: catalog })

    expect(Math.abs(optimized.meals[0].kcalActual - 500)).toBeLessThanOrEqual(10)
    expect(validateDietPlan({ plan: optimized, foodsById: catalog }).valid).toBe(true)
  })

  it("pulls an overshooting meal back down", () => {
    const plan = buildPlan(
      [
        { food: chicken, grams: 250 },
        { food: rice, grams: 300 },
      ],
      500,
    )

    const optimized = optimizeDietPlan({ plan, foodsById: catalog })

    expect(Math.abs(optimized.meals[0].kcalActual - 500)).toBeLessThanOrEqual(10)
  })

  it("keeps every portion inside the food limits", () => {
    const plan = buildPlan(
      [
        { food: chicken, grams: 80 },
        { food: rice, grams: 50 },
      ],
      2000,
    )

    const optimized = optimizeDietPlan({ plan, foodsById: catalog })

    for (const item of optimized.meals[0].items) {
      const food = catalog.get(item.foodId)!
      expect(item.quantityGrams).toBeGreaterThanOrEqual(food.portionMinGrams!)
      expect(item.quantityGrams).toBeLessThanOrEqual(food.portionMaxGrams!)
    }
  })

  it("recomputes the daily totals after adjusting portions", () => {
    const plan = buildPlan(
      [
        { food: chicken, grams: 80 },
        { food: rice, grams: 50 },
      ],
      500,
    )

    const optimized = optimizeDietPlan({ plan, foodsById: catalog })

    expect(optimized.dailyActual.calories).toBeCloseTo(
      optimized.meals[0].kcalActual,
      1,
    )
    expect(optimized.dailyActual.calories).toBeGreaterThan(plan.dailyActual.calories)
  })
})
