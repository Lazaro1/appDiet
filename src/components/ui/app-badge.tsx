import { cn } from "@/lib/utils"

interface AppBadgeProps {
  variant: "pending" | "eaten" | "skipped" | "warning" | "success" | "info"
  children: React.ReactNode
}

const variantClasses: Record<AppBadgeProps["variant"], string> = {
  pending: "bg-primary-soft text-primary",
  eaten: "bg-success-soft text-success",
  skipped: "bg-surface-raised text-muted-foreground",
  warning: "bg-warning-soft text-warning",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
}

export function AppBadge({ variant, children }: AppBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  )
}
