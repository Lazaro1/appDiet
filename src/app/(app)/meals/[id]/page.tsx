import { redirect, notFound } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealDetailView } from "@/components/meals/meal-detail-view"
import { buildDaySnapshot } from "@/lib/nutrition/day"
import {
  canLogMealsForDate,
  resolveMealLogDate,
} from "@/lib/nutrition/meal-dates"
import { toDateKey } from "@/lib/nutrition/meal-display"

export default async function MealDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ date?: string }>
}) {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { id } = await params
  const { date: dateKey } = await searchParams
  const logDate = resolveMealLogDate(dateKey)
  const logDateKey = toDateKey(logDate)

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(result.user.id)
  if (!activePlan) redirect("/diet/new")

  const meal = activePlan.meals.find((m) => m.id === id)
  if (!meal) notFound()

  const mealLogRepo = new MealLogRepository()
  const dayLogs = await mealLogRepo.findByUserAndDate(result.user.id, logDate)
  const log = dayLogs.find((l) => l.mealId === id)

  const dailyTarget = result.user.dailyKcalTarget ?? activePlan.totalKcal
  const snapshot = buildDaySnapshot({
    meals: activePlan.meals,
    logs: dayLogs,
    dailyTarget,
    hasActivePlan: true,
    now: logDate,
  })

  const snap = snapshot.meals.find((m) => m.id === id)

  return (
    <MealDetailView
      planId={activePlan.id}
      existingLog={log ?? null}
      logDateKey={logDateKey}
      canLog={canLogMealsForDate(logDate)}
      meal={{
        id: meal.id,
        name: meal.name,
        windowStart: meal.windowStart,
        windowEnd: meal.windowEnd,
        kcalTarget: meal.kcalTarget,
        kcalConsumed: snap?.kcalConsumed,
        status: snap?.status ?? "pending",
        items: meal.mealItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          kcal: item.kcal,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
        })),
      }}
    />
  )
}
