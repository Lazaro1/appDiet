"use client"

import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { AppBadge } from "./app-badge"
import { getMealStatusStyle, type MealStatus } from "@/lib/nutrition/meal-status"
import { formatKcal } from "@/lib/nutrition/format"

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
  status: MealStatus
  /** Whether consumption is within ±10% of target (only meaningful when eaten) */
  conformant?: boolean
  /** Optional click handler */
  onClick?: () => void
  /** stack = default vertical; row = dashboard list item */
  layout?: "stack" | "row"
}

const rowBorderClass: Record<MealStatus, string> = {
  pending: "border-l-primary",
  eaten: "border-l-success",
  skipped: "border-l-muted",
  out_of_window: "border-l-accent-warm",
}

export function MealCard({
  name,
  timeWindow,
  kcalTarget,
  kcalConsumed,
  status,
  conformant,
  onClick,
  layout = "stack",
}: MealCardProps) {
  const isOverTarget = kcalConsumed !== undefined && kcalConsumed > kcalTarget

  const { cardClasses, badgeVariant, badgeLabel } = getMealStatusStyle(status, { conformant, isOverTarget })

  const showKcalConsumed = kcalConsumed !== undefined
  const kcalValue = showKcalConsumed ? kcalConsumed : kcalTarget

  if (layout === "row") {
    const borderClass =
      status === "eaten" && !conformant
        ? "border-l-warning"
        : rowBorderClass[status]

    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-xl border border-border border-l-4 bg-surface p-4 shadow-sm",
          borderClass,
          status === "skipped" && "opacity-80",
          onClick && "cursor-pointer transition-transform active:scale-[0.98] hover:shadow-md",
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
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-ink">{name}</h3>
            <AppBadge variant={badgeVariant}>{badgeLabel}</AppBadge>
          </div>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            {timeWindow}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-tabular-nums text-[28px] font-bold leading-none tracking-tight text-ink">
            {formatKcal(kcalValue)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {showKcalConsumed ? "kcal" : "kcal est."}
          </p>
        </div>
      </div>
    )
  }

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
            {formatKcal(kcalConsumed)} de{" "}
            {formatKcal(kcalTarget)} kcal
          </p>
        ) : (
          <p className="text-lg font-bold tracking-tight text-muted-foreground font-tabular-nums">
            {formatKcal(kcalTarget)} kcal meta
          </p>
        )}
      </div>
    </div>
  )
}
