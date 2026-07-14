"use client"

import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

export function Sheet({ open, onClose, children, title }: SheetProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto",
          "rounded-t-2xl border-t border-border bg-background p-6 shadow-lg",
          "animate-in slide-in-from-bottom duration-300",
        )}
      >
        {title && (
          <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}
