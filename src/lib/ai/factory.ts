import type { AIProvider } from "./types"
import { OpenRouterProvider } from "./openrouter"
import { MockAIProvider } from "./mock"

let _instance: AIProvider | null = null

function shouldUseMock(): boolean {
  const provider = process.env.AI_PROVIDER?.toLowerCase()

  if (provider === "mock") return true
  if (provider === "openrouter") return false

  // Default: mock when no API key (local dev without OpenRouter)
  return !process.env.OPENROUTER_API_KEY
}

export function getAIProvider(): AIProvider {
  if (_instance) return _instance

  if (shouldUseMock()) {
    if (process.env.NODE_ENV === "development") {
      console.info("[AppDiet] Using mock AI provider (set AI_PROVIDER=openrouter + OPENROUTER_API_KEY for real calls)")
    }
    _instance = new MockAIProvider()
    return _instance
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set. Use AI_PROVIDER=mock for local development.")
  }

  const fallbackReasoningEffort =
    process.env.OPENROUTER_FALLBACK_REASONING_EFFORT === "low" ? "low" : "none"

  _instance = new OpenRouterProvider({
    apiKey,
    primaryModel: process.env.OPENROUTER_PRIMARY_MODEL ?? "deepseek/deepseek-v4-flash",
    fallbackModel: process.env.OPENROUTER_FALLBACK_MODEL ?? "openai/gpt-5.6-luna",
    fallbackReasoningEffort,
  })

  return _instance
}

/** Reset the singleton (useful for testing) */
export function resetAIProvider(): void {
  _instance = null
}

export function isMockAIProvider(): boolean {
  return shouldUseMock()
}
