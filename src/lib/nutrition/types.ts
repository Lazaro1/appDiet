/** Macronutrient totals for a portion or meal */
export interface NutritionTotals {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fiberGrams: number
}

/** Per-100g values used for deterministic calculation */
export interface FoodNutritionPer100g {
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number | null
}

export type NutritionalRole =
  | "protein"
  | "carbohydrate"
  | "vegetable"
  | "fruit"
  | "fat"
  | "dairy"
  | "beverage"
  | "complement"

export interface MealWindowInput {
  id: string
  name: string
  startHour: number
  endHour: number
}

export interface MealTarget extends MealWindowInput {
  kcalTarget: number
}

export interface FoodSearchResult {
  foodId: string
  name: string
  score: number
  category?: string | null
  nutritionalRole?: string | null
  kcalPer100g: number
  portionDefaultGrams?: number | null
  portionMinGrams?: number | null
  portionMaxGrams?: number | null
  portionStepGrams?: number | null
}
