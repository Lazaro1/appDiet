import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealCard } from "@/components/ui/meal-card"
import { PageContainer, PageHeader } from "@/components/ui/page-container"
import { buildDaySnapshot } from "@/lib/nutrition/day"

export default async function MealsPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(result.user.id)
  if (!activePlan) redirect("/diet/new")

  const mealLogRepo = new MealLogRepository()
  const todayLogs = await mealLogRepo.findByUserAndDate(result.user.id, new Date())

  const { meals } = buildDaySnapshot({
    meals: activePlan.meals,
    logs: todayLogs,
    dailyTarget: result.user.dailyKcalTarget ?? activePlan.totalKcal,
    hasActivePlan: true,
  })

  return (
    <PageContainer>
      <PageHeader
        title="Refeições"
        subtitle="Registre suas refeições de hoje"
      />

      <div className="space-y-3">
        {meals.map((meal) => (
          <Link key={meal.id} href={`/meals/${meal.id}`}>
            <MealCard
              name={meal.name}
              timeWindow={meal.timeWindow}
              kcalTarget={meal.kcalTarget}
              kcalConsumed={meal.kcalConsumed}
              status={meal.status}
              conformant={meal.conformant}
            />
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}
