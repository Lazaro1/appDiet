import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { getAIProvider } from "@/lib/ai/factory"
import { isConformant } from "@/lib/nutrition/adherence"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(user!.id)

  if (!activePlan) return apiError("Nenhum plano ativo", 404)

  const meal = activePlan.meals.find((m) => m.id === id)
  if (!meal) return apiError("Refeição não encontrada", 404)

  const mealLogRepo = new MealLogRepository()
  const todayLogs = await mealLogRepo.findByUserAndDate(user!.id, new Date())
  const log = todayLogs.find((l) => l.mealId === id)

  return apiSuccess({ meal, log, planId: activePlan.id })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const action = body.action as string | undefined

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(user!.id)
  if (!activePlan) return apiError("Nenhum plano ativo", 404)

  const meal = activePlan.meals.find((m) => m.id === id)
  if (!meal) return apiError("Refeição não encontrada", 404)

  const mealLogRepo = new MealLogRepository()
  const today = new Date()

  if (action === "skip") {
    const log = await mealLogRepo.create({
      userId: user!.id,
      mealId: id,
      date: today,
      status: "skipped",
    })
    return apiSuccess({ log })
  }

  const text = body.text as string | undefined
  if (!text?.trim()) return apiError("Descreva o que você comeu")

  try {
    const ai = getAIProvider()
    const items = await ai.parseMeal(text, {
      mealName: meal.name,
      kcalTarget: meal.kcalTarget,
    })

    const parsedKcal = items.reduce((s, i) => s + i.estimatedKcal, 0)
    const parsedProtein = items.reduce((s, i) => s + i.estimatedProtein, 0)
    const parsedCarbs = items.reduce((s, i) => s + i.estimatedCarbs, 0)
    const parsedFat = items.reduce((s, i) => s + i.estimatedFat, 0)
    const conformant = isConformant(parsedKcal, meal.kcalTarget)

    const log = await mealLogRepo.create({
      userId: user!.id,
      mealId: id,
      date: today,
      status: "eaten",
      rawText: text,
      parsedKcal,
      parsedProtein,
      parsedCarbs,
      parsedFat,
      conformant,
    })

    return apiSuccess({ log, items })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao registrar refeição"
    return apiError(message, 500)
  }
}
