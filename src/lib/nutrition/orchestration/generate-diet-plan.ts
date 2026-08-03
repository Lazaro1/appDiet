import { getAIProvider } from "@/lib/ai/factory"
import type {
  DietCatalogFood,
  DietGenerationContext,
  GeneratedDietDraft,
} from "@/lib/ai/types"
import type { Goal, TBACFood } from "@/generated/prisma"
import { distributeMealCalories } from "../calculations/distribute-meal-targets"
import { buildCandidateCatalog } from "../catalog/candidate-builder"
import { formatFoodDisplayName } from "../catalog/food-display-name"
import { parseRestrictionsText } from "../catalog/restriction-parser"
import { calculateMacros } from "../macros"
import { optimizeDietPlan } from "../optimization/optimize-plan"
import type { MealWindowInput } from "../types"
import {
  isLocallyRepairable,
  validateDietPlan,
  type DietValidationIssue,
} from "../validation/plan-validator"
import { resolvePortionConstraints } from "../validation/portion-validator"
import {
  DietPlanGenerationError,
  DietPlanUnfeasibleError,
  EmptyFoodCatalogError,
} from "./errors"
import {
  DietPlanHydrationError,
  hydrateDietDraft,
  type HydratedDietPlan,
} from "./hydrate-diet-draft"

const MAX_ATTEMPTS = 3

export interface GenerateDietPlanParams {
  dailyKcalTarget: number
  mealWindows: MealWindowInput[]
  restrictions?: string | string[] | null
  preferences?: string[]
  goal?: Goal | null
}

export interface GenerateDietPlanResult {
  plan: HydratedDietPlan
  attempts: number
  /** Issues left after the last attempt — empty when fully valid. */
  issues: DietValidationIssue[]
}

function toCatalogFood(food: TBACFood): DietCatalogFood {
  const constraints = resolvePortionConstraints(food)

  return {
    foodId: food.id,
    displayName: formatFoodDisplayName(food.name, food.synonyms),
    nutritionalRole: food.nutritionalRole,
    kcalPer100g: Math.round(food.kcalPer100g),
    proteinPer100g: Math.round(food.proteinPer100g * 10) / 10,
    portionDefaultGrams: constraints.defaultGrams,
    portionMinGrams: constraints.minGrams,
    portionMaxGrams: constraints.maxGrams,
    portionStepGrams: constraints.stepGrams,
  }
}

/**
 * Full generation pipeline: backend sets the targets, the LLM only picks
 * foods and grams from a closed catalog, the backend computes the nutrients,
 * validates the result and fixes portions locally before retrying the LLM.
 */
export async function generateDietPlan(
  params: GenerateDietPlanParams,
): Promise<GenerateDietPlanResult> {
  const mealTargets = distributeMealCalories(
    params.dailyKcalTarget,
    params.mealWindows,
  )
  const restrictions = parseRestrictionsText(params.restrictions)

  const { foodsById, candidatesByMeal } = await buildCandidateCatalog({
    mealTargets,
    restrictions,
  })

  if (foodsById.size === 0) {
    throw new EmptyFoodCatalogError()
  }

  const macros = params.goal
    ? calculateMacros(params.dailyKcalTarget, params.goal)
    : null

  const context: DietGenerationContext = {
    dailyKcalTarget: params.dailyKcalTarget,
    macroTargets: macros
      ? {
          proteinGrams: macros.protein,
          carbsGrams: macros.carbs,
          fatGrams: macros.fat,
        }
      : undefined,
    restrictions: restrictions.rawTerms,
    preferences: params.preferences ?? [],
    meals: mealTargets.map((target) => {
      const entry = candidatesByMeal.find((meal) => meal.mealId === target.id)
      return {
        mealId: target.id,
        mealName: target.name,
        kcalTarget: target.kcalTarget,
        startHour: target.startHour,
        endHour: target.endHour,
        candidates: (entry?.candidates ?? []).map(toCatalogFood),
      }
    }),
  }

  const ai = getAIProvider()
  let previousDraft: GeneratedDietDraft | undefined
  let lastIssues: DietValidationIssue[] = []

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const draft = await ai.generateDietDraft({
      context,
      attempt,
      previousDraft,
      issues: lastIssues.length > 0 ? lastIssues : undefined,
    })

    if (draft.status === "unfeasible") {
      lastIssues = [
        {
          code: "EMPTY_MEAL",
          category: "STRUCTURAL",
          message:
            draft.reason ??
            "A IA considerou o plano inviável com o catálogo atual.",
          repairableLocally: false,
        },
      ]
      if (attempt < MAX_ATTEMPTS) continue
      throw new DietPlanUnfeasibleError(
        draft.reason ?? "Não foi possível montar um plano com essas restrições.",
      )
    }

    previousDraft = draft

    let plan: HydratedDietPlan
    try {
      plan = hydrateDietDraft({ draft, mealTargets, foodsById })
    } catch (err) {
      if (!(err instanceof DietPlanHydrationError)) throw err
      lastIssues = [
        {
          code: "UNKNOWN_FOOD",
          category: "STRUCTURAL",
          message: err.message,
          repairableLocally: false,
        },
      ]
      continue
    }

    let result = validateDietPlan({ plan, foodsById, restrictions })
    if (result.valid) return { plan, attempts: attempt, issues: [] }

    if (isLocallyRepairable(result.issues)) {
      plan = optimizeDietPlan({ plan, foodsById })
      result = validateDietPlan({ plan, foodsById, restrictions })
      if (result.valid) return { plan, attempts: attempt, issues: [] }
    }

    lastIssues = result.issues
  }

  throw new DietPlanGenerationError(
    "Não conseguimos montar um plano dentro das metas. Tente novamente.",
    lastIssues,
  )
}
