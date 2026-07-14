"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatInput } from "@/components/chat/chat-input"
import { useChat } from "@/hooks/use-chat"

function ChatPageContent() {
  const searchParams = useSearchParams()
  const context = searchParams.get("context")
  const itemName = searchParams.get("itemName")

  const initialMessage =
    context === "swap" && itemName
      ? `Quero trocar ${itemName}. O que posso usar no lugar?`
      : ""

  const { messages, loading, streaming, sendMessage } = useChat()

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-lg flex-col">
      <header className="border-b border-border px-4 py-4">
        <h1 className="text-xl font-bold tracking-tight text-ink">Chat com IA</h1>
        <p className="text-xs text-muted-foreground">Assistente de nutrição</p>
      </header>
      {loading && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      ) : (
        <ChatWindow messages={messages} streaming={streaming} />
      )}
      <ChatInput
        onSend={sendMessage}
        disabled={streaming}
        initialValue={initialMessage}
      />
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatPageContent />
    </Suspense>
  )
}
