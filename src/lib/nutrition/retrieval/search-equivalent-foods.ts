import { prisma } from "@/lib/db/prisma"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import { formatFoodDisplayName } from "../catalog/food-display-name"
import {
  parseRestrictionsText,
  type ParsedRestrictions,
} from "../catalog/restriction-parser"
import { normalizeFoodName } from "../normalize-name"
import { searchFoods } from "./search-foods"
import type { FoodSearchResult } from "../types"

export const EQUIVALENT_KCAL_TOLERANCE = 0.15

export interface EquivalentFoodOption {
  foodId: string
  name: string
  grams: number
  kcal: number
  protein: number
  score: number
  nutritionalRole?: string | null
}

export interface SearchEquivalentFoodsParams {
  itemName: string
  itemKcal: number
  itemProtein?: number
  availableFoodsText?: string
  restrictions?: ParsedRestrictions | string | string[] | null
  limit?: number
}

function parseAvailableFoodTerms(text?: string): string[] {
  if (!text?.trim()) return []
  return text
    .split(/[,;\n]/)
    .map((term) => normalizeFoodName(term))
    .filter(Boolean)
}

function matchesAvailableFood(
  foodName: string,
  availableTerms: string[],
): boolean {
  if (availableTerms.length === 0) return true
  const normalized = normalizeFoodName(foodName)
  return availableTerms.some(
    (term) => normalized.includes(term) || term.includes(normalized),
  )
}

function gramsForTargetKcal(food: FoodSearchResult, targetKcal: number): number {
  if (food.kcalPer100g <= 0) return food.portionDefaultGrams ?? 100
  const raw = (targetKcal / food.kcalPer100g) * 100
  const step = food.portionStepGrams ?? 5
  const min = food.portionMinGrams ?? 20
  const max = food.portionMaxGrams ?? 400
  const stepped = Math.round(raw / step) * step
  return Math.min(max, Math.max(min, stepped))
}

/** Finds catalog foods with similar kcal per portion, optionally filtered by pantry text. */
export async function searchEquivalentFoods(
  params: SearchEquivalentFoodsParams,
): Promise<EquivalentFoodOption[]> {
  const restrictions = parseRestrictionsText(params.restrictions)
  const availableTerms = parseAvailableFoodTerms(params.availableFoodsText)
  const limit = params.limit ?? 3
  const targetKcal = Math.max(1, params.itemKcal)

  const candidates = await searchFoods({
    query: params.itemName,
    topK: 20,
    minScore: 0.35,
    restrictions,
  })

  const options: EquivalentFoodOption[] = []

  for (const candidate of candidates) {
    const food = await prisma.tBACFood.findUnique({
      where: { id: candidate.foodId },
    })
    if (!food) continue

    const displayName = formatFoodDisplayName(food.name, food.synonyms)
    if (!matchesAvailableFood(displayName, availableTerms)) continue

    const grams = gramsForTargetKcal(candidate, targetKcal)
    const nutrition = computeFoodNutrition(food, grams)
    const deviation = Math.abs(nutrition.calories - targetKcal) / targetKcal

    if (deviation > EQUIVALENT_KCAL_TOLERANCE) continue
    if (params.itemProtein && params.itemProtein > 0) {
      const proteinDeviation =
        Math.abs(nutrition.proteinGrams - params.itemProtein) / params.itemProtein
      if (proteinDeviation > 0.35) continue
    }

    options.push({
      foodId: food.id,
      name: displayName,
      grams,
      kcal: nutrition.calories,
      protein: nutrition.proteinGrams,
      score: candidate.score,
      nutritionalRole: food.nutritionalRole,
    })
  }

  return options
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
