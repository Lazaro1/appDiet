"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  footer?: React.ReactNode
}

/**
 * Bottom sheet on mobile, centered modal on desktop (>= lg). Closes on backdrop
 * click or Escape. Optional footer stays pinned above the bottom nav.
 */
export function Sheet({ open, onClose, children, title, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col overflow-hidden bg-background shadow-lg",
          "rounded-t-2xl border-t border-border",
          "animate-in slide-in-from-bottom duration-300",
          "lg:max-w-md lg:rounded-2xl lg:border lg:zoom-in-95",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "min-h-0 flex-1 overflow-y-auto p-6",
            !footer && "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          )}
        >
          {title && (
            <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
          )}
          {children}
        </div>
        {footer && (
          <div className="shrink-0 border-t border-border bg-background px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
