import { getAIProvider } from "@/lib/ai/factory"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import type { User } from "@/generated/prisma"
import { mapAiPlanToCreateInput, parseUserPreferences } from "./map-ai-plan"

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

  const ai = getAIProvider()
  const aiPlan = await ai.generateDietPlan({
    dailyKcalTarget: user.dailyKcalTarget ?? 2000,
    mealsPerDay: mealPresets.length,
    mealWindows: mealPresets.map((m) => ({
      name: m.name,
      startHour: m.windowStart,
      endHour: m.windowEnd,
    })),
    restrictions: parseRestrictions(user.restrictions),
    preferences: prefs?.foodPreferences ? [prefs.foodPreferences] : [],
  })

  const input = mapAiPlanToCreateInput({
    userId: user.id,
    planName: "Plano alimentar",
    mealPresets,
    aiMeals: aiPlan.meals,
  })

  const repo = new DietPlanRepository()
  return repo.create(input)
}

export async function importDietPlanForUser(user: User, text: string) {
  const mealPresets = getMealPresets(user)
  const ai = getAIProvider()
  const aiPlan = await ai.importDietPlan(text, mealPresets.map((m) => ({
    name: m.name,
    startHour: m.windowStart,
    endHour: m.windowEnd,
  })))

  const input = mapAiPlanToCreateInput({
    userId: user.id,
    planName: "Dieta importada",
    mealPresets,
    aiMeals: aiPlan.meals,
  })

  const repo = new DietPlanRepository()
  return repo.create(input)
}
