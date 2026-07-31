"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { ChatMessage } from "@/components/chat/chat-window"

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [streaming, setStreaming] = useState(false)
  const idCounter = useRef(0)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/chat/history")
      const json = await res.json()
      if (res.ok) {
        setMessages(
          json.data.messages.map(
            (m: {
              id: string
              role: string
              content: string
              createdAt: string
            }) => ({
              id: m.id,
              role: m.role as "user" | "assistant",
              content: m.content,
              createdAt: m.createdAt,
            }),
          ),
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const sendMessage = useCallback(
    async (text: string) => {
      const now = new Date().toISOString()
      const userMsg: ChatMessage = {
        id: `temp-${++idCounter.current}`,
        role: "user",
        content: text,
        createdAt: now,
      }
      const assistantMsg: ChatMessage = {
        id: `temp-${++idCounter.current}`,
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setStreaming(true)

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        })

        if (!res.ok || !res.body) {
          throw new Error("Erro ao enviar mensagem")
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
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                setMessages((prev) => {
                  const updated = [...prev]
                  const last = updated[updated.length - 1]
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + parsed.content,
                    }
                  }
                  return updated
                })
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        await loadHistory()
      } catch {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.role === "assistant" && !last.content) {
            updated[updated.length - 1] = {
              ...last,
              content: "Desculpe, não consegui responder. Tente novamente.",
            }
          }
          return updated
        })
      } finally {
        setStreaming(false)
      }
    },
    [loadHistory],
  )

  return { messages, loading, streaming, sendMessage }
}
