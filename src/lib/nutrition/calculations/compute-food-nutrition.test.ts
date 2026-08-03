import { describe, expect, it } from "vitest"
import {
  addNutritionTotals,
  computeFoodNutrition,
} from "./compute-food-nutrition"

describe("computeFoodNutrition", () => {
  const rice = {
    kcalPer100g: 130,
    proteinPer100g: 2.5,
    carbsPer100g: 28,
    fatPer100g: 0.3,
    fiberPer100g: 0.4,
  }

  const chicken = {
    kcalPer100g: 159,
    proteinPer100g: 32,
    carbsPer100g: 0,
    fatPer100g: 3.2,
    fiberPer100g: 0,
  }

  const egg = {
    kcalPer100g: 143,
    proteinPer100g: 13,
    carbsPer100g: 0.6,
    fatPer100g: 9.5,
    fiberPer100g: 0,
  }

  it("calculates rice portion at 150g", () => {
    const result = computeFoodNutrition(rice, 150)
    expect(result.calories).toBe(195)
    expect(result.proteinGrams).toBe(3.8)
    expect(result.carbsGrams).toBe(42)
  })

  it("calculates chicken breast at 120g", () => {
    const result = computeFoodNutrition(chicken, 120)
    expect(result.calories).toBe(190.8)
    expect(result.proteinGrams).toBe(38.4)
    expect(result.carbsGrams).toBe(0)
  })

  it("sums multiple items correctly", () => {
    const a = computeFoodNutrition(rice, 100)
    const b = computeFoodNutrition(chicken, 100)
    const total = addNutritionTotals(a, b)
    expect(total.calories).toBe(289)
    expect(total.proteinGrams).toBe(34.5)
  })

  it("calculates egg at 50g", () => {
    const result = computeFoodNutrition(egg, 50)
    expect(result.calories).toBe(71.5)
    expect(result.fatGrams).toBe(4.8)
  })
})
