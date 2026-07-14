import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealCard } from "@/components/ui/meal-card"
import { determineMealStatus } from "@/lib/nutrition/meal-status"
import { formatTimeWindow } from "@/lib/nutrition/format"

export default async function MealsPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(result.user.id)
  if (!activePlan) redirect("/diet/new")

  const mealLogRepo = new MealLogRepository()
  const todayLogs = await mealLogRepo.findByUserAndDate(result.user.id, new Date())
  const logsByMealId = new Map(
    todayLogs.filter((l) => l.mealId).map((l) => [l.mealId!, l]),
  )

  const today = new Date()

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Refeições</h1>
        <p className="text-sm text-muted-foreground">Registre suas refeições de hoje</p>
      </header>

      <div className="space-y-3">
        {activePlan.meals.map((meal) => {
          const log = logsByMealId.get(meal.id)
          const status = determineMealStatus({
            hasLog: Boolean(log && log.status === "eaten"),
            isWithinWindow: today.getHours() >= meal.windowStart && today.getHours() <= meal.windowEnd,
            wasSkipped: log?.status === "skipped",
          })

          return (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <MealCard
                name={meal.name}
                timeWindow={formatTimeWindow(meal.windowStart, meal.windowEnd)}
                kcalTarget={meal.kcalTarget}
                kcalConsumed={log?.parsedKcal ?? undefined}
                status={status}
                conformant={log?.conformant ?? undefined}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
