import { z } from "zod"

const parsedFoodItemSchema = z.object({
  foodName: z.string().min(1),
  estimatedGrams: z.coerce.number().finite().nonnegative(),
  estimatedKcal: z.coerce.number().finite().nonnegative(),
  estimatedProtein: z.coerce.number().finite().nonnegative(),
  estimatedCarbs: z.coerce.number().finite().nonnegative(),
  estimatedFat: z.coerce.number().finite().nonnegative(),
})

function sumMealItemKcal(items: unknown[]): number {
  return items.reduce<number>((total, item) => {
    if (!item || typeof item !== "object") return total
    const kcal = Number((item as Record<string, unknown>).estimatedKcal)
    return total + (Number.isFinite(kcal) ? kcal : 0)
  }, 0)
}

/**
 * Import-only normalization: the pasted diet is the source of truth, so a
 * missing kcalTarget is backfilled from the items the model extracted.
 * Plan generation never goes through here — it uses the closed-catalog draft
 * schema, where targets are computed by the backend before the LLM runs.
 */
function normalizeDietImportPayload(value: unknown): unknown {
  const normalized = normalizeLlmKeys(value)
  if (!normalized || typeof normalized !== "object" || Array.isArray(normalized)) {
    return normalized
  }

  const obj = normalized as Record<string, unknown>
  if (!Array.isArray(obj.meals)) return normalized

  return {
    ...obj,
    meals: obj.meals.map((meal) => {
      if (!meal || typeof meal !== "object") return meal
      const record = meal as Record<string, unknown>
      const items = Array.isArray(record.items) ? record.items : []
      let kcalTarget = Number(record.kcalTarget)

      if (!Number.isFinite(kcalTarget) || kcalTarget <= 0) {
        const fromItems = Math.round(sumMealItemKcal(items))
        kcalTarget = Math.max(1, fromItems)
      }

      return { ...record, kcalTarget, items }
    }),
  }
}

const dietImportPlanSchema = z.preprocess(
  normalizeDietImportPayload,
  z.object({
    meals: z
      .array(
        z.object({
          name: z.string().min(1),
          kcalTarget: z.coerce.number().finite().positive(),
          items: z.array(parsedFoodItemSchema).min(1),
        }),
      )
      .min(1),
  }),
)

const swapSuggestionItemSchema = z.object({
  name: z.string().min(1),
  kcal: z.coerce.number().finite().nonnegative(),
  protein: z.coerce.number().finite().nonnegative(),
  description: z.string().default(""),
})

const swapSuggestionsSchema = z.preprocess(
  unwrapArrayFromLlm,
  z.array(swapSuggestionItemSchema).min(1),
)

const swapSuggestionsResponseSchema = z.object({
  suggestions: z.array(swapSuggestionItemSchema).min(1),
})

const ARRAY_WRAPPER_KEYS = [
  "suggestions",
  "alternatives",
  "items",
  "swaps",
  "data",
  "results",
  "trocas",
  "alternativas",
  "foods",
  "alimentos",
  "foodItems",
  "parsedFoodItems",
]

function normalizeParsedFoodItem(item: unknown): unknown {
  if (!item || typeof item !== "object" || Array.isArray(item)) return item
  const obj = { ...(item as Record<string, unknown>) }
  if (typeof obj.foodName !== "string" && typeof obj.name === "string") {
    obj.foodName = obj.name
  }
  if (obj.estimatedKcal == null && obj.kcal != null) obj.estimatedKcal = obj.kcal
  if (obj.estimatedProtein == null && obj.protein != null) {
    obj.estimatedProtein = obj.protein
  }
  if (obj.estimatedCarbs == null && obj.carbs != null) obj.estimatedCarbs = obj.carbs
  if (obj.estimatedFat == null && obj.fat != null) obj.estimatedFat = obj.fat
  if (obj.estimatedGrams == null && obj.grams != null) obj.estimatedGrams = obj.grams
  if (obj.estimatedGrams == null && obj.quantity != null) obj.estimatedGrams = obj.quantity
  return obj
}

function normalizeParsedFoodItemsPayload(value: unknown): unknown {
  const items = unwrapArrayFromLlm(value)
  if (!Array.isArray(items)) return value
  return items.map((item) => normalizeParsedFoodItem(normalizeLlmKeys(item)))
}

const parsedFoodItemsSchema = z.preprocess(
  normalizeParsedFoodItemsPayload,
  z.array(parsedFoodItemSchema).min(1),
)

const parsedFoodItemsResponseSchema = z.preprocess(
  (value) => {
    const normalized = normalizeLlmKeys(value)
    if (Array.isArray(normalized)) {
      return { items: normalized.map((item) => normalizeParsedFoodItem(item)) }
    }
    if (normalized && typeof normalized === "object") {
      const unwrapped = unwrapArrayFromLlm(normalized)
      if (Array.isArray(unwrapped)) {
        return { items: unwrapped.map((item) => normalizeParsedFoodItem(item)) }
      }
      const obj = normalized as Record<string, unknown>
      if (Array.isArray(obj.items)) {
        return { items: obj.items.map((item) => normalizeParsedFoodItem(item)) }
      }
    }
    return value
  },
  z.object({ items: z.array(parsedFoodItemSchema).min(1) }),
)

/** Unwraps LLM payloads that return an array directly or nested under common keys. */
export function unwrapArrayFromLlm(value: unknown): unknown {
  const normalized = normalizeLlmKeys(value)
  if (Array.isArray(normalized)) return normalized
  if (!normalized || typeof normalized !== "object") return normalized

  const obj = normalized as Record<string, unknown>
  for (const key of ARRAY_WRAPPER_KEYS) {
    if (Array.isArray(obj[key])) return obj[key]
  }
  for (const nested of Object.values(obj)) {
    if (Array.isArray(nested)) return nested
  }
  return normalized
}

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

const THINK_CLOSE_TAG = "<" + "/think>"
const REDACTED_REASONING_CLOSE_TAG = "<" + "/redacted_reasoning>"
const THINK_CLOSE_TAGS = [THINK_CLOSE_TAG, REDACTED_REASONING_CLOSE_TAG]

/** Strips reasoning tags, markdown fences, and other common LLM wrappers. */
function stripLlmNoise(text: string): string {
  let cleaned = text.trim()

  for (const tag of THINK_CLOSE_TAGS) {
    const thinkClose = cleaned.lastIndexOf(tag)
    if (thinkClose !== -1) {
      cleaned = cleaned.slice(thinkClose + tag.length).trim()
    }
  }

  const thinkBlockPattern = new RegExp("<" + "think>[\\s\\S]*?<\\/" + "think>", "gi")
  const reasoningBlockPattern = new RegExp(
    "<redacted_reasoning>[\\s\\S]*?<\\/" + "redacted_reasoning>",
    "gi",
  )
  cleaned = cleaned.replace(thinkBlockPattern, "").replace(reasoningBlockPattern, "").trim()
  cleaned = cleaned.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim()
  return cleaned
}

/** Removes trailing commas that some models emit before } or ]. */
function repairJsonText(text: string): string {
  return text.replace(/,\s*([}\]])/g, "$1")
}

function tryParseJsonString(text: string): unknown | null {
  for (const candidate of [text, repairJsonText(text)]) {
    try {
      return JSON.parse(candidate)
    } catch {
      // try next strategy
    }
  }
  return null
}

function extractBalancedJsonAt(text: string, start: number): string | null {
  if (start < 0 || start >= text.length) return null
  const first = text[start]
  if (first !== "{" && first !== "[") return null

  let objectDepth = 0
  let arrayDepth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const char = text[i]

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

    if (char === "{") objectDepth++
    else if (char === "}") objectDepth--
    else if (char === "[") arrayDepth++
    else if (char === "]") arrayDepth--

    if (i > start && objectDepth === 0 && arrayDepth === 0) {
      return text.slice(start, i + 1)
    }
  }

  return null
}

/** Strips markdown fences and isolates the outermost JSON object or array. */
export function extractJsonPayload(text: string): string {
  const cleaned = stripLlmNoise(text)

  if (tryParseJsonString(cleaned) !== null) return cleaned

  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] !== "{" && cleaned[i] !== "[") continue
    const balanced = extractBalancedJsonAt(cleaned, i)
    if (balanced && tryParseJsonString(balanced) !== null) return balanced
  }

  const startObject = cleaned.indexOf("{")
  const startArray = cleaned.indexOf("[")
  const start =
    startObject === -1
      ? startArray
      : startArray === -1
        ? startObject
        : Math.min(startObject, startArray)

  if (start === -1) return cleaned
  return extractBalancedJsonAt(cleaned, start) ?? cleaned.slice(start)
}

function formatLlmPreview(text: string, maxLength = 200): string {
  const compact = text.replace(/\s+/g, " ").trim()
  if (!compact) return "(empty)"
  return compact.length <= maxLength ? compact : `${compact.slice(0, maxLength)}…`
}

export function parseJsonFromLlm<T>(
  text: string,
  schema: z.ZodType<T>,
  label: string,
): T {
  if (!text.trim()) {
    throw new Error(`AI ${label} response was empty`)
  }

  const payload = extractJsonPayload(text)
  const parsed = tryParseJsonString(payload)
  if (parsed === null) {
    throw new Error(`Failed to parse AI ${label} response as JSON`)
  }

  const result = schema.safeParse(normalizeLlmKeys(parsed))
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    throw new Error(
      details
        ? `AI ${label} response failed validation: ${details}`
        : `AI ${label} response failed validation`,
    )
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
    let responseContent = ""
    try {
      const response = await params.request(attempt)
      responseContent = response.content
      const parsed = parseJsonFromLlm(response.content, params.schema, params.label)
      if (process.env.NODE_ENV === "development" && attempt > 1) {
        console.info(
          `[AppDiet] AI ${params.label} succeeded on attempt ${attempt}/${maxAttempts}`,
        )
      }
      return parsed
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `[AppDiet] AI ${params.label} attempt ${attempt}/${maxAttempts} failed:`,
          lastError.message,
          formatLlmPreview(responseContent),
        )
      }
    }
  }

  throw lastError ?? new Error(`Failed to get valid AI ${params.label} response`)
}

export const aiSchemas = {
  parsedFoodItems: parsedFoodItemsSchema,
  parsedFoodItemsResponse: parsedFoodItemsResponseSchema,
  dietImportPlan: dietImportPlanSchema,
  swapSuggestions: swapSuggestionsSchema,
  swapSuggestionsResponse: swapSuggestionsResponseSchema,
}
