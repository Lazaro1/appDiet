import { getAIProvider } from "@/lib/ai/factory"
import type { ParsedFoodItem } from "@/lib/ai/types"
import { resolveParsedMealItems } from "./match-food-from-text"
import type { ParsedRestrictions } from "../catalog/restriction-parser"

export async function parseMealText(
  text: string,
  context?: {
    mealName?: string
    kcalTarget?: number
    restrictions?: ParsedRestrictions | string | string[] | null
  },
): Promise<ParsedFoodItem[]> {
  const ai = getAIProvider()
  const drafts = await ai.extractMealItems(text, {
    mealName: context?.mealName,
    kcalTarget: context?.kcalTarget,
  })

  return resolveParsedMealItems(drafts, { restrictions: context?.restrictions })
}
