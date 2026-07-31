"use client"

import { Plus } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useDay } from "@/components/providers/day-provider"
import { cn } from "@/lib/utils"

/**
 * Floating action button that jumps to the next meal to register. Derives its
 * target from the shared DayProvider, so logging a meal updates it instantly.
 * Renders nothing when the day is complete or on the chat screen.
 */
export function Fab() {
  const router = useRouter()
  const pathname = usePathname()
  const { nextPendingHref, hasActivePlan } = useDay()

  if (!nextPendingHref || pathname.startsWith("/chat") || pathname.startsWith("/meals/"))
    return null

  return (
    <button
      onClick={() => router.push(nextPendingHref)}
      aria-label={hasActivePlan ? "Registrar refeição" : "Criar dieta"}
      className={cn(
        "fixed bottom-20 right-4 z-50 lg:bottom-8 lg:right-8",
        "flex h-14 w-14 items-center justify-center",
        "rounded-full bg-primary text-on-primary shadow-lg",
        "transition-colors hover:bg-primary-hover active:bg-primary-active",
      )}
    >
      <Plus size={24} />
    </button>
  )
}
