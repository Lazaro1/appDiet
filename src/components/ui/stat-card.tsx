import { cn } from "@/lib/utils"

interface StatCardProps {
  /** Label displayed above the value */
  label: string
  /** Primary numeric or string value */
  value: string | number
  /** Unit displayed next to the value */
  unit?: string
  /** Visual variant controlling the left border color */
  variant?: "default" | "success" | "warning"
  /** Optional icon in the top-right corner */
  icon?: React.ReactNode
}

export function StatCard({
  label,
  value,
  unit,
  variant = "default",
  icon,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-card p-4 shadow-sm",
        variant === "default" && "border border-border",
        variant === "success" && "border border-border border-l-4 border-l-success",
        variant === "warning" && "border border-border border-l-4 border-l-warning",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {icon && (
          <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
        )}
      </div>
      <div className="mt-1 flex items-baseline">
        <span className="font-tabular-nums text-[28px] font-bold tracking-tight text-ink">
          {value}
        </span>
        {unit && (
          <span className="ml-1 text-sm font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
