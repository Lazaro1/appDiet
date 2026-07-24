import { determineMealStatus, type MealStatus } from "./meal-status"
import { formatTimeWindow } from "./format"

export interface DayMealSnapshot {
  id: string
  name: string
  timeWindow: string
  kcalTarget: number
  kcalConsumed?: number
  status: MealStatus
  conformant?: boolean
}

export interface DaySnapshot {
  meals: DayMealSnapshot[]
  consumedToday: number
  dailyTarget: number
  hasActivePlan: boolean
}

interface PlanMealInput {
  id: string
  name: string
  windowStart: number
  windowEnd: number
  kcalTarget: number
}

interface MealLogInput {
  mealId: string | null
  status: string
  parsedKcal: number | null
  conformant: boolean | null
}

/**
 * Builds the shared "today" snapshot consumed by the dashboard, the app shell
 * (FAB target) and the DayProvider. Single source of truth for per-meal status
 * so the dashboard page and the layout can't drift apart.
 */
export function buildDaySnapshot(params: {
  meals: PlanMealInput[]
  logs: MealLogInput[]
  dailyTarget: number
  hasActivePlan: boolean
  now?: Date
}): DaySnapshot {
  const now = params.now ?? new Date()
  const hour = now.getHours()

  const logsByMealId = new Map(
    params.logs.filter((l) => l.mealId).map((l) => [l.mealId!, l]),
  )

  const meals: DayMealSnapshot[] = params.meals.map((meal) => {
    const log = logsByMealId.get(meal.id)
    const status = determineMealStatus({
      hasLog: Boolean(log && log.status === "eaten"),
      isWithinWindow: hour >= meal.windowStart && hour <= meal.windowEnd,
      wasSkipped: log?.status === "skipped",
    })

    return {
      id: meal.id,
      name: meal.name,
      timeWindow: formatTimeWindow(meal.windowStart, meal.windowEnd),
      kcalTarget: meal.kcalTarget,
      kcalConsumed: log?.parsedKcal ?? undefined,
      status,
      conformant: log?.conformant ?? undefined,
    }
  })

  const consumedToday = params.logs
    .filter((log) => log.status === "eaten")
    .reduce((sum, log) => sum + (log.parsedKcal ?? 0), 0)

  return {
    meals,
    consumedToday,
    dailyTarget: params.dailyTarget,
    hasActivePlan: params.hasActivePlan,
  }
}
