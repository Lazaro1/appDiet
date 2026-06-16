import { cn } from "@/lib/utils"

interface ChatBubbleProps {
  /** Who sent the message */
  role: "user" | "assistant"
  /** Message content */
  children: React.ReactNode
  /** Optional timestamp displayed below the bubble */
  timestamp?: string
}

export function ChatBubble({ role, children, timestamp }: ChatBubbleProps) {
  const isUser = role === "user"

  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <div
        className={cn(
          "max-w-[80%] px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-lg rounded-br-[6px] bg-primary text-on-primary"
            : "rounded-lg rounded-bl-[6px] bg-surface text-ink",
        )}
      >
        {children}
      </div>
      {timestamp && (
        <span className="mt-0.5 text-xs text-muted-foreground">
          {timestamp}
        </span>
      )}
    </div>
  )
}
