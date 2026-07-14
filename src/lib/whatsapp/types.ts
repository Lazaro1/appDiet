/** A received WhatsApp message */
export interface WhatsAppIncomingMessage {
  from: string        // phone number
  text: string        // message content
  timestamp: Date
  sessionId?: string  // Evolution API session ID
}

/** Result of sending a message */
export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
}

/** WhatsApp Provider interface — abstracts over Evolution API, Z-API, Cloud API */
export interface WhatsAppProvider {
  /** Send a text message to a phone number */
  sendText(params: {
    to: string
    text: string
  }): Promise<WhatsAppSendResult>

  /** Register a webhook URL for incoming messages */
  setWebhook(url: string): Promise<void>

  /** Parse an incoming webhook payload into a structured message */
  parseWebhook(payload: unknown): WhatsAppIncomingMessage | null

  /** Check if the provider is connected and ready */
  isConnected(): Promise<boolean>
}
