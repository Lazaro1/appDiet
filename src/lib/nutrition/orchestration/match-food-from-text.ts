import { prisma } from "@/lib/db/prisma"
import { formatFoodDisplayName } from "../catalog/food-display-name"
import {
  parseRestrictionsText,
  type ParsedRestrictions,
} from "../catalog/restriction-parser"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import { normalizeFoodName } from "../normalize-name"
import { searchFoods } from "../retrieval/search-foods"
import type { ParsedFoodItem, ParsedMealDraftItem } from "@/lib/ai/types"

/** Minimum lexical score to bind a free-text name to a TBCA food. */
export const FOOD_MATCH_SCORE_THRESHOLD = 0.75

export interface FoodMatchResult {
  foodId: string | null
  recipeId: string | null
  displayName: string
  score: number
  source: "tbca" | "recipe" | "unmatched"
}

export interface ResolveParsedItemsOptions {
  restrictions?: ParsedRestrictions | string | string[] | null
}

function tokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalizeFoodName(a).split(/\s+/).filter(Boolean))
  const tokensB = new Set(normalizeFoodName(b).split(/\s+/).filter(Boolean))
  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let shared = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) shared += 1
  }

  return shared / Math.max(tokensA.size, tokensB.size)
}

async function matchRecipeFromText(name: string): Promise<FoodMatchResult | null> {
  const recipes = await prisma.recipe.findMany({ where: { active: true } })
  if (recipes.length === 0) return null

  const normalizedQuery = normalizeFoodName(name)
  let best: { recipe: (typeof recipes)[number]; score: number } | null = null

  for (const recipe of recipes) {
    const candidates = [
      recipe.name,
      recipe.normalizedName ?? "",
      ...recipe.synonyms,
    ].filter(Boolean)

    let score = 0
    for (const candidate of candidates) {
      const normalized = normalizeFoodName(candidate)
      if (normalized === normalizedQuery) score = Math.max(score, 1)
      if (normalizedQuery.includes(normalized) || normalized.includes(normalizedQuery)) {
        score = Math.max(score, 0.9)
      }
      score = Math.max(score, tokenOverlap(name, candidate))
    }

    if (!best || score > best.score) best = { recipe, score }
  }

  if (!best || best.score < FOOD_MATCH_SCORE_THRESHOLD) return null

  return {
    foodId: null,
    recipeId: best.recipe.id,
    displayName: best.recipe.name,
    score: best.score,
    source: "recipe",
  }
}

/** Resolves a free-text food name to TBCA or a curated recipe. */
export async function matchFoodFromText(
  name: string,
  options?: ResolveParsedItemsOptions,
): Promise<FoodMatchResult> {
  const restrictions = parseRestrictionsText(options?.restrictions)
  const results = await searchFoods({
    query: name,
    topK: 5,
    minScore: FOOD_MATCH_SCORE_THRESHOLD,
    restrictions,
  })

  const best = results[0]
  if (best && best.score >= FOOD_MATCH_SCORE_THRESHOLD) {
    const food = await prisma.tBACFood.findUnique({ where: { id: best.foodId } })
    return {
      foodId: best.foodId,
      recipeId: null,
      displayName: formatFoodDisplayName(food?.name ?? best.name, food?.synonyms),
      score: best.score,
      source: "tbca",
    }
  }

  const recipeMatch = await matchRecipeFromText(name)
  if (recipeMatch) return recipeMatch

  return {
    foodId: null,
    recipeId: null,
    displayName: name.trim(),
    score: best?.score ?? 0,
    source: "unmatched",
  }
}

/** Turns LLM draft items into ParsedFoodItem with TBCA-backed nutrients. */
export async function resolveParsedMealItems(
  drafts: ParsedMealDraftItem[],
  options?: ResolveParsedItemsOptions,
): Promise<ParsedFoodItem[]> {
  const items: ParsedFoodItem[] = []

  for (const draft of drafts) {
    const match = await matchFoodFromText(draft.foodName, options)

    if (match.foodId) {
      const food = await prisma.tBACFood.findUnique({ where: { id: match.foodId } })
      if (!food) {
        items.push(unmatchedItem(draft, match))
        continue
      }

      const nutrition = computeFoodNutrition(food, draft.estimatedGrams)
      items.push({
        foodName: match.displayName,
        estimatedGrams: draft.estimatedGrams,
        foodId: food.id,
        recipeId: null,
        matchScore: match.score,
        estimatedKcal: nutrition.calories,
        estimatedProtein: nutrition.proteinGrams,
        estimatedCarbs: nutrition.carbsGrams,
        estimatedFat: nutrition.fatGrams,
      })
      continue
    }

    if (match.recipeId) {
      const recipe = await prisma.recipe.findUnique({ where: { id: match.recipeId } })
      if (!recipe) {
        items.push(unmatchedItem(draft, match))
        continue
      }

      const nutrition = computeFoodNutrition(recipe, draft.estimatedGrams)
      items.push({
        foodName: match.displayName,
        estimatedGrams: draft.estimatedGrams,
        foodId: null,
        recipeId: recipe.id,
        matchScore: match.score,
        estimatedKcal: nutrition.calories,
        estimatedProtein: nutrition.proteinGrams,
        estimatedCarbs: nutrition.carbsGrams,
        estimatedFat: nutrition.fatGrams,
      })
      continue
    }

    items.push(unmatchedItem(draft, match))
  }

  return items
}

function unmatchedItem(
  draft: ParsedMealDraftItem,
  match: FoodMatchResult,
): ParsedFoodItem {
  return {
    foodName: match.displayName,
    estimatedGrams: draft.estimatedGrams,
    foodId: null,
    recipeId: null,
    matchScore: match.score,
    estimatedKcal: 0,
    estimatedProtein: 0,
    estimatedCarbs: 0,
    estimatedFat: 0,
  }
}
