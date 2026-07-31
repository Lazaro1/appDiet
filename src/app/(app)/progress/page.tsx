import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { WeightLogRepository } from "@/lib/db/repositories/weight-log-repository"
import { ProgressView } from "@/components/progress/progress-view"
import {
  averageWeight,
  buildDailySummaries,
  calculateGoalStreak,
} from "@/lib/nutrition/progress-stats"
import { buildWeeklySummary, getWeekStart } from "@/lib/nutrition/weekly-summary"

export default async function ProgressPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const today = new Date()
  const weekStart = getWeekStart(today)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const streakStart = new Date(today)
  streakStart.setDate(streakStart.getDate() - 29)
  streakStart.setHours(0, 0, 0, 0)

  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()
  const weightRepo = new WeightLogRepository()

  const [activePlan, weekLogs, streakLogs, weightLogs] = await Promise.all([
    dietRepo.findActiveByUserId(result.user.id),
    mealLogRepo.findByUserAndDateRange(result.user.id, weekStart, weekEnd),
    mealLogRepo.findByUserAndDateRange(result.user.id, streakStart, weekEnd),
    weightRepo.findByUserId(result.user.id, 30),
  ])

  const dailyTarget = result.user.dailyKcalTarget ?? activePlan?.totalKcal ?? 2000
  const mealsPerDay = activePlan?.meals.length ?? 4

  const summary = buildWeeklySummary({
    dailyTarget,
    mealsPerDay,
    logs: weekLogs,
    startDate: weekStart,
  })

  const streakDays = buildDailySummaries({
    dailyTarget,
    mealsPerDay,
    logs: streakLogs,
    startDate: streakStart,
    dayCount: 30,
  })

  const streak = calculateGoalStreak(streakDays)
  const avgWeight = averageWeight(weightLogs)
  const avgDailyKcal = Math.round(summary.totalConsumed / 7)

  const weightChartLogs = [...weightLogs]
    .reverse()
    .map((l) => ({
      date: l.date.toISOString(),
      weight: l.weight,
    }))

  return (
    <ProgressView
      summary={summary}
      weightLogs={weightChartLogs}
      streak={streak}
      avgWeight={avgWeight}
      avgDailyKcal={avgDailyKcal}
    />
  )
}
