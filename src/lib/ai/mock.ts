import type {
  AIProvider,
  ChatMessageInput,
  ChatResponse,
  DietCatalogFood,
  DietCatalogMeal,
  DietGenerationContext,
  GeneratedDietDraft,
  ParsedFoodItem,
  ParsedMealDraftItem,
  PlannedFoodItem,
} from "./types"
import { importDietPlanFromText } from "@/lib/nutrition/orchestration/import-diet-plan"
import { resolveParsedMealItems } from "@/lib/nutrition/orchestration/match-food-from-text"

const MOCK_MODEL = "mock/appdiet-dev"

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function* streamText(text: string, chunkSize = 8): AsyncGenerator<string, void, unknown> {
  for (let i = 0; i < text.length; i += chunkSize) {
    yield text.slice(i, i + chunkSize)
    await delay(20)
  }
}

function lastUserMessage(messages: ChatMessageInput[]): string {
  return [...messages].reverse().find((m) => m.role === "user")?.content ?? ""
}

function buildMockChatReply(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes("troc") || lower.includes("substitu")) {
    return "Sem frango? Que tal ovo cozido — mesma proteína, ~200 kcal a menos. Ou atum enlatado se tiver em casa. Quer que eu detalhe as porções?"
  }

  if (lower.includes("kcal") || lower.includes("caloria")) {
    return "Pelo que você descreveu, ficou dentro da faixa da refeição. Se quiser, me manda o que comeu que eu confirmo os números."
  }

  if (lower.includes("dieta") || lower.includes("plano")) {
    return "Seu plano está equilibrado. Se quiser variar algum alimento, usa o botão Trocar na refeição ou me diz o que você tem disponível."
  }

  return "Entendi! Posso ajudar com trocas de alimentos, dúvidas sobre sua dieta ou registrar o que você comeu. O que precisa?"
}

function mockParsedItems(text: string, kcalTarget?: number): ParsedFoodItem[] {
  const lower = text.toLowerCase()
  const items: ParsedFoodItem[] = []

  const add = (foodName: string, grams: number, kcal: number, protein: number, carbs: number, fat: number) => {
    items.push({
      foodName,
      estimatedGrams: grams,
      estimatedKcal: kcal,
      estimatedProtein: protein,
      estimatedCarbs: carbs,
      estimatedFat: fat,
    })
  }

  if (lower.includes("arroz")) add("Arroz branco cozido", 150, 195, 4, 43, 0.5)
  if (lower.includes("feijão") || lower.includes("feijao")) add("Feijão carioca", 100, 77, 5, 14, 0.5)
  if (lower.includes("frango")) add("Peito de frango grelhado", 120, 198, 37, 0, 4)
  if (lower.includes("ovo")) add("Ovo cozido", 100, 155, 13, 1, 11)
  if (lower.includes("salada")) add("Salada verde", 80, 20, 1, 4, 0)
  if (lower.includes("pão") || lower.includes("pao")) add("Pão integral", 50, 120, 5, 22, 2)
  if (lower.includes("café") || lower.includes("cafe")) add("Café sem açúcar", 200, 4, 0, 0, 0)

  if (items.length === 0) {
    const target = kcalTarget ?? 500
    add("Refeição estimada", 200, Math.round(target * 0.95), 25, 40, 12)
  }

  return items
}

/** Kcal split used by the mock when composing a meal from the catalog. */
const MOCK_ITEM_WEIGHTS = [0.45, 0.35, 0.2]
const MOCK_PREFERRED_ROLES = ["protein", "carbohydrate", "vegetable", "fruit", "dairy"]

function gramsForKcal(food: DietCatalogFood, kcal: number): number {
  if (food.kcalPer100g <= 0) return food.portionDefaultGrams

  const raw = (kcal / food.kcalPer100g) * 100
  const step = food.portionStepGrams > 0 ? food.portionStepGrams : 5
  const stepped = Math.round(raw / step) * step

  return Math.min(food.portionMaxGrams, Math.max(food.portionMinGrams, stepped))
}

function pickMockCandidates(
  meal: DietCatalogMeal,
  usesByFoodId: Map<string, number>,
): DietCatalogFood[] {
  const available = meal.candidates.filter(
    (food) => (usesByFoodId.get(food.foodId) ?? 0) < 2,
  )
  const picked: DietCatalogFood[] = []

  for (const role of MOCK_PREFERRED_ROLES) {
    if (picked.length >= MOCK_ITEM_WEIGHTS.length) break
    const match = available.find(
      (food) => food.nutritionalRole === role && !picked.includes(food),
    )
    if (match) picked.push(match)
  }

  for (const food of available) {
    if (picked.length >= MOCK_ITEM_WEIGHTS.length) break
    if (!picked.includes(food)) picked.push(food)
  }

  return picked
}

function mockDraftItems(
  meal: DietCatalogMeal,
  usesByFoodId: Map<string, number>,
): PlannedFoodItem[] {
  const candidates = pickMockCandidates(meal, usesByFoodId)
  if (candidates.length === 0) return []

  const weights = MOCK_ITEM_WEIGHTS.slice(0, candidates.length)
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0)

  return candidates.map((food, index) => {
    usesByFoodId.set(food.foodId, (usesByFoodId.get(food.foodId) ?? 0) + 1)
    return {
      foodId: food.foodId,
      quantityGrams: gramsForKcal(
        food,
        (meal.kcalTarget * weights[index]) / weightSum,
      ),
    }
  })
}

function mockMealItems(kcalTarget: number): ParsedFoodItem[] {
  return [
    {
      foodName: "Proteína principal",
      estimatedGrams: 120,
      estimatedKcal: Math.round(kcalTarget * 0.4),
      estimatedProtein: 30,
      estimatedCarbs: 0,
      estimatedFat: 8,
    },
    {
      foodName: "Carboidrato",
      estimatedGrams: 150,
      estimatedKcal: Math.round(kcalTarget * 0.35),
      estimatedProtein: 4,
      estimatedCarbs: 40,
      estimatedFat: 1,
    },
    {
      foodName: "Vegetais",
      estimatedGrams: 100,
      estimatedKcal: Math.round(kcalTarget * 0.1),
      estimatedProtein: 2,
      estimatedCarbs: 8,
      estimatedFat: 0,
    },
    {
      foodName: "Complemento",
      estimatedGrams: 30,
      estimatedKcal: Math.round(kcalTarget * 0.15),
      estimatedProtein: 2,
      estimatedCarbs: 2,
      estimatedFat: 10,
    },
  ]
}

export class MockAIProvider implements AIProvider {
  async chat(params: {
    messages: ChatMessageInput[]
    systemPrompt?: string
  }): Promise<ChatResponse> {
    await delay(400)
    const reply = buildMockChatReply(lastUserMessage(params.messages))
    return { content: reply, model: MOCK_MODEL, usage: { promptTokens: 50, completionTokens: 30 } }
  }

  async *chatStream(params: {
    messages: ChatMessageInput[]
  }): AsyncGenerator<string, void, unknown> {
    const reply = buildMockChatReply(lastUserMessage(params.messages))
    yield* streamText(reply)
  }

  async extractMealItems(
    text: string,
    context?: { mealName?: string; kcalTarget?: number },
  ): Promise<ParsedMealDraftItem[]> {
    await delay(600)
    return mockParsedItems(text, context?.kcalTarget).map((item) => ({
      foodName: item.foodName,
      estimatedGrams: item.estimatedGrams,
    }))
  }

  async parseMeal(text: string, context?: { mealName?: string; kcalTarget?: number }): Promise<ParsedFoodItem[]> {
    const drafts = await this.extractMealItems(text, context)
    try {
      const resolved = await resolveParsedMealItems(drafts)
      if (resolved.some((item) => item.foodId || (item.matchScore ?? 0) >= 0.75)) {
        return resolved
      }
    } catch {
      // Fall back to static mock nutrients when the catalog is unavailable.
    }
    return mockParsedItems(text, context?.kcalTarget)
  }

  async extractDietImport(
    _text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
    options?: { dailyKcalTarget?: number; mealCountHint?: number },
  ) {
    await delay(800)
    const perMeal = Math.round(
      (options?.dailyKcalTarget ?? 2000) / Math.max(1, mealWindows.length),
    )

    return {
      meals: mealWindows.map((window) => ({
        name: window.name,
        kcalTarget: perMeal,
        items: mockMealItems(perMeal).map((item) => ({
          foodName: item.foodName,
          estimatedGrams: item.estimatedGrams,
        })),
      })),
    }
  }

  async importDietPlan(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
    options?: { dailyKcalTarget?: number; mealCountHint?: number },
  ) {
    return importDietPlanFromText({
      text,
      mealWindows,
      dailyKcalTarget: options?.dailyKcalTarget,
      mealCountHint: options?.mealCountHint,
    })
  }

  async generateDietDraft(params: {
    context: DietGenerationContext
  }): Promise<GeneratedDietDraft> {
    await delay(800)

    const usesByFoodId = new Map<string, number>()
    const meals = params.context.meals.map((meal) => ({
      mealId: meal.mealId,
      items: mockDraftItems(meal, usesByFoodId),
    }))

    if (meals.some((meal) => meal.items.length === 0)) {
      return {
        status: "unfeasible",
        reason: "Catálogo insuficiente para montar todas as refeições.",
      }
    }

    return { status: "ok", meals }
  }

  async suggestSwap(params: {
    itemName: string
    itemKcal: number
    itemProtein: number
    availableFoods: string
  }) {
    await delay(500)
    const baseKcal = params.itemKcal || 180
    const baseProtein = params.itemProtein || 25

    return [
      {
        name: "Ovo cozido (2 unidades)",
        kcal: Math.round(baseKcal * 0.85),
        protein: Math.round(baseProtein * 0.9),
        description: `Substituto com proteína similar ao ${params.itemName}, usando ${params.availableFoods}.`,
      },
      {
        name: "Atum enlatado (1 lata)",
        kcal: baseKcal,
        protein: baseProtein,
        description: "Opção prática, boa fonte de proteína magra.",
      },
      {
        name: "Queijo branco (2 fatias)",
        kcal: Math.round(baseKcal * 0.7),
        protein: Math.round(baseProtein * 0.6),
        description: "Alternativa mais leve para fechar a refeição.",
      },
    ]
  }
}
