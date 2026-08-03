import { getAIProvider } from "@/lib/ai/factory"
import type { ParsedFoodItem } from "@/lib/ai/types"
import { resolveParsedMealItems } from "./match-food-from-text"

export async function importDietPlanFromText(params: {
  text: string
  mealWindows: Array<{ name: string; startHour: number; endHour: number }>
  dailyKcalTarget?: number
  mealCountHint?: number
  restrictions?: string | string[] | null
}): Promise<{
  meals: Array<{
    name: string
    kcalTarget: number
    items: ParsedFoodItem[]
  }>
}> {
  const ai = getAIProvider()
  const draft = await ai.extractDietImport(params.text, params.mealWindows, {
    dailyKcalTarget: params.dailyKcalTarget,
    mealCountHint: params.mealCountHint,
  })

  const meals: Array<{
    name: string
    kcalTarget: number
    items: ParsedFoodItem[]
  }> = []

  for (const [index, meal] of draft.meals.entries()) {
    const items = await resolveParsedMealItems(meal.items, {
      restrictions: params.restrictions,
    })
    const kcalFromItems = Math.round(
      items.reduce((sum, item) => sum + item.estimatedKcal, 0),
    )
    const fallbackName =
      params.mealWindows[index]?.name ?? `Refeição ${index + 1}`

    meals.push({
      name: meal.name || fallbackName,
      kcalTarget: Math.max(1, meal.kcalTarget ?? kcalFromItems),
      items,
    })
  }

  return { meals }
}
