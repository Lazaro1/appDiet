import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Remove the default max-width/centering (e.g. for full-bleed layouts) */
  bleed?: boolean
}

/**
 * Standard page wrapper: centered, phone-width column on mobile, comfortable
 * width on desktop. Replaces the `mx-auto max-w-lg space-y-6 px-4 py-6` pattern
 * duplicated across every page.
 */
export function PageContainer({ children, className, bleed }: PageContainerProps) {
  return (
    <div
      className={cn(
        "w-full space-y-6 px-4 py-6 lg:py-8",
        !bleed && "mx-auto max-w-lg",
        className,
      )}
    >
      {children}
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Optional trailing action (e.g. a button) aligned to the right */
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, action, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-3", className)}>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}
