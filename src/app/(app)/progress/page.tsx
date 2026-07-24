import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { WeightLogRepository } from "@/lib/db/repositories/weight-log-repository"
import { buildWeeklySummary, getWeekStart } from "@/lib/nutrition/weekly-summary"
import { ProgressRing } from "@/components/ui/progress-ring"
import { WeeklyCalorieChart } from "@/components/progress/weekly-calorie-chart"
import { WeightChart } from "@/components/progress/weight-chart"
import { PageContainer, PageHeader } from "@/components/ui/page-container"
import { formatKcal } from "@/lib/nutrition/format"

export default async function ProgressPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const startDate = getWeekStart(new Date())
  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)
  endDate.setHours(23, 59, 59, 999)

  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()
  const weightRepo = new WeightLogRepository()

  const [activePlan, logs, weightLogs] = await Promise.all([
    dietRepo.findActiveByUserId(result.user.id),
    mealLogRepo.findByUserAndDateRange(result.user.id, startDate, endDate),
    weightRepo.findByUserId(result.user.id, 30),
  ])

  const dailyTarget = result.user.dailyKcalTarget ?? activePlan?.totalKcal ?? 2000
  const mealsPerDay = activePlan?.meals.length ?? 4

  const summary = buildWeeklySummary({
    dailyTarget,
    mealsPerDay,
    logs,
    startDate,
  })

  const weekLabel =
    summary.balance > 0
      ? "Semana em déficit"
      : summary.balance < 0
        ? "Semana em superávit"
        : "Semana equilibrada"

  return (
    <PageContainer>
      <PageHeader title="Progresso" subtitle="Últimos 7 dias" />

      <div className="rounded-lg bg-signature-teal p-6 text-on-primary">
        <p className="text-lg font-semibold">{weekLabel}</p>
        <p className="mt-1 font-tabular-nums text-[28px] font-bold">
          {summary.balance > 0 ? "-" : summary.balance < 0 ? "+" : ""}
          {formatKcal(Math.abs(summary.balance))} kcal
        </p>
      </div>

      <div className="flex items-center justify-center">
        <ProgressRing
          percentage={summary.adherence.adherenceScore}
          label="Adesão"
          size={140}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calorias por dia
          </h2>
          <WeeklyCalorieChart days={summary.days} />
        </div>

        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Peso
          </h2>
          <WeightChart
            logs={weightLogs.reverse().map((l) => ({
              date: l.date.toISOString(),
              weight: l.weight,
            }))}
          />
        </div>
      </div>
    </PageContainer>
  )
}
