"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

/**
 * Bottom sheet on mobile, centered modal on desktop (>= lg). Closes on backdrop
 * click or Escape.
 */
export function Sheet({ open, onClose, children, title }: SheetProps) {
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
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          // Mobile: bottom sheet
          "absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto",
          "rounded-t-2xl border-t border-border bg-background p-6 shadow-lg",
          "animate-in slide-in-from-bottom duration-300",
          // Desktop: centered modal
          "lg:inset-auto lg:top-1/2 lg:left-1/2 lg:right-auto lg:bottom-auto",
          "lg:max-h-[85vh] lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2",
          "lg:rounded-2xl lg:border lg:zoom-in-95",
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
