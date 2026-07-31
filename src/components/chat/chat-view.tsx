"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Bot, MoreVertical } from "lucide-react"
import { ChatWindow } from "@/components/chat/chat-window"
import { ChatInput } from "@/components/chat/chat-input"
import { useChat } from "@/hooks/use-chat"

function ChatViewContent() {
  const searchParams = useSearchParams()
  const context = searchParams.get("context")
  const itemName = searchParams.get("itemName")

  const initialMessage =
    context === "swap" && itemName
      ? `Quero trocar ${itemName}. O que posso usar no lugar?`
      : ""

  const { messages, loading, streaming, sendMessage } = useChat()

  return (
    <div className="mx-auto flex h-[calc(100dvh_-_5.5rem_-_env(safe-area-inset-bottom,0px))] w-full max-w-[480px] flex-col lg:h-[calc(100dvh-2rem)] lg:border-x lg:border-border">
      <header className="hidden h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 backdrop-blur-md lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-surface-raised">
            <Bot className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Coach Nutricional</h1>
            <p className="flex items-center gap-1.5 text-[11px] text-signature-teal">
              <span className="size-2 rounded-full bg-signature-teal" />
              Online
            </p>
          </div>
        </div>
        <button
          type="button"
          className="text-muted-foreground transition-colors hover:text-ink"
          aria-label="Mais opções"
        >
          <MoreVertical className="size-5" />
        </button>
      </header>

      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-canvas px-4 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-full bg-surface-raised">
          <Bot className="size-4 text-primary" />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary">Coach Nutricional</h1>
          <p className="text-[11px] text-muted-foreground">Assistente de nutrição</p>
        </div>
      </header>

      {loading && messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Carregando conversa...
        </div>
      ) : (
        <ChatWindow messages={messages} streaming={streaming} showAvatars />
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={streaming}
        initialValue={initialMessage}
      />
    </div>
  )
}

export function ChatView() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50dvh] items-center justify-center text-sm text-muted-foreground">
          Carregando...
        </div>
      }
    >
      <ChatViewContent />
    </Suspense>
  )
}
