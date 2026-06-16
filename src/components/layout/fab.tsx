"use client"

import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FabProps {
  /** Click handler */
  onClick: () => void
  /** Custom icon (defaults to Plus) */
  icon?: React.ReactNode
  /** Accessible label */
  label?: string
}

export function Fab({ onClick, icon, label }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label ?? "Adicionar"}
      className={cn(
        "fixed bottom-20 right-4 z-50",
        "md:right-auto md:left-[calc(50%+120px)]",
        "flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-on-primary shadow-lg",
        "transition-colors hover:bg-primary-hover active:bg-primary-active",
      )}
    >
      {icon ?? <Plus size={24} />}
    </button>
  )
}
