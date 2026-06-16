"use client"

import { cn } from "@/lib/utils"
import { AppBadge } from "./app-badge"

interface MealCardProps {
  /** Meal name (e.g. "Almoço") */
  name: string
  /** Allowed time window (e.g. "11:00 - 14:00") */
  timeWindow: string
  /** Calorie target for this meal */
  kcalTarget: number
  /** Calories consumed (undefined if meal not yet eaten) */
  kcalConsumed?: number
  /** Current meal status */
  status: "pending" | "eaten" | "skipped" | "out_of_window"
  /** Whether consumption is within ±10% of target (only meaningful when eaten) */
  conformant?: boolean
  /** Optional click handler */
  onClick?: () => void
}

export function MealCard({
  name,
  timeWindow,
  kcalTarget,
  kcalConsumed,
  status,
  conformant,
  onClick,
}: MealCardProps) {
  const isOverTarget = kcalConsumed !== undefined && kcalConsumed > kcalTarget

  /* ---- determine card styling and badge ---- */
  let cardClasses: string
  let badgeVariant: "pending" | "eaten" | "skipped" | "warning" | "success" | "info"
  let badgeLabel: string

  switch (status) {
    case "pending": {
      cardClasses = "bg-canvas border-primary"
      badgeVariant = "pending"
      badgeLabel = "Pendente"
      break
    }
    case "eaten": {
      if (conformant) {
        cardClasses = "bg-accent-green-soft border-success"
        badgeVariant = "success"
        badgeLabel = "Registrada"
      } else {
        cardClasses = "bg-warning-soft border-warning"
        badgeVariant = "warning"
        badgeLabel = isOverTarget ? "Acima da meta" : "Abaixo da meta"
      }
      break
    }
    case "skipped": {
      cardClasses = "bg-surface border-border border-l-muted"
      badgeVariant = "skipped"
      badgeLabel = "Pulada"
      break
    }
    case "out_of_window": {
      cardClasses = "bg-warning-soft border-warning"
      badgeVariant = "warning"
      badgeLabel = "Fora da janela"
      break
    }
  }

  const showKcalConsumed = kcalConsumed !== undefined

  return (
    <div
      className={cn(
        "rounded-lg border-l-4 p-4 shadow-sm",
        cardClasses,
        onClick && "cursor-pointer transition-shadow hover:shadow-md",
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="truncate text-sm font-semibold text-ink">{name}</h3>
          <span className="shrink-0 text-xs text-muted-foreground">
            {timeWindow}
          </span>
        </div>
        <AppBadge variant={badgeVariant}>{badgeLabel}</AppBadge>
      </div>

      {/* Bottom row — kcal info */}
      <div className="mt-2">
        {showKcalConsumed ? (
          <p className="text-lg font-bold tracking-tight text-ink font-tabular-nums">
            {kcalConsumed.toLocaleString("pt-BR")} de{" "}
            {kcalTarget.toLocaleString("pt-BR")} kcal
          </p>
        ) : (
          <p className="text-lg font-bold tracking-tight text-muted-foreground font-tabular-nums">
            {kcalTarget.toLocaleString("pt-BR")} kcal meta
          </p>
        )}
      </div>
    </div>
  )
}
