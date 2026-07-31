import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  role: "user" | "assistant"
  children: React.ReactNode
  timestamp?: string
  showAvatar?: boolean
}

export function ChatBubble({
  role,
  children,
  timestamp,
  showAvatar = false,
}: ChatBubbleProps) {
  const isUser = role === "user"

  if (isUser) {
    return (
      <div className="flex max-w-[80%] flex-col self-end">
        <div
          className={cn(
            "rounded-2xl rounded-br-none bg-signature-teal p-3 text-sm leading-relaxed text-white shadow-sm",
          )}
        >
          {children}
        </div>
        {timestamp && (
          <span className="mr-1 mt-1 self-end text-[11px] text-muted-foreground">
            {timestamp}
          </span>
        )}
      </div>
    )
  }

  const bubble = (
    <div
      className={cn(
        "max-w-[80%] rounded-2xl rounded-bl-none border border-border/30 bg-surface p-3 text-sm leading-relaxed text-body shadow-sm",
      )}
    >
      {children}
    </div>
  )

  if (!showAvatar) {
    return <div className="flex w-full self-start">{bubble}</div>
  }

  return (
    <div className="flex max-w-[80%] items-end gap-2 self-start">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised lg:hidden">
        <Bot className="size-4 text-primary" />
      </div>
      {bubble}
    </div>
  )
}

export function TypingIndicator({ showAvatar = false }: { showAvatar?: boolean }) {
  const dots = (
    <div className="flex h-[42px] items-center gap-1 rounded-2xl rounded-bl-none border border-border/30 bg-surface px-4 shadow-sm">
      <span className="size-2 animate-bounce rounded-full bg-signature-teal [animation-delay:-0.32s]" />
      <span className="size-2 animate-bounce rounded-full bg-signature-teal [animation-delay:-0.16s]" />
      <span className="size-2 animate-bounce rounded-full bg-signature-teal" />
    </div>
  )

  if (!showAvatar) {
    return <div className="flex w-full self-start">{dots}</div>
  }

  return (
    <div className="flex max-w-[80%] items-end gap-2 self-start">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-raised lg:hidden">
        <Bot className="size-4 text-primary" />
      </div>
      {dots}
    </div>
  )
}
