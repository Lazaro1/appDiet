"use client"

import { useEffect, useRef } from "react"
import { ChatBubble, TypingIndicator } from "@/components/ui/chat-bubble"
import { cn } from "@/lib/utils"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: string
}

interface ChatWindowProps {
  messages: ChatMessage[]
  streaming?: boolean
  showAvatars?: boolean
}

const WELCOME_MESSAGE =
  "Olá! Como posso ajudar com sua dieta hoje? Posso sugerir trocas saudáveis ou tirar dúvidas sobre o seu plano."

function formatMessageTime(iso?: string) {
  if (!iso) return undefined
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDateLabel() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

export function ChatWindow({
  messages,
  streaming,
  showAvatars = false,
}: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const isEmpty = messages.length === 0

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  const lastMessage = messages[messages.length - 1]
  const showTyping =
    streaming &&
    lastMessage?.role === "assistant" &&
    lastMessage.content.length === 0

  return (
    <div
      className={cn(
        "flex flex-1 flex-col gap-3 overflow-y-auto p-4",
        "[scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border",
      )}
    >
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-surface-raised px-3 py-1 text-[11px] capitalize text-muted-foreground">
          {formatDateLabel()}
        </span>
      </div>

      {isEmpty && !streaming && (
        <ChatBubble role="assistant" showAvatar={showAvatars}>
          {WELCOME_MESSAGE}
        </ChatBubble>
      )}

      {messages.map((msg, index) => {
        const isLastAssistant =
          msg.role === "assistant" && index === messages.length - 1
        if (showTyping && isLastAssistant && !msg.content) {
          return null
        }

        return (
          <ChatBubble
            key={msg.id}
            role={msg.role}
            showAvatar={showAvatars && msg.role === "assistant"}
            timestamp={
              msg.role === "user" ? formatMessageTime(msg.createdAt) : undefined
            }
          >
            {msg.content ||
              (streaming && msg.role === "assistant" ? "" : msg.content)}
          </ChatBubble>
        )
      })}

      {showTyping && <TypingIndicator showAvatar={showAvatars} />}

      <div ref={bottomRef} />
    </div>
  )
}
