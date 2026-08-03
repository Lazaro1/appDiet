import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { isConformant } from "@/lib/nutrition/adherence"
import { parseMealText } from "@/lib/nutrition/orchestration/parse-meal-text"
import {
  getMealLogDateError,
  isTodayDate,
  resolveMealLogDate,
} from "@/lib/nutrition/meal-dates"
import { isMealWithinWindow } from "@/lib/nutrition/meal-status"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const logDate = resolveMealLogDate(searchParams.get("date"))

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(user!.id)

  if (!activePlan) return apiError("Nenhum plano ativo", 404)

  const meal = activePlan.meals.find((m) => m.id === id)
  if (!meal) return apiError("Refeição não encontrada", 404)

  const mealLogRepo = new MealLogRepository()
  const dayLogs = await mealLogRepo.findByUserAndDate(user!.id, logDate)
  const log = dayLogs.find((l) => l.mealId === id)

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
  const logDate = resolveMealLogDate(body.date as string | undefined)
  const dateError = getMealLogDateError(logDate)
  if (dateError) return apiError(dateError, 400)

  if (action === "skip") {
    const existingLog = await mealLogRepo.findByUserMealAndDate(user!.id, id, logDate)
    const log = existingLog
      ? await mealLogRepo.update(existingLog.id, {
          status: "skipped",
          rawText: null,
          parsedKcal: null,
          parsedProtein: null,
          parsedCarbs: null,
          parsedFat: null,
          conformant: null,
        })
      : await mealLogRepo.create({
          userId: user!.id,
          mealId: id,
          date: logDate,
          status: "skipped",
        })
    return apiSuccess({ log })
  }

  const text = body.text as string | undefined
  if (!text?.trim()) return apiError("Descreva o que você comeu")

  try {
    const items = await parseMealText(text, {
      mealName: meal.name,
      kcalTarget: meal.kcalTarget,
      restrictions: user!.restrictions,
    })

    const parsedKcal = items.reduce((s, i) => s + i.estimatedKcal, 0)
    const parsedProtein = items.reduce((s, i) => s + i.estimatedProtein, 0)
    const parsedCarbs = items.reduce((s, i) => s + i.estimatedCarbs, 0)
    const parsedFat = items.reduce((s, i) => s + i.estimatedFat, 0)
    const conformant = isConformant(parsedKcal, meal.kcalTarget)
    const withinWindow = isTodayDate(logDate)
      ? isMealWithinWindow(
          new Date().getHours(),
          meal.windowStart,
          meal.windowEnd,
        )
      : true
    const logStatus = withinWindow ? "eaten" : "out_of_window"

    const existingLog = await mealLogRepo.findByUserMealAndDate(user!.id, id, logDate)
    const log = existingLog
      ? await mealLogRepo.update(existingLog.id, {
          status: logStatus,
          rawText: text,
          parsedKcal,
          parsedProtein,
          parsedCarbs,
          parsedFat,
          conformant,
        })
      : await mealLogRepo.create({
          userId: user!.id,
          mealId: id,
          date: logDate,
          status: logStatus,
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
