import { aiSchemas, requestStructuredJson } from "./json-response"
import {
  buildDietImportSystemPrompt,
  DIET_PLAN_JSON_EXAMPLE,
  DIET_PLAN_RULES,
} from "./prompts"
import type { AIProvider, ChatMessageInput, ChatResponse, ParsedFoodItem } from "./types"

const JSON_RETRY_HINT =
  "Responda APENAS com JSON válido, sem markdown, comentários ou texto fora do JSON."

interface OpenRouterConfig {
  apiKey: string
  primaryModel: string
  fallbackModel: string
  baseUrl?: string
}

export class OpenRouterProvider implements AIProvider {
  private config: OpenRouterConfig

  constructor(config: OpenRouterConfig) {
    this.config = {
      baseUrl: "https://openrouter.ai/api/v1",
      ...config,
    }
  }

  async *chatStream(params: {
    messages: ChatMessageInput[]
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }): AsyncGenerator<string, void, unknown> {
    const messages = params.systemPrompt
      ? [{ role: "system" as const, content: params.systemPrompt }, ...params.messages]
      : params.messages

    for (const model of [this.config.primaryModel, this.config.fallbackModel]) {
      try {
        yield* this.streamRequest(model, {
          messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 1024,
          stream: true,
        })
        return
      } catch (err) {
        console.warn(`Stream model ${model} failed:`, err)
      }
    }
    throw new Error("Both primary and fallback AI models failed")
  }

  async chat(params: {
    messages: ChatMessageInput[]
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
    jsonMode?: boolean
    model?: string
  }): Promise<ChatResponse> {
    const messages = params.systemPrompt
      ? [{ role: "system" as const, content: params.systemPrompt }, ...params.messages]
      : params.messages

    const requestBody = {
      messages,
      temperature: params.temperature ?? 0.7,
      max_tokens: params.maxTokens ?? 1024,
      ...(params.jsonMode ? { response_format: { type: "json_object" as const } } : {}),
    }

    if (params.model) {
      return this.makeRequest(params.model, requestBody)
    }

    try {
      return await this.makeRequest(this.config.primaryModel, requestBody)
    } catch (primaryError) {
      console.warn(`Primary model ${this.config.primaryModel} failed, falling back to ${this.config.fallbackModel}:`, primaryError)
      try {
        return await this.makeRequest(this.config.fallbackModel, requestBody)
      } catch (fallbackError) {
        throw new Error("Both primary and fallback AI models failed. Please try again in a few minutes.")
      }
    }
  }

  async parseMeal(text: string, context?: { mealName?: string; kcalTarget?: number }): Promise<ParsedFoodItem[]> {
    const contextStr = context ? `\nContexto: refeição "${context.mealName}", meta de ${context.kcalTarget} kcal` : ""

    return requestStructuredJson({
      label: "meal parse",
      schema: aiSchemas.parsedFoodItemsResponse,
      maxAttempts: 2,
      request: (attempt) =>
        this.chat({
          systemPrompt: `Você é um parser de refeições. Parseie a descrição da refeição em alimentos estruturados.
Para cada alimento, estime a porção em gramas com base no contexto brasileiro.
${JSON_RETRY_HINT}
{"items":[{"foodName":"nome","estimatedGrams":0,"estimatedKcal":0,"estimatedProtein":0,"estimatedCarbs":0,"estimatedFat":0}]}${contextStr}`,
          messages: [
            {
              role: "user",
              content:
                attempt > 1
                  ? `${text}\n\nA resposta anterior não era JSON válido. ${JSON_RETRY_HINT}`
                  : text,
            },
          ],
          temperature: 0.2,
          maxTokens: 768,
          jsonMode: true,
          model: attempt > 1 ? this.config.fallbackModel : undefined,
        }),
    }).then((result) => result.items)
  }

  async importDietPlan(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
    options?: { dailyKcalTarget?: number; mealCountHint?: number },
  ): Promise<{
    meals: Array<{ name: string; kcalTarget: number; items: ParsedFoodItem[] }>
  }> {
    return requestStructuredJson({
      label: "diet import",
      schema: aiSchemas.dietPlan,
      request: (attempt) =>
        this.chat({
          systemPrompt: buildDietImportSystemPrompt({
            mealWindows,
            dailyKcalTarget: options?.dailyKcalTarget,
            mealCountHint: options?.mealCountHint,
          }),
          messages: [
            {
              role: "user",
              content:
                attempt > 1
                  ? `${text}\n\nA resposta anterior veio vazia ou inválida. ${JSON_RETRY_HINT}`
                  : text,
            },
          ],
          temperature: 0.2,
          maxTokens: 8192,
          jsonMode: true,
          model: attempt > 1 ? this.config.fallbackModel : undefined,
        }),
    })
  }

  async suggestSwap(params: {
    itemName: string
    itemKcal: number
    itemProtein: number
    availableFoods: string
    mealKcalTarget: number
  }): Promise<Array<{ name: string; kcal: number; protein: number; description: string }>> {
    const userPrompt = `Trocar "${params.itemName}" (${params.itemKcal} kcal, ${params.itemProtein}g proteína).
Alimentos disponíveis: ${params.availableFoods}
Meta da refeição: ${params.mealKcalTarget} kcal. Sugira 3 alternativas.`

    return requestStructuredJson({
      label: "swap suggestions",
      schema: aiSchemas.swapSuggestionsResponse,
      maxAttempts: 2,
      request: (attempt) =>
        this.chat({
          systemPrompt: `Você sugere trocas alimentares equivalentes em calorias e macros para o contexto brasileiro.
${JSON_RETRY_HINT}
{"suggestions":[{"name":"alimento","kcal":0,"protein":0,"description":"breve explicação"}]}
Retorne exatamente 3 itens em "suggestions".`,
          messages: [
            {
              role: "user",
              content:
                attempt > 1
                  ? `${userPrompt}\n\nA resposta anterior não era JSON válido. ${JSON_RETRY_HINT}`
                  : userPrompt,
            },
          ],
          temperature: 0.2,
          maxTokens: 512,
          jsonMode: true,
          model: attempt > 1 ? this.config.fallbackModel : undefined,
        }),
    }).then((result) => result.suggestions)
  }

  async generateDietPlan(params: {
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
  }> {
    const userPrompt = `Meta calórica diária: ${params.dailyKcalTarget} kcal
Refeições por dia: ${params.mealsPerDay}
Janelas: ${params.mealWindows.map((w) => `${w.name} (${w.startHour}h-${w.endHour}h)`).join(", ")}
Restrições: ${params.restrictions?.join(", ") || "nenhuma"}
Preferências: ${params.preferences?.join(", ") || "nenhuma"}
Crie exatamente ${params.mealsPerDay} refeições, com 2 a 4 alimentos por refeição.`

    return requestStructuredJson({
      label: "diet plan",
      schema: aiSchemas.dietPlan,
      request: (attempt) =>
        this.chat({
          systemPrompt: `Você é um nutricionista. Crie um plano alimentar diário com base no perfil do paciente.
${DIET_PLAN_RULES}
${JSON_RETRY_HINT}
${DIET_PLAN_JSON_EXAMPLE}`,
          messages: [
            {
              role: "user",
              content:
                attempt > 1
                  ? `${userPrompt}\n\nA resposta anterior não era JSON válido ou veio incompleta. ${JSON_RETRY_HINT}`
                  : userPrompt,
            },
          ],
          temperature: 0.3,
          maxTokens: 4096,
          jsonMode: true,
          model: attempt > 1 ? this.config.fallbackModel : undefined,
        }),
    })
  }

  private async *streamRequest(model: string, body: object): AsyncGenerator<string, void, unknown> {
    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      },
      body: JSON.stringify({ model, ...body }),
    })

    if (!res.ok || !res.body) {
      throw new Error(`OpenRouter stream error: ${res.status}`)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue
        const data = line.slice(6).trim()
        if (data === "[DONE]") return
        try {
          const parsed = JSON.parse(data)
          const content = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip malformed chunks
        }
      }
    }
  }

  private async makeRequest(model: string, body: object): Promise<ChatResponse> {
    const res = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      },
      body: JSON.stringify({ model, ...body }),
    })

    if (!res.ok) {
      throw new Error(`OpenRouter API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    const choice = data.choices?.[0]
    const content = this.extractMessageContent(choice?.message)

    if (!content.trim()) {
      const finishReason = choice?.finish_reason
      if (finishReason === "length") {
        throw new Error("OpenRouter response truncated (finish_reason=length)")
      }
      if (process.env.NODE_ENV === "development") {
        console.warn("[OpenRouter] Empty message content", {
          model,
          finishReason,
          messageKeys: choice?.message ? Object.keys(choice.message) : [],
        })
      }
    }

    return {
      content,
      model: data.model ?? model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      } : undefined,
    }
  }

  private extractMessageContent(message: Record<string, unknown> | undefined): string {
    if (!message) return ""

    const content = message.content
    if (typeof content === "string" && content.trim()) {
      return content
    }

    if (Array.isArray(content)) {
      const text = content
        .filter(
          (part): part is { type?: string; text?: string } =>
            typeof part === "object" && part !== null,
        )
        .map((part) => (part.type === "text" ? part.text ?? "" : ""))
        .join("")
      if (text.trim()) return text
    }

    const reasoning = message.reasoning ?? message.reasoning_content
    if (typeof reasoning === "string" && reasoning.trim()) {
      return reasoning
    }

    return typeof content === "string" ? content : ""
  }
}
