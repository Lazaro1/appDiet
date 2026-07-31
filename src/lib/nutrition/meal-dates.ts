import { toDateKey } from "./meal-display"

export const MAX_PAST_MEAL_LOG_DAYS = 7

/** Parse YYYY-MM-DD into a local noon Date (avoids timezone day shifts). */
export function parseDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`)
}

export function isTodayDate(date: Date): boolean {
  return toDateKey(date) === toDateKey(new Date())
}

export function isFutureDate(date: Date): boolean {
  return toDateKey(date) > toDateKey(new Date())
}

export function isPastDate(date: Date): boolean {
  return toDateKey(date) < toDateKey(new Date())
}

export function daysBetween(from: Date, to: Date): number {
  const start = parseDateKey(toDateKey(from))
  const end = parseDateKey(toDateKey(to))
  return Math.round((end.getTime() - start.getTime()) / 86_400_000)
}

export function canLogMealsForDate(
  date: Date,
  maxPastDays = MAX_PAST_MEAL_LOG_DAYS,
): boolean {
  if (isFutureDate(date)) return false
  if (isTodayDate(date)) return true
  return daysBetween(date, new Date()) <= maxPastDays
}

export function resolveMealLogDate(dateKey?: string | null): Date {
  if (!dateKey) return new Date()
  return parseDateKey(dateKey)
}

export function getMealLogDateError(
  date: Date,
  maxPastDays = MAX_PAST_MEAL_LOG_DAYS,
): string | null {
  if (isFutureDate(date)) {
    return "Não é possível registrar refeições de dias futuros"
  }
  if (!canLogMealsForDate(date, maxPastDays)) {
    return `Só é possível registrar refeições dos últimos ${maxPastDays} dias`
  }
  return null
}

export function formatMealLogDateLabel(date: Date): string {
  if (isTodayDate(date)) return "hoje"
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}
