import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"

export async function GET(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get("date")
  const date = dateStr ? new Date(dateStr + "T12:00:00") : new Date()

  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()

  const activePlan = await dietRepo.findActiveByUserId(user!.id)
  if (!activePlan) return apiSuccess({ meals: [], logs: [] })

  const logs = await mealLogRepo.findByUserAndDate(user!.id, date)

  return apiSuccess({
    meals: activePlan.meals,
    logs,
    planId: activePlan.id,
  })
}
