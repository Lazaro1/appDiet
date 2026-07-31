import { isLoggedLogStatus } from "./meal-status"

export interface DailySummary {
  date: string
  consumed: number
  target: number
  plannedMeals: number
  loggedMeals: number
  conformantMeals: number
}

export interface WeeklySummary {
  days: DailySummary[]
  totalConsumed: number
  totalTarget: number
  balance: number
  adherence: {
    registrationRate: number
    conformityRate: number
    adherenceScore: number
  }
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return d
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function buildWeeklySummary(params: {
  dailyTarget: number
  mealsPerDay: number
  logs: Array<{
    date: Date
    status: string
    parsedKcal: number | null
    conformant: boolean | null
  }>
  startDate: Date
}): WeeklySummary {
  const days: DailySummary[] = []

  for (let i = 0; i < 7; i++) {
    const day = new Date(params.startDate)
    day.setDate(day.getDate() + i)
    const key = formatDateKey(day)

    const dayLogs = params.logs.filter(
      (log) => formatDateKey(log.date) === key,
    )

    const consumed = dayLogs
      .filter((l) => isLoggedLogStatus(l.status))
      .reduce((s, l) => s + (l.parsedKcal ?? 0), 0)

    days.push({
      date: key,
      consumed,
      target: params.dailyTarget,
      plannedMeals: params.mealsPerDay,
      loggedMeals: dayLogs.filter((l) => l.status !== "skipped").length,
      conformantMeals: dayLogs.filter((l) => l.conformant).length,
    })
  }

  const totalConsumed = days.reduce((s, d) => s + d.consumed, 0)
  const totalTarget = params.dailyTarget * 7
  const totalPlanned = params.mealsPerDay * 7
  const totalLogged = days.reduce((s, d) => s + d.loggedMeals, 0)
  const totalConformant = days.reduce((s, d) => s + d.conformantMeals, 0)

  const registrationRate = totalPlanned > 0 ? Math.round((totalLogged / totalPlanned) * 100) : 0
  const conformityRate = totalLogged > 0 ? Math.round((totalConformant / totalLogged) * 100) : 0
  const adherenceScore = Math.round(registrationRate * 0.4 + conformityRate * 0.6)

  return {
    days,
    totalConsumed,
    totalTarget,
    balance: totalTarget - totalConsumed,
    adherence: { registrationRate, conformityRate, adherenceScore },
  }
}
