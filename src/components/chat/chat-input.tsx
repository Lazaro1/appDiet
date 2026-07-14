"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  initialValue?: string
}

export function ChatInput({ onSend, disabled, initialValue = "" }: ChatInputProps) {
  const [text, setText] = useState(initialValue)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border p-4">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Digite sua mensagem..."
        disabled={disabled}
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <Button type="submit" disabled={disabled || !text.trim()} size="icon">
        {disabled ? <Loader2 className="animate-spin" /> : <Send />}
      </Button>
    </form>
  )
}
