"use client"

import { useEffect, useRef } from "react"
import { ChatBubble } from "@/components/ui/chat-bubble"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatWindowProps {
  messages: ChatMessage[]
  streaming?: boolean
}

export function ChatWindow({ messages, streaming }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Pergunte sobre trocas, dúvidas nutricionais ou ajustes na dieta.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg) => (
        <ChatBubble key={msg.id} role={msg.role}>
          {msg.content || (streaming && msg.role === "assistant" ? "..." : "")}
        </ChatBubble>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
