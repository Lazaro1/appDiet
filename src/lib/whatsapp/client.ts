import type { WhatsAppProvider } from "./types"
import { EvolutionProvider } from "./evolution"

let _instance: WhatsAppProvider | null = null

export function getWhatsAppProvider(): WhatsAppProvider {
  if (_instance) return _instance

  const apiUrl = process.env.EVOLUTION_API_URL
  const apiKey = process.env.EVOLUTION_API_KEY

  if (!apiUrl || !apiKey) {
    throw new Error("EVOLUTION_API_URL and EVOLUTION_API_KEY must be set")
  }

  _instance = new EvolutionProvider({
    apiUrl,
    apiKey,
    instanceName: "appdiet",
  })

  return _instance
}

export function resetWhatsAppProvider(): void {
  _instance = null
}
