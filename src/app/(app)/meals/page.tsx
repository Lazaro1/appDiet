import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealsView } from "@/components/meals/meals-view"
import { buildDaySnapshot } from "@/lib/nutrition/day"
import { formatTimeWindow } from "@/lib/nutrition/format"
import { toDateKey, type MealsPageMeal } from "@/lib/nutrition/meal-display"

export default async function MealsPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(result.user.id)
  if (!activePlan) redirect("/diet/new")

  const mealLogRepo = new MealLogRepository()
  const today = new Date()
  const todayLogs = await mealLogRepo.findByUserAndDate(result.user.id, today)

  const dailyTarget = result.user.dailyKcalTarget ?? activePlan.totalKcal

  const snapshot = buildDaySnapshot({
    meals: activePlan.meals,
    logs: todayLogs,
    dailyTarget,
    hasActivePlan: true,
  })

  const planMeals: MealsPageMeal[] = activePlan.meals.map((meal) => {
    const snap = snapshot.meals.find((m) => m.id === meal.id)

    return {
      id: meal.id,
      name: meal.name,
      windowStart: meal.windowStart,
      windowEnd: meal.windowEnd,
      timeWindow: formatTimeWindow(meal.windowStart, meal.windowEnd),
      kcalTarget: meal.kcalTarget,
      kcalConsumed: snap?.kcalConsumed,
      status: snap?.status ?? "pending",
      conformant: snap?.conformant,
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
    }
  })

  return (
    <MealsView
      planMeals={planMeals}
      dailyTarget={dailyTarget}
      initialConsumed={snapshot.consumedToday}
      initialDate={toDateKey(today)}
    />
  )
}
