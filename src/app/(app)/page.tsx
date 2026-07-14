import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { AppShell } from "@/components/layout/app-shell"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { calculateAdherence } from "@/lib/nutrition/adherence"
import { determineMealStatus } from "@/lib/nutrition/meal-status"
import { formatTimeWindow } from "@/lib/nutrition/format"

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function isWithinWindow(now: Date, startHour: number, endHour: number) {
  const hour = now.getHours()
  return hour >= startHour && hour <= endHour
}

export default async function DashboardPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { user } = result
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(weekStart.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()

  const [activePlan, todayLogs, weekLogs] = await Promise.all([
    dietRepo.findActiveByUserId(user.id),
    mealLogRepo.findByUserAndDate(user.id, today),
    mealLogRepo.findByUserAndDateRange(user.id, weekStart, endOfDay(today)),
  ])

  if (!activePlan) {
    redirect("/diet/new")
  }

  const dailyTarget = user.dailyKcalTarget ?? activePlan.totalKcal
  const consumedToday = todayLogs
    .filter((log) => log.status === "eaten")
    .reduce((sum, log) => sum + (log.parsedKcal ?? 0), 0)

  const logsByMealId = new Map(
    todayLogs.filter((log) => log.mealId).map((log) => [log.mealId!, log]),
  )

  const meals = activePlan.meals.map((meal) => {
    const log = logsByMealId.get(meal.id)
    const hasLog = Boolean(log)
    const wasSkipped = log?.status === "skipped"
    const withinWindow = isWithinWindow(today, meal.windowStart, meal.windowEnd)

    const status = determineMealStatus({
      hasLog: hasLog && log?.status === "eaten",
      isWithinWindow: withinWindow,
      wasSkipped,
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

  const firstPending = meals.find((m) => m.status === "pending")
  const fabHref = firstPending ? `/meals/${firstPending.id}` : null

  const weekConsumed = weekLogs
    .filter((log) => log.status === "eaten")
    .reduce((sum, log) => sum + (log.parsedKcal ?? 0), 0)
  const weekTarget = dailyTarget * 7
  const weekBalance = weekTarget - weekConsumed

  const plannedMealsPerDay = activePlan.meals.length
  const totalPlanned = plannedMealsPerDay * 7
  const totalLogged = weekLogs.filter((log) => log.status !== "skipped").length
  const totalConformant = weekLogs.filter((log) => log.conformant).length
  const adherence = calculateAdherence(totalPlanned, totalLogged, totalConformant)

  return (
    <DashboardView
      userName={user.name.split(" ")[0]}
      consumedToday={consumedToday}
      dailyTarget={dailyTarget}
      weekBalance={weekBalance}
      adherenceScore={adherence.adherenceScore}
      meals={meals}
    />
  )
}
