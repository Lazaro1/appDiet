import type { WhatsAppIncomingMessage } from "./types"
import { getWhatsAppProvider } from "./client"

/** Classify an incoming WhatsApp message by intent */
export type MessageIntent = "weight" | "meal" | "skip" | "unknown"

export function classifyMessage(message: WhatsAppIncomingMessage): MessageIntent {
  const text = message.text.trim().toLowerCase()

  // Weight: just a number like "78.5" or "78,5"
  if (/^[\d.,]+$/.test(text)) return "weight"

  // Skip: "pulei", "não comi", "não vou comer"
  if (/pulei|não comi|nao comi|não vou|nao vou/i.test(text)) return "skip"

  // Meal: contains food-related words
  if (/comi|almoc|jantei|café|cafe|lanche|ceia|comi|comemos/i.test(text)) return "meal"

  return "unknown"
}

/** Process an incoming WhatsApp message */
export async function handleIncomingMessage(message: WhatsAppIncomingMessage): Promise<void> {
  const intent = classifyMessage(message)
  const provider = getWhatsAppProvider()

  switch (intent) {
    case "weight":
      await provider.sendText({
        to: message.from,
        text: `Peso registrado! ✅`,
      })
      break
    case "meal":
      await provider.sendText({
        to: message.from,
        text: `Refeição registrada! Para trocas e dúvidas, abra o app.`,
      })
      break
    case "skip":
      await provider.sendText({
        to: message.from,
        text: `Tudo bem, sem problemas! 👍`,
      })
      break
    case "unknown":
      await provider.sendText({
        to: message.from,
        text: `Para trocas e dúvidas, abra o app! 📱`,
      })
      break
  }
}
