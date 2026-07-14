import type { WhatsAppProvider, WhatsAppIncomingMessage, WhatsAppSendResult } from "./types"

interface EvolutionConfig {
  apiUrl: string
  apiKey: string
  instanceName: string
}

export class EvolutionProvider implements WhatsAppProvider {
  private config: EvolutionConfig

  constructor(config: EvolutionConfig) {
    this.config = config
  }

  async sendText(params: { to: string; text: string }): Promise<WhatsAppSendResult> {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/message/sendText/${this.config.instanceName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: this.config.apiKey,
          },
          body: JSON.stringify({
            number: params.to,
            text: params.text,
          }),
        }
      )

      if (!res.ok) {
        const errorText = await res.text()
        return { success: false, error: `Evolution API error: ${res.status} - ${errorText}` }
      }

      const data = await res.json()
      return { success: true, messageId: data.key?.id }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error"
      return { success: false, error: message }
    }
  }

  async setWebhook(url: string): Promise<void> {
    const res = await fetch(
      `${this.config.apiUrl}/webhook/set/${this.config.instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: this.config.apiKey,
        },
        body: JSON.stringify({
          enabled: true,
          url,
          webhookByEvent: false,
          events: ["messages.upsert"],
        }),
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to set webhook: ${res.status}`)
    }
  }

  parseWebhook(payload: unknown): WhatsAppIncomingMessage | null {
    if (!payload || typeof payload !== "object") return null

    const data = payload as Record<string, unknown>
    const event = data.event as string | undefined

    if (event !== "messages.upsert") return null

    const message = data.data as Record<string, unknown> | undefined
    if (!message) return null

    const key = message.key as Record<string, unknown> | undefined
    const msg = message.message as Record<string, unknown> | undefined

    if (!key || !msg) return null

    const from = (key.remoteJid as string | undefined)?.replace("@s.whatsapp.net", "")
    const text = (msg.conversation as string) ?? (msg.extendedTextMessage as Record<string, unknown>)?.text as string ?? ""

    if (!from || !text) return null

    return {
      from,
      text,
      timestamp: new Date((message.messageTimestamp as number) ?? Date.now() / 1000),
      sessionId: this.config.instanceName,
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      const res = await fetch(
        `${this.config.apiUrl}/instance/connectionState/${this.config.instanceName}`,
        {
          headers: { apikey: this.config.apiKey },
        }
      )

      if (!res.ok) return false

      const data = await res.json()
      return data.instance?.state === "open"
    } catch {
      return false
    }
  }
}
