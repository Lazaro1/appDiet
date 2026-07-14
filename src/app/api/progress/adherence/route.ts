import { requireApiUser, apiSuccess } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { buildWeeklySummary, getWeekStart } from "@/lib/nutrition/weekly-summary"

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const startDate = getWeekStart(new Date())
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)

  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()

  const activePlan = await dietRepo.findActiveByUserId(user!.id)
  const dailyTarget = user!.dailyKcalTarget ?? activePlan?.totalKcal ?? 2000
  const mealsPerDay = activePlan?.meals.length ?? 4

  const logs = await mealLogRepo.findByUserAndDateRange(user!.id, startDate, endDate)
  const summary = buildWeeklySummary({
    dailyTarget,
    mealsPerDay,
    logs,
    startDate,
  })

  return apiSuccess({ adherence: summary.adherence })
}
