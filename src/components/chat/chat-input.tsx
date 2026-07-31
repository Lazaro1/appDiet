"use client"

import { useRef, useState } from "react"
import { Loader2, PlusCircle, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  initialValue?: string
}

export function ChatInput({ onSend, disabled, initialValue = "" }: ChatInputProps) {
  const [text, setText] = useState(initialValue)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function resize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault()
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="bg-gradient-to-t from-canvas via-canvas to-transparent px-4 pb-4 pt-6 lg:pb-4">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex min-h-12 items-end gap-1 rounded-[20px] border border-border bg-surface p-2 shadow-sm transition-all",
          "focus-within:border-signature-teal focus-within:ring-2 focus-within:ring-signature-teal/30",
        )}
      >
        <button
          type="button"
          className="mb-0.5 flex size-9 shrink-0 items-center justify-center self-end rounded-full text-muted-foreground transition-colors hover:text-signature-teal"
          aria-label="Anexar"
          disabled={disabled}
        >
          <PlusCircle className="size-5" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            resize()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={disabled}
          rows={1}
          className="max-h-[120px] min-h-[40px] flex-1 resize-none border-0 bg-transparent py-2.5 text-sm text-ink placeholder:text-muted-foreground focus:outline-none focus:ring-0"
        />

        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="mb-0.5 ml-1 flex size-10 shrink-0 items-center justify-center self-end rounded-full bg-signature-teal text-white shadow-sm transition-all hover:bg-primary active:scale-95 disabled:opacity-50"
          aria-label="Enviar mensagem"
        >
          {disabled ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <Send className="size-5" />
          )}
        </button>
      </form>
    </div>
  )
}
