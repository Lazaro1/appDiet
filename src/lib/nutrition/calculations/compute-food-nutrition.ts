import type { FoodNutritionPer100g, NutritionTotals } from "../types"

export function emptyNutritionTotals(): NutritionTotals {
  return {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    fiberGrams: 0,
  }
}

export function computeFoodNutrition(
  food: FoodNutritionPer100g,
  grams: number,
): NutritionTotals {
  const factor = grams / 100

  return {
    calories: round1(food.kcalPer100g * factor),
    proteinGrams: round1(food.proteinPer100g * factor),
    carbsGrams: round1(food.carbsPer100g * factor),
    fatGrams: round1(food.fatPer100g * factor),
    fiberGrams: round1((food.fiberPer100g ?? 0) * factor),
  }
}

export function addNutritionTotals(
  a: NutritionTotals,
  b: NutritionTotals,
): NutritionTotals {
  return {
    calories: round1(a.calories + b.calories),
    proteinGrams: round1(a.proteinGrams + b.proteinGrams),
    carbsGrams: round1(a.carbsGrams + b.carbsGrams),
    fatGrams: round1(a.fatGrams + b.fatGrams),
    fiberGrams: round1(a.fiberGrams + b.fiberGrams),
  }
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}
