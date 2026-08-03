import type { ParsedRestrictions } from "../catalog/restriction-parser"
import type { HydratedDietPlan, HydratedMeal } from "../orchestration/hydrate-diet-draft"
import { checkPortion, resolvePortionConstraints, type PortionSource } from "./portion-validator"

/** Daily calories must stay within ±5% of the target. */
export const DAILY_KCAL_TOLERANCE = 0.05
/** Each meal must stay within ±10% of its target. */
export const MEAL_KCAL_TOLERANCE = 0.1

export type DietValidationIssueCode =
  | "DAILY_CALORIES_OUT_OF_RANGE"
  | "MEAL_CALORIES_OUT_OF_RANGE"
  | "EMPTY_MEAL"
  | "UNKNOWN_FOOD"
  | "INVALID_PORTION"
  | "FORBIDDEN_FOOD"
  | "DUPLICATE_FOOD"

export type DietValidationCategory =
  | "STRUCTURAL"
  | "NUTRITIONAL"
  | "RESTRICTION"

export interface DietValidationIssue {
  code: DietValidationIssueCode
  category: DietValidationCategory
  message: string
  path?: string
  expected?: string
  received?: string
  /** True when the portion optimizer can plausibly fix it without the LLM. */
  repairableLocally: boolean
}

export interface ValidationFood extends PortionSource {
  id: string
  name: string
  containsLactose?: boolean | null
  containsGluten?: boolean | null
  containsAnimal?: boolean | null
}

export interface ValidateDietPlanParams {
  plan: HydratedDietPlan
  foodsById: Map<string, ValidationFood>
  restrictions?: ParsedRestrictions
}

export interface DietValidationResult {
  valid: boolean
  issues: DietValidationIssue[]
}

function deviationRatio(actual: number, target: number): number {
  if (target <= 0) return 0
  return Math.abs(actual - target) / target
}

function validateMealCalories(meal: HydratedMeal): DietValidationIssue[] {
  if (meal.items.length === 0) {
    return [
      {
        code: "EMPTY_MEAL",
        category: "STRUCTURAL",
        message: `A refeição "${meal.name}" ficou sem alimentos.`,
        path: meal.name,
        repairableLocally: false,
      },
    ]
  }

  if (deviationRatio(meal.kcalActual, meal.kcalTarget) <= MEAL_KCAL_TOLERANCE) {
    return []
  }

  return [
    {
      code: "MEAL_CALORIES_OUT_OF_RANGE",
      category: "NUTRITIONAL",
      message: `A refeição "${meal.name}" tem ${Math.round(meal.kcalActual)} kcal, fora da faixa de ±10% da meta de ${meal.kcalTarget} kcal.`,
      path: meal.name,
      expected: `${meal.kcalTarget} kcal ±10%`,
      received: `${Math.round(meal.kcalActual)} kcal`,
      repairableLocally: true,
    },
  ]
}

function validateRestrictions(
  food: ValidationFood,
  restrictions: ParsedRestrictions,
  path: string,
): DietValidationIssue[] {
  const violations: string[] = []

  if (restrictions.excludeLactose && food.containsLactose) violations.push("lactose")
  if (restrictions.excludeGluten && food.containsGluten) violations.push("glúten")

  const noAnimal =
    restrictions.vegan || restrictions.vegetarian || restrictions.pescatarian
  if (noAnimal && food.containsAnimal) violations.push("origem animal")

  if (violations.length === 0) return []

  return [
    {
      code: "FORBIDDEN_FOOD",
      category: "RESTRICTION",
      message: `"${food.name}" viola a restrição: ${violations.join(", ")}.`,
      path,
      repairableLocally: false,
    },
  ]
}

/** Max times the same food may appear across different meals in one day. */
export const MAX_MEAL_USES_PER_FOOD = 2

function validateNoDuplicateFoods(plan: HydratedDietPlan): DietValidationIssue[] {
  const usesByFoodId = new Map<string, { count: number; name: string; meals: string[] }>()
  const issues: DietValidationIssue[] = []

  for (const meal of plan.meals) {
    for (const item of meal.items) {
      const entry = usesByFoodId.get(item.foodId) ?? {
        count: 0,
        name: item.name,
        meals: [],
      }
      entry.count += 1
      entry.meals.push(meal.name)
      usesByFoodId.set(item.foodId, entry)
    }
  }

  for (const [foodId, entry] of usesByFoodId) {
    const uniqueMeals = new Set(entry.meals)
    if (uniqueMeals.size <= MAX_MEAL_USES_PER_FOOD) continue

    issues.push({
      code: "DUPLICATE_FOOD",
      category: "STRUCTURAL",
      message: `"${entry.name}" aparece em ${uniqueMeals.size} refeições (${entry.meals.join(", ")}); máximo ${MAX_MEAL_USES_PER_FOOD}.`,
      path: foodId,
      repairableLocally: false,
    })
  }

  return issues
}

/**
 * Checks a hydrated plan against calorie targets, portion limits and
 * dietary restrictions. Issues flagged as `repairableLocally` can be handled
 * by the portion optimizer; the rest require a new LLM attempt.
 */
export function validateDietPlan(
  params: ValidateDietPlanParams,
): DietValidationResult {
  const issues: DietValidationIssue[] = []
  const { plan, foodsById, restrictions } = params

  issues.push(...validateNoDuplicateFoods(plan))

  for (const meal of plan.meals) {
    issues.push(...validateMealCalories(meal))

    for (const item of meal.items) {
      const path = `${meal.name} > ${item.name}`
      const food = foodsById.get(item.foodId)

      if (!food) {
        issues.push({
          code: "UNKNOWN_FOOD",
          category: "STRUCTURAL",
          message: `Alimento "${item.foodId}" não está no catálogo.`,
          path,
          repairableLocally: false,
        })
        continue
      }

      const constraints = resolvePortionConstraints(food)
      const portionProblem = checkPortion(item.quantityGrams, constraints)

      if (portionProblem) {
        issues.push({
          code: "INVALID_PORTION",
          category: "STRUCTURAL",
          message: `Porção de "${item.name}" (${item.quantityGrams}g) fora do permitido.`,
          path,
          expected: `${constraints.minGrams}-${constraints.maxGrams}g em passos de ${constraints.stepGrams}g`,
          received: `${item.quantityGrams}g`,
          repairableLocally: true,
        })
      }

      if (restrictions) {
        issues.push(...validateRestrictions(food, restrictions, path))
      }
    }
  }

  const dailyActual = plan.dailyActual.calories
  if (deviationRatio(dailyActual, plan.dailyKcalTarget) > DAILY_KCAL_TOLERANCE) {
    issues.push({
      code: "DAILY_CALORIES_OUT_OF_RANGE",
      category: "NUTRITIONAL",
      message: `O plano soma ${Math.round(dailyActual)} kcal, fora da faixa de ±5% da meta de ${plan.dailyKcalTarget} kcal.`,
      expected: `${plan.dailyKcalTarget} kcal ±5%`,
      received: `${Math.round(dailyActual)} kcal`,
      repairableLocally: true,
    })
  }

  return { valid: issues.length === 0, issues }
}

export function isLocallyRepairable(issues: DietValidationIssue[]): boolean {
  return issues.length > 0 && issues.every((issue) => issue.repairableLocally)
}
