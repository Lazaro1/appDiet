import type { AIProvider, ChatMessageInput, ChatResponse, ParsedFoodItem } from "./types"

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
  }): Promise<ChatResponse> {
    const messages = params.systemPrompt
      ? [{ role: "system" as const, content: params.systemPrompt }, ...params.messages]
      : params.messages

    try {
      return await this.makeRequest(this.config.primaryModel, {
        messages,
        temperature: params.temperature ?? 0.7,
        max_tokens: params.maxTokens ?? 1024,
      })
    } catch (primaryError) {
      console.warn(`Primary model ${this.config.primaryModel} failed, falling back to ${this.config.fallbackModel}:`, primaryError)
      try {
        return await this.makeRequest(this.config.fallbackModel, {
          messages,
          temperature: params.temperature ?? 0.7,
          max_tokens: params.maxTokens ?? 1024,
        })
      } catch (fallbackError) {
        throw new Error("Both primary and fallback AI models failed. Please try again in a few minutes.")
      }
    }
  }

  async parseMeal(text: string, context?: { mealName?: string; kcalTarget?: number }): Promise<ParsedFoodItem[]> {
    const contextStr = context ? `\nContexto: refeição "${context.mealName}", meta de ${context.kcalTarget} kcal` : ""

    const response = await this.chat({
      systemPrompt: `Você é um parser de refeições. Parseie a descrição da refeição em alimentos estruturados.
Para cada alimento, estime a porção em gramas com base no contexto brasileiro.
Responda APENAS com JSON válido, sem markdown:
[{"foodName":"nome","estimatedGrams":0,"estimatedKcal":0,"estimatedProtein":0,"estimatedCarbs":0,"estimatedFat":0}]${contextStr}`,
      messages: [{ role: "user", content: text }],
      temperature: 0.3,
    })

    try {
      const cleaned = response.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(cleaned) as ParsedFoodItem[]
    } catch {
      throw new Error("Failed to parse AI meal response as JSON")
    }
  }

  async importDietPlan(
    text: string,
    mealWindows: Array<{ name: string; startHour: number; endHour: number }>,
  ): Promise<{
    meals: Array<{ name: string; kcalTarget: number; items: ParsedFoodItem[] }>
  }> {
    const windowsStr = mealWindows.map((w) => `${w.name} (${w.startHour}h-${w.endHour}h)`).join(", ")

    const response = await this.chat({
      systemPrompt: `Você é um parser de dietas. Converta o texto da dieta em um plano estruturado.
Use as janelas de refeição: ${windowsStr}
Responda APENAS com JSON válido, sem markdown:
{"meals":[{"name":"nome","kcalTarget":0,"items":[{"foodName":"nome","estimatedGrams":0,"estimatedKcal":0,"estimatedProtein":0,"estimatedCarbs":0,"estimatedFat":0}]}]}`,
      messages: [{ role: "user", content: text }],
      temperature: 0.3,
    })

    try {
      const cleaned = response.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(cleaned) as { meals: Array<{ name: string; kcalTarget: number; items: ParsedFoodItem[] }> }
    } catch {
      throw new Error("Failed to parse imported diet as JSON")
    }
  }

  async suggestSwap(params: {
    itemName: string
    itemKcal: number
    itemProtein: number
    availableFoods: string
    mealKcalTarget: number
  }): Promise<Array<{ name: string; kcal: number; protein: number; description: string }>> {
    const response = await this.chat({
      systemPrompt: `Você sugere trocas alimentares equivalentes em calorias e macros.
Responda APENAS com JSON válido, sem markdown:
[{"name":"alimento","kcal":0,"protein":0,"description":"breve explicação"}]`,
      messages: [{
        role: "user",
        content: `Trocar "${params.itemName}" (${params.itemKcal} kcal, ${params.itemProtein}g proteína).
Alimentos disponíveis: ${params.availableFoods}
Meta da refeição: ${params.mealKcalTarget} kcal. Sugira 3 alternativas.`,
      }],
      temperature: 0.5,
    })

    try {
      const cleaned = response.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(cleaned) as Array<{ name: string; kcal: number; protein: number; description: string }>
    } catch {
      throw new Error("Failed to parse swap suggestions as JSON")
    }
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
    const response = await this.chat({
      systemPrompt: `Você é um nutricionista. Crie um plano alimentar diário com base no perfil do paciente.
Responda APENAS com JSON válido, sem markdown:
{"meals":[{"name":"nome","kcalTarget":0,"items":[{"foodName":"nome","estimatedGrams":0,"estimatedKcal":0,"estimatedProtein":0,"estimatedCarbs":0,"estimatedFat":0}]}]}`,
      messages: [{
        role: "user",
        content: `Meta calórica diária: ${params.dailyKcalTarget} kcal
Refeições por dia: ${params.mealsPerDay}
Janelas: ${params.mealWindows.map(w => `${w.name} (${w.startHour}h-${w.endHour}h)`).join(", ")}
Restrições: ${params.restrictions?.join(", ") || "nenhuma"}
Preferências: ${params.preferences?.join(", ") || "nenhuma"}`,
      }],
      temperature: 0.5,
    })

    try {
      const cleaned = response.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      return JSON.parse(cleaned) as { meals: Array<{ name: string; kcalTarget: number; items: ParsedFoodItem[] }> }
    } catch {
      throw new Error("Failed to parse AI diet plan response as JSON")
    }
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
    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? model,
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
      } : undefined,
    }
  }
}
