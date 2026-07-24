import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealLogSection } from "@/components/meals/meal-log-section"
import { PageContainer } from "@/components/ui/page-container"
import { formatKcal, formatTimeWindow } from "@/lib/nutrition/format"
import { ArrowLeft } from "lucide-react"

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { id } = await params
  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(result.user.id)
  if (!activePlan) redirect("/diet/new")

  const meal = activePlan.meals.find((m) => m.id === id)
  if (!meal) notFound()

  const mealLogRepo = new MealLogRepository()
  const todayLogs = await mealLogRepo.findByUserAndDate(result.user.id, new Date())
  const log = todayLogs.find((l) => l.mealId === id)

  return (
    <PageContainer>
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft size={16} />
        Voltar
      </Link>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{meal.name}</h1>
        <p className="text-sm text-muted-foreground">
          {formatTimeWindow(meal.windowStart, meal.windowEnd)} · Meta: {formatKcal(meal.kcalTarget)} kcal
        </p>
      </header>

      <MealLogSection
        mealItems={meal.mealItems}
        planId={activePlan.id}
        mealId={meal.id}
        kcalTarget={meal.kcalTarget}
        existingLog={log ?? null}
      />
    </PageContainer>
  )
}
