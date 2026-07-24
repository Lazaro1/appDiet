import { z } from "zod"

const parsedFoodItemSchema = z.object({
  foodName: z.string().min(1),
  estimatedGrams: z.coerce.number().finite().nonnegative(),
  estimatedKcal: z.coerce.number().finite().nonnegative(),
  estimatedProtein: z.coerce.number().finite().nonnegative(),
  estimatedCarbs: z.coerce.number().finite().nonnegative(),
  estimatedFat: z.coerce.number().finite().nonnegative(),
})

const dietPlanSchema = z.object({
  meals: z
    .array(
      z.object({
        name: z.string().min(1),
        kcalTarget: z.coerce.number().finite().positive(),
        items: z.array(parsedFoodItemSchema).min(1),
      }),
    )
    .min(1),
})

const swapSuggestionsSchema = z.array(
  z.object({
    name: z.string().min(1),
    kcal: z.coerce.number().finite().nonnegative(),
    protein: z.coerce.number().finite().nonnegative(),
    description: z.string(),
  }),
)

function snakeToCamel(key: string): string {
  return key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())
}

/** Recursively normalizes snake_case keys from LLM output to camelCase. */
export function normalizeLlmKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeLlmKeys)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        snakeToCamel(key),
        normalizeLlmKeys(nested),
      ]),
    )
  }

  return value
}

/** Strips markdown fences and isolates the outermost JSON object or array. */
export function extractJsonPayload(text: string): string {
  const cleaned = text.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim()
  const startObject = cleaned.indexOf("{")
  const startArray = cleaned.indexOf("[")
  const start =
    startObject === -1
      ? startArray
      : startArray === -1
        ? startObject
        : Math.min(startObject, startArray)

  if (start === -1) return cleaned

  const open = cleaned[start]
  const close = open === "{" ? "}" : "]"
  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (inString) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === "\\") {
        escaped = true
        continue
      }
      if (char === '"') inString = false
      continue
    }

    if (char === '"') {
      inString = true
      continue
    }

    if (char === open) depth++
    if (char === close) {
      depth--
      if (depth === 0) return cleaned.slice(start, i + 1)
    }
  }

  return cleaned.slice(start)
}

export function parseJsonFromLlm<T>(
  text: string,
  schema: z.ZodType<T>,
  label: string,
): T {
  const payload = extractJsonPayload(text)
  let parsed: unknown

  try {
    parsed = JSON.parse(payload)
  } catch {
    throw new Error(`Failed to parse AI ${label} response as JSON`)
  }

  const result = schema.safeParse(normalizeLlmKeys(parsed))
  if (!result.success) {
    throw new Error(`AI ${label} response failed validation`)
  }

  return result.data
}

export async function requestStructuredJson<T>(params: {
  label: string
  schema: z.ZodType<T>
  request: (attempt: number) => Promise<{ content: string }>
  maxAttempts?: number
}): Promise<T> {
  const maxAttempts = params.maxAttempts ?? 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await params.request(attempt)
      return parseJsonFromLlm(response.content, params.schema, params.label)
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[AppDiet] AI ${params.label} attempt ${attempt}/${maxAttempts} failed:`,
          lastError.message,
        )
      }
    }
  }

  throw lastError ?? new Error(`Failed to get valid AI ${params.label} response`)
}

export const aiSchemas = {
  parsedFoodItems: z.array(parsedFoodItemSchema).min(1),
  dietPlan: dietPlanSchema,
  swapSuggestions: swapSuggestionsSchema.min(1),
}
