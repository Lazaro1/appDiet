import { describe, expect, it } from "vitest"
import type { GeneratedDietDraft } from "@/lib/ai/types"
import type { TBACFood } from "@/generated/prisma"
import type { MealTarget } from "../types"
import { DietPlanHydrationError, hydrateDietDraft } from "./hydrate-diet-draft"

function food(
  id: string,
  name: string,
  nutrition: {
    kcalPer100g: number
    proteinPer100g: number
    carbsPer100g: number
    fatPer100g: number
    fiberPer100g?: number
  },
  synonyms: string[] = [],
): TBACFood {
  return {
    id,
    name,
    synonyms,
    externalCode: id,
    normalizedName: name,
    category: null,
    nutritionalRole: "protein",
    preparationMethod: null,
    kcalPer100g: nutrition.kcalPer100g,
    proteinPer100g: nutrition.proteinPer100g,
    carbsPer100g: nutrition.carbsPer100g,
    fatPer100g: nutrition.fatPer100g,
    fiberPer100g: nutrition.fiberPer100g ?? 0,
    portionDefault: 120,
    portionMinGrams: 80,
    portionMaxGrams: 250,
    portionStepGrams: 10,
    portionUnit: "g",
    containsGluten: false,
    containsLactose: false,
    containsAnimal: true,
    active: true,
  } as TBACFood
}

const foodsById = new Map<string, TBACFood>([
  [
    "chicken",
    food(
      "chicken",
      "Frango, peito, sem pele, grelhado",
      {
        kcalPer100g: 165,
        proteinPer100g: 31,
        carbsPer100g: 0,
        fatPer100g: 3.6,
      },
      ["frango grelhado", "peito de frango"],
    ),
  ],
  [
    "rice",
    food("rice", "Arroz, branco, cozido", {
      kcalPer100g: 130,
      proteinPer100g: 2.5,
      carbsPer100g: 28,
      fatPer100g: 0.3,
      fiberPer100g: 0.4,
    }),
  ],
])

const mealTargets: MealTarget[] = [
  { id: "meal-0", name: "Almoço", startHour: 11, endHour: 14, kcalTarget: 600 },
  { id: "meal-1", name: "Jantar", startHour: 18, endHour: 21, kcalTarget: 400 },
]

describe("hydrateDietDraft", () => {
  it("calculates nutrients from the catalog instead of trusting the LLM", () => {
    const draft: GeneratedDietDraft = {
      status: "ok",
      meals: [
        {
          mealId: "meal-0",
          items: [
            { foodId: "chicken", quantityGrams: 200 },
            { foodId: "rice", quantityGrams: 200 },
          ],
        },
        { mealId: "meal-1", items: [{ foodId: "chicken", quantityGrams: 100 }] },
      ],
    }

    const plan = hydrateDietDraft({ draft, mealTargets, foodsById })

    expect(plan.meals[0].kcalActual).toBe(590)
    expect(plan.meals[0].nutrition.proteinGrams).toBe(67)
    expect(plan.meals[1].kcalActual).toBe(165)
    expect(plan.dailyKcalTarget).toBe(1000)
    expect(plan.dailyActual.calories).toBe(755)
  })

  it("uses a short display name from synonyms", () => {
    const draft: GeneratedDietDraft = {
      status: "ok",
      meals: [
        {
          mealId: "meal-0",
          items: [{ foodId: "chicken", quantityGrams: 100 }],
        },
      ],
    }

    const plan = hydrateDietDraft({
      draft,
      mealTargets: [mealTargets[0]],
      foodsById,
    })

    expect(plan.meals[0].items[0].name).toBe("Frango grelhado")
  })

  it("keeps meal order and window from the backend targets", () => {
    const draft: GeneratedDietDraft = {
      status: "ok",
      meals: [
        { mealId: "meal-1", items: [{ foodId: "rice", quantityGrams: 100 }] },
        { mealId: "meal-0", items: [{ foodId: "rice", quantityGrams: 100 }] },
      ],
    }

    const plan = hydrateDietDraft({ draft, mealTargets, foodsById })

    expect(plan.meals.map((meal) => meal.id)).toEqual(["meal-0", "meal-1"])
    expect(plan.meals[0].order).toBe(0)
    expect(plan.meals[0].startHour).toBe(11)
    expect(plan.meals[0].kcalTarget).toBe(600)
  })

  it("rejects a draft that references a food outside the catalog", () => {
    const draft: GeneratedDietDraft = {
      status: "ok",
      meals: [{ mealId: "meal-0", items: [{ foodId: "ghost", quantityGrams: 100 }] }],
    }

    expect(() => hydrateDietDraft({ draft, mealTargets, foodsById })).toThrow(
      DietPlanHydrationError,
    )
  })

  it("rejects an unfeasible draft", () => {
    const draft: GeneratedDietDraft = {
      status: "unfeasible",
      reason: "Sem alimentos compatíveis",
    }

    expect(() => hydrateDietDraft({ draft, mealTargets, foodsById })).toThrow(
      "Sem alimentos compatíveis",
    )
  })
})
