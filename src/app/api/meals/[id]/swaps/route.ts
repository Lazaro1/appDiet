import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealSwapLogRepository } from "@/lib/db/repositories/meal-swap-log-repository"
import { getMealLogDateError, resolveMealLogDate } from "@/lib/nutrition/meal-dates"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id: mealId } = await params
  const body = await request.json().catch(() => ({}))

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(user!.id)
  if (!activePlan) return apiError("Nenhum plano ativo", 404)

  const meal = activePlan.meals.find((m) => m.id === mealId)
  if (!meal) return apiError("Refeição não encontrada", 404)

  const logDate = resolveMealLogDate(body.date as string | undefined)
  const dateError = getMealLogDateError(logDate)
  if (dateError) return apiError(dateError, 400)

  const originalItemName = body.originalItemName as string | undefined
  const chosenName = body.chosenName as string | undefined
  const chosenKcal = body.chosenKcal as number | undefined
  const chosenProtein = body.chosenProtein as number | undefined

  if (!originalItemName?.trim() || !chosenName?.trim()) {
    return apiError("originalItemName e chosenName são obrigatórios")
  }
  if (chosenKcal == null || chosenProtein == null) {
    return apiError("chosenKcal e chosenProtein são obrigatórios")
  }

  const mealItemId = body.mealItemId as string | undefined
  if (mealItemId && !meal.mealItems.some((item) => item.id === mealItemId)) {
    return apiError("Item do plano não encontrado nesta refeição", 400)
  }

  const swapRepo = new MealSwapLogRepository()
  const log = await swapRepo.create({
    userId: user!.id,
    mealId,
    mealItemId,
    date: logDate,
    originalItemName,
    originalKcal: body.originalKcal as number | undefined,
    originalProtein: body.originalProtein as number | undefined,
    chosenName,
    chosenKcal,
    chosenProtein,
    description: body.description as string | undefined,
  })

  return apiSuccess({ log })
}
