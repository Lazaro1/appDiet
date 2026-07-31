import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { WeightLogRepository } from "@/lib/db/repositories/weight-log-repository"
import { DashboardView } from "@/components/dashboard/dashboard-view"
import { calculateAdherence } from "@/lib/nutrition/adherence"

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
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
  const weightRepo = new WeightLogRepository()

  const [activePlan, weekLogs, latestWeight] = await Promise.all([
    dietRepo.findActiveByUserId(user.id),
    mealLogRepo.findByUserAndDateRange(user.id, weekStart, endOfDay(today)),
    weightRepo.findLatest(user.id),
  ])

  if (!activePlan) {
    redirect("/diet/new")
  }

  const dailyTarget = user.dailyKcalTarget ?? activePlan.totalKcal

  const weekConsumed = weekLogs
    .filter((log) => log.status === "eaten" || log.status === "out_of_window")
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
      weekBalance={weekBalance}
      adherenceScore={adherence.adherenceScore}
      currentWeight={latestWeight?.weight ?? null}
    />
  )
}
