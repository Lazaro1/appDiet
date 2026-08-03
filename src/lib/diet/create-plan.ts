import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { importDietPlanFromText } from "@/lib/nutrition/orchestration/import-diet-plan"
import { generateDietPlan } from "@/lib/nutrition/orchestration/generate-diet-plan"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import type { User } from "@/generated/prisma"
import { detectMealCountInText, resolveMealPresetsForImport } from "./import-helpers"
import {
  mapAiPlanToCreateInput,
  mapHydratedPlanToCreateInput,
  parseUserPreferences,
} from "./map-ai-plan"

function getMealPresets(user: User) {
  const prefs = parseUserPreferences(user.preferences)
  if (prefs?.meals?.length) return prefs.meals
  const count = prefs?.mealsPerDay ?? 4
  return MEAL_PRESETS[count] ?? MEAL_PRESETS[4]
}

function parseRestrictions(restrictions?: string | null): string[] {
  if (!restrictions?.trim()) return []
  return restrictions.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean)
}

export async function generateDietPlanForUser(user: User) {
  const mealPresets = getMealPresets(user)
  const prefs = parseUserPreferences(user.preferences)

  const { plan } = await generateDietPlan({
    dailyKcalTarget: user.dailyKcalTarget ?? 2000,
    mealWindows: mealPresets.map((preset, index) => ({
      id: `meal-${index}`,
      name: preset.name,
      startHour: preset.windowStart,
      endHour: preset.windowEnd,
    })),
    restrictions: parseRestrictions(user.restrictions),
    preferences: prefs?.foodPreferences ? [prefs.foodPreferences] : [],
    goal: user.goal,
  })

  const input = mapHydratedPlanToCreateInput({
    userId: user.id,
    planName: "Plano alimentar",
    plan,
  })

  const repo = new DietPlanRepository()
  return repo.create(input)
}

export async function importDietPlanForUser(user: User, text: string) {
  const basePresets = getMealPresets(user)
  const mealPresets = resolveMealPresetsForImport(basePresets, text)
  const detectedMealCount = detectMealCountInText(text)

  const aiPlan = await importDietPlanFromText({
    text,
    mealWindows: mealPresets.map((m) => ({
      name: m.name,
      startHour: m.windowStart,
      endHour: m.windowEnd,
    })),
    dailyKcalTarget: user.dailyKcalTarget ?? undefined,
    mealCountHint: detectedMealCount > 0 ? detectedMealCount : undefined,
    restrictions: user.restrictions,
  })

  const input = mapAiPlanToCreateInput({
    userId: user.id,
    planName: "Dieta importada",
    mealPresets,
    aiMeals: aiPlan.meals,
  })

  const repo = new DietPlanRepository()
  return repo.create(input)
}
