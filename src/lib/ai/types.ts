/** Parsed food item from a meal description */
export interface ParsedMealDraftItem {
  foodName: string
  estimatedGrams: number
}

export interface ParsedFoodItem {
  foodName: string
  estimatedGrams: number
  foodId?: string | null
  recipeId?: string | null
  matchScore?: number
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}

/** Single food choice made by the LLM — nutrients are calculated by the backend */
export interface PlannedFoodItem {
  foodId: string
  quantityGrams: number
}

/** Raw plan composition returned by the LLM, before hydration */
export interface GeneratedDietDraft {
  status: "ok" | "unfeasible"
  meals?: Array<{
    mealId: string
    items: PlannedFoodItem[]
  }>
  reason?: string
}

/** Food offered to the LLM in the closed catalog for a meal */
export interface DietCatalogFood {
  foodId: string
  /** Short label for prompts and UI */
  displayName: string
  nutritionalRole?: string | null
  kcalPer100g: number
  proteinPer100g: number
  portionDefaultGrams: number
  portionMinGrams: number
  portionMaxGrams: number
  portionStepGrams: number
}

export interface DietCatalogMeal {
  mealId: string
  mealName: string
  kcalTarget: number
  startHour: number
  endHour: number
  candidates: DietCatalogFood[]
}

/** Everything the LLM needs to compose a plan from a closed catalog */
export interface DietGenerationContext {
  dailyKcalTarget: number
  macroTargets?: {
    proteinGrams: number
    carbsGrams: number
    fatGrams: number
  }
  restrictions: string[]
  preferences: string[]
  meals: DietCatalogMeal[]
}

/**
 * Minimal issue shape used to build repair prompts.
 * Structurally compatible with the validator's richer issue type.
 */
export interface DietRepairIssue {
  code: string
  message: string
  path?: string
}

/** A single chat message */
export interface ChatMessageInput {
  role: "user" | "assistant" | "system"
  content: string
}

/** Chat response (may be streamed) */
export interface ChatResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
  }
}

/** AI Provider interface — abstracts over OpenRouter, OpenAI, etc. */
export interface AIProvider {
  /** Send a chat completion request */
  chat(params: {
    messages: ChatMessageInput[]
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): Promise<ChatResponse>

  /** Stream a chat completion */
  chatStream(params: {
    messages: ChatMessageInput[]
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): AsyncGenerator<string, void, unknown>

  /** Extract food names and grams from a meal description (no macros). */
  extractMealItems(
    text: string,
    context?: { mealName?: string; kcalTarget?: number },
  ): Promise<ParsedMealDraftItem[]>

  /** Parse a meal description into structured food items with TBCA-backed nutrients */
  parseMeal(text: string, context?: { mealName?: string; kcalTarget?: number }): Promise<ParsedFoodItem[]>

  /** Extract imported diet structure with food names and grams only */
  extractDietImport(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
    options?: { dailyKcalTarget?: number; mealCountHint?: number },
  ): Promise<{
    meals: Array<{
      name: string
      kcalTarget?: number
      items: ParsedMealDraftItem[]
    }>
  }>

  /** Parse imported diet text into structured plan */
  importDietPlan(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
    options?: { dailyKcalTarget?: number; mealCountHint?: number },
  ): Promise<{
    meals: Array<{
      name: string
      kcalTarget: number
      items: ParsedFoodItem[]
    }>
  }>

  /**
   * Compose a diet plan draft by picking foods from a closed catalog.
   * Returns only foodId + grams; the backend calculates all nutrients.
   */
  generateDietDraft(params: {
    context: DietGenerationContext
    attempt?: number
    previousDraft?: GeneratedDietDraft
    issues?: DietRepairIssue[]
  }): Promise<GeneratedDietDraft>

  /** @deprecated Prefer catalog-based swap via suggestFoodSwaps orchestration */
  suggestSwap(params: {
    itemName: string
    itemKcal: number
    itemProtein: number
    availableFoods: string
    mealKcalTarget: number
  }): Promise<Array<{ name: string; kcal: number; protein: number; description: string }>>
}
