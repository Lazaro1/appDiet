import * as React from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FieldProps {
  /** Field label text */
  label?: string
  /** id of the control this label points to */
  htmlFor?: string
  /** Validation error message (takes precedence over hint) */
  error?: string
  /** Helper text shown below the control when there is no error */
  hint?: string
  className?: string
  children: React.ReactNode
}

/**
 * Groups a label, a control and its hint/error message with consistent
 * spacing and semantic tokens. Standardises form rows across the app.
 */
export function Field({ label, htmlFor, error, hint, className, children }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
