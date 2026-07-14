import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { MealLogForm } from "@/components/meals/meal-log-form"
import { SwapSheetTrigger } from "@/components/meals/swap-sheet"
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
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
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

      {meal.mealItems.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plano
          </h2>
          <ul className="mt-3 space-y-2">
            {meal.mealItems.map((item) => (
              <li key={item.id} className="flex items-center justify-between text-sm">
                <span className="text-ink">
                  {item.name}{" "}
                  <span className="text-muted-foreground">({item.quantity}{item.unit})</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-tabular-nums text-muted-foreground">
                    {formatKcal(item.kcal)} kcal
                  </span>
                  <SwapSheetTrigger
                    planId={activePlan.id}
                    itemName={item.name}
                    itemKcal={item.kcal}
                    itemProtein={item.protein}
                    mealKcalTarget={meal.kcalTarget}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          O que você comeu?
        </h2>
        <MealLogForm
          mealId={meal.id}
          kcalTarget={meal.kcalTarget}
          existingLog={log ?? null}
        />
      </div>
    </div>
  )
}
