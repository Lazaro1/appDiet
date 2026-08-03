import { describe, expect, it } from "vitest"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import { parseRestrictionsText } from "../catalog/restriction-parser"
import type {
  HydratedDietPlan,
  HydratedMealItem,
} from "../orchestration/hydrate-diet-draft"
import { sumMealNutrition } from "../orchestration/hydrate-diet-draft"
import { validateDietPlan, type ValidationFood } from "./plan-validator"

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
  containsLactose: false,
  containsGluten: false,
  containsAnimal: true,
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
  containsLactose: false,
  containsGluten: false,
  containsAnimal: false,
}

const cheese = {
  id: "cheese",
  name: "Queijo muçarela",
  kcalPer100g: 300,
  proteinPer100g: 22,
  carbsPer100g: 2,
  fatPer100g: 23,
  fiberPer100g: 0,
  portionMinGrams: 20,
  portionMaxGrams: 100,
  portionStepGrams: 10,
  portionDefault: 30,
  containsLactose: true,
  containsGluten: false,
  containsAnimal: true,
}

const catalog = new Map<string, ValidationFood>([
  ["chicken", chicken],
  ["rice", rice],
  ["cheese", cheese],
])

type FoodFixture = typeof chicken

function item(food: FoodFixture, grams: number): HydratedMealItem {
  return {
    foodId: food.id,
    name: food.name,
    quantityGrams: grams,
    nutrition: computeFoodNutrition(food, grams),
  }
}

function planWith(items: HydratedMealItem[], kcalTarget: number): HydratedDietPlan {
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

describe("validateDietPlan", () => {
  it("accepts a plan inside the calorie tolerance", () => {
    // 150g frango (247.5) + 200g arroz (260) = 507.5 kcal
    const plan = planWith([item(chicken, 150), item(rice, 200)], 500)

    const result = validateDietPlan({ plan, foodsById: catalog })

    expect(result.valid).toBe(true)
    expect(result.issues).toEqual([])
  })

  it("flags a meal above the ±10% window", () => {
    const plan = planWith([item(chicken, 250), item(rice, 300)], 500)

    const result = validateDietPlan({ plan, foodsById: catalog })

    expect(result.valid).toBe(false)
    expect(result.issues.map((issue) => issue.code)).toContain(
      "MEAL_CALORIES_OUT_OF_RANGE",
    )
    expect(
      result.issues.find(
        (issue) => issue.code === "MEAL_CALORIES_OUT_OF_RANGE",
      )?.repairableLocally,
    ).toBe(true)
  })

  it("flags an unknown foodId as non-repairable", () => {
    const plan = planWith(
      [
        item(chicken, 150),
        {
          foodId: "ghost",
          name: "Alimento inventado",
          quantityGrams: 100,
          nutrition: computeFoodNutrition(rice, 100),
        },
      ],
      500,
    )

    const result = validateDietPlan({ plan, foodsById: catalog })
    const issue = result.issues.find((i) => i.code === "UNKNOWN_FOOD")

    expect(issue).toBeDefined()
    expect(issue?.repairableLocally).toBe(false)
  })

  it("flags a lactose violation when the user is lactose free", () => {
    const plan = planWith([item(cheese, 100), item(rice, 300)], 690)

    const result = validateDietPlan({
      plan,
      foodsById: catalog,
      restrictions: parseRestrictionsText("sem lactose"),
    })

    const issue = result.issues.find((i) => i.code === "FORBIDDEN_FOOD")

    expect(issue).toBeDefined()
    expect(issue?.category).toBe("RESTRICTION")
    expect(issue?.repairableLocally).toBe(false)
  })

  it("flags portions outside the food range", () => {
    const plan = planWith([item(chicken, 400), item(rice, 20)], 690)

    const result = validateDietPlan({ plan, foodsById: catalog })
    const portionIssues = result.issues.filter((i) => i.code === "INVALID_PORTION")

    expect(portionIssues).toHaveLength(2)
  })

  it("flags daily calories outside ±5%", () => {
    const plan = planWith([item(chicken, 150), item(rice, 200)], 500)
    plan.dailyKcalTarget = 800

    const result = validateDietPlan({ plan, foodsById: catalog })

    expect(result.issues.map((i) => i.code)).toContain(
      "DAILY_CALORIES_OUT_OF_RANGE",
    )
  })

  it("allows the same foodId in up to two meals", () => {
    const plan: HydratedDietPlan = {
      dailyKcalTarget: 1000,
      dailyActual: sumMealNutrition([item(chicken, 150), item(rice, 200), item(chicken, 100)]),
      meals: [
        {
          id: "meal-0",
          name: "Almoço",
          startHour: 11,
          endHour: 14,
          order: 0,
          kcalTarget: 600,
          kcalActual: 590,
          nutrition: sumMealNutrition([item(chicken, 150), item(rice, 200)]),
          items: [item(chicken, 150), item(rice, 200)],
        },
        {
          id: "meal-1",
          name: "Jantar",
          startHour: 18,
          endHour: 21,
          order: 1,
          kcalTarget: 400,
          kcalActual: 165,
          nutrition: sumMealNutrition([item(chicken, 100)]),
          items: [item(chicken, 100)],
        },
      ],
    }

    const result = validateDietPlan({ plan, foodsById: catalog })

    expect(result.issues.find((i) => i.code === "DUPLICATE_FOOD")).toBeUndefined()
  })

  it("flags the same foodId used in three or more meals", () => {
    const breakfast = item(chicken, 100)
    const plan: HydratedDietPlan = {
      dailyKcalTarget: 1500,
      dailyActual: sumMealNutrition([breakfast, breakfast, breakfast]),
      meals: [
        {
          id: "meal-0",
          name: "Café",
          startHour: 6,
          endHour: 9,
          order: 0,
          kcalTarget: 500,
          kcalActual: 165,
          nutrition: sumMealNutrition([breakfast]),
          items: [breakfast],
        },
        {
          id: "meal-1",
          name: "Almoço",
          startHour: 11,
          endHour: 14,
          order: 1,
          kcalTarget: 500,
          kcalActual: 165,
          nutrition: sumMealNutrition([breakfast]),
          items: [breakfast],
        },
        {
          id: "meal-2",
          name: "Jantar",
          startHour: 18,
          endHour: 21,
          order: 2,
          kcalTarget: 500,
          kcalActual: 165,
          nutrition: sumMealNutrition([breakfast]),
          items: [breakfast],
        },
      ],
    }

    const issue = validateDietPlan({ plan, foodsById: catalog }).issues.find(
      (i) => i.code === "DUPLICATE_FOOD",
    )

    expect(issue).toBeDefined()
    expect(issue?.repairableLocally).toBe(false)
  })
})
