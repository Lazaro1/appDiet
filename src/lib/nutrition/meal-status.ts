/** Meal status types — shared between frontend and backend */
export type MealStatus = "pending" | "eaten" | "skipped" | "out_of_window"

/** Badge variant types */
export type BadgeVariant = "pending" | "eaten" | "skipped" | "warning" | "success" | "info"

/** Style configuration for a meal card based on its status */
export interface MealStatusStyle {
  cardClasses: string
  badgeVariant: BadgeVariant
  badgeLabel: string
}

/** Map of meal status to visual style — single source of truth */
const MEAL_STATUS_STYLES: Record<MealStatus, (opts?: { conformant?: boolean; isOverTarget?: boolean }) => MealStatusStyle> = {
  pending: () => ({
    cardClasses: "bg-canvas border-primary",
    badgeVariant: "pending",
    badgeLabel: "Pendente",
  }),
  eaten: (opts) => {
    if (opts?.conformant) {
      return {
        cardClasses: "bg-accent-green-soft border-success",
        badgeVariant: "success",
        badgeLabel: "Registrada",
      }
    }
    return {
      cardClasses: "bg-warning-soft border-warning",
      badgeVariant: "warning",
      badgeLabel: opts?.isOverTarget ? "Acima da meta" : "Abaixo da meta",
    }
  },
  skipped: () => ({
    cardClasses: "bg-surface border-border border-l-muted",
    badgeVariant: "skipped",
    badgeLabel: "Pulada",
  }),
  out_of_window: () => ({
    cardClasses: "bg-warning-soft border-warning",
    badgeVariant: "warning",
    badgeLabel: "Fora da janela",
  }),
}

/** Get the visual style for a meal status — OCP compliant (add new status = add entry) */
export function getMealStatusStyle(
  status: MealStatus,
  opts?: { conformant?: boolean; isOverTarget?: boolean }
): MealStatusStyle {
  const factory = MEAL_STATUS_STYLES[status]
  if (!factory) {
    return {
      cardClasses: "bg-canvas border-border",
      badgeVariant: "info",
      badgeLabel: "Desconhecido",
    }
  }
  return factory(opts)
}

/** Check if a meal log is conformant (within ±10% of target) */
export function isConformant(consumed: number, target: number): boolean {
  if (target === 0) return false
  const ratio = consumed / target
  return ratio >= 0.9 && ratio <= 1.1
}

/** Determine meal status from a meal log */
export function determineMealStatus(params: {
  hasLog: boolean
  isWithinWindow: boolean
  wasSkipped: boolean
}): MealStatus {
  if (!params.hasLog && params.wasSkipped) return "skipped"
  if (!params.hasLog) return "pending"
  if (!params.isWithinWindow) return "out_of_window"
  return "eaten"
}
