import { cn } from "@/lib/utils"
import { formatKcal, formatCalorieRemaining } from "@/lib/nutrition/format"

interface CalorieBarProps {
  /** kcal consumed */
  consumed: number
  /** kcal target */
  target: number
  /** Custom label displayed below the bar (overrides auto-computed text) */
  label?: string
  /** Whether to show remaining/excess text when no label is provided */
  showRemaining?: boolean
  /** Bar thickness */
  size?: "sm" | "md" | "lg"
}

const sizeClasses: Record<NonNullable<CalorieBarProps["size"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

export function CalorieBar({
  consumed,
  target,
  label,
  showRemaining = true,
  size = "md",
}: CalorieBarProps) {
  const percentage = target > 0 ? Math.min((consumed / target) * 100, 100) : 0
  const isOver = consumed > target
  const remaining = Math.abs(target - consumed)
  const fillColor = isOver ? "bg-accent-warm" : "bg-primary"

  const remainingText = formatCalorieRemaining(consumed, target)

  const showText = Boolean(label) || (showRemaining && target > 0)

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "w-full rounded-full bg-surface-raised",
          sizeClasses[size],
        )}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-300", fillColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <p className="text-sm font-semibold text-muted-foreground font-tabular-nums">
          {label || remainingText}
        </p>
      )}
    </div>
  )
}
