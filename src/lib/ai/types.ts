/** Parsed food item from a meal description */
export interface ParsedFoodItem {
  foodName: string
  estimatedGrams: number
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
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

  /** Parse a meal description into structured food items */
  parseMeal(text: string, context?: { mealName?: string; kcalTarget?: number }): Promise<ParsedFoodItem[]>

  /** Generate a diet plan based on user profile */
  generateDietPlan(params: {
    dailyKcalTarget: number
    mealsPerDay: number
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>
    restrictions?: string[]
    preferences?: string[]
  }): Promise<{
    meals: Array<{
      name: string
      kcalTarget: number
      items: ParsedFoodItem[]
    }>
  }>

  /** Parse imported diet text into structured plan */
  importDietPlan(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
  ): Promise<{
    meals: Array<{
      name: string
      kcalTarget: number
      items: ParsedFoodItem[]
    }>
  }>

  /** Suggest food swap alternatives */
  suggestSwap(params: {
    itemName: string
    itemKcal: number
    itemProtein: number
    availableFoods: string
    mealKcalTarget: number
  }): Promise<Array<{ name: string; kcal: number; protein: number; description: string }>>
}
