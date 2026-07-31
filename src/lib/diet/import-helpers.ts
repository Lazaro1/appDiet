import type { MealPreset } from "@/lib/onboarding/types"
import { MEAL_PRESETS } from "@/lib/onboarding/types"

const MEAL_HEADER_PATTERN =
  /(?:^|\n)\s*(?:refeição|refeicao)\b(?:\s*(\d+))?(?:\s*[-–—][^\n]*)?/gi
const NAMED_MEAL_PATTERN =
  /(?:^|\n)\s*(?:refeição\s*\d+\s*[-–—]\s*)?(café da manhã|caf[eé] da manh[aã]|almo[çc]o|lanche(?:\s+da\s+tarde)?|jantar|ceia)/gi

/** Count meal blocks in free-text diet (numbered or named). */
export function detectMealCountInText(text: string): number {
  const headers = [...text.matchAll(MEAL_HEADER_PATTERN)]
  if (headers.length > 0) {
    const numbered = headers
      .map((match) => Number(match[1]))
      .filter((value) => Number.isFinite(value) && value > 0)
    const highestNumber = numbered.length > 0 ? Math.max(...numbered) : 0
    return Math.max(headers.length, highestNumber)
  }

  const named = [...text.matchAll(NAMED_MEAL_PATTERN)]
  if (named.length > 0) return named.length

  return 0
}

/** Match import text meal count to presets, extending when the text has more meals. */
export function resolveMealPresetsForImport(
  basePresets: MealPreset[],
  text: string,
): MealPreset[] {
  const detected = detectMealCountInText(text)
  if (detected === 0) return basePresets

  if (detected <= basePresets.length) {
    return basePresets.slice(0, detected)
  }

  const extended = [...basePresets]
  const fallbackPresets = MEAL_PRESETS[6] ?? MEAL_PRESETS[4]

  for (let index = basePresets.length; index < detected; index++) {
    extended.push(
      fallbackPresets[index] ?? {
        name: `Refeição ${index + 1}`,
        windowStart: Math.min(21, 6 + index * 3),
        windowEnd: Math.min(23, 9 + index * 3),
      },
    )
  }

  return extended
}
