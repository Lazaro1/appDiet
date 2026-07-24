"use client"

import Link from "next/link"
import { Flame, CheckCircle2 } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { CalorieBar } from "@/components/ui/calorie-bar"
import { MealCard } from "@/components/ui/meal-card"
import { PageContainer } from "@/components/ui/page-container"
import { useDay } from "@/components/providers/day-provider"
import { formatKcal } from "@/lib/nutrition/format"

interface DashboardViewProps {
  userName: string
  weekBalance: number
  adherenceScore: number
}

export function DashboardView({
  userName,
  weekBalance,
  adherenceScore,
}: DashboardViewProps) {
  const { meals, consumedToday, dailyTarget } = useDay()

  const weekLabel =
    weekBalance > 0
      ? "Sua semana está em déficit!"
      : weekBalance < 0
        ? "Sua semana está em superávit"
        : "Sua semana está equilibrada"

  return (
    <PageContainer>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Olá, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">Seu dia de hoje</p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Calorias hoje"
          value={formatKcal(consumedToday)}
          unit="kcal"
          icon={<Flame size={16} />}
        />
        <StatCard
          label="Adesão semanal"
          value={`${adherenceScore}%`}
          variant="success"
          icon={<CheckCircle2 size={16} />}
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Progresso do dia
        </p>
        <p className="mt-1 font-tabular-nums text-[28px] font-bold tracking-tight text-ink">
          {formatKcal(consumedToday)}{" "}
          <span className="text-sm font-medium text-muted-foreground">
            de {formatKcal(dailyTarget)} kcal
          </span>
        </p>
        <div className="mt-3">
          <CalorieBar consumed={consumedToday} target={dailyTarget} size="lg" />
        </div>
      </div>

      <div className="rounded-lg bg-signature-teal p-6 text-on-primary">
        <p className="text-xl font-semibold">{weekLabel}</p>
        <p className="mt-1 font-tabular-nums text-[28px] font-bold leading-tight">
          {weekBalance > 0 ? "-" : weekBalance < 0 ? "+" : ""}
          {formatKcal(Math.abs(weekBalance))} kcal
        </p>
        <p className="mt-2 text-sm opacity-90">
          {weekBalance > 0
            ? "Continue assim, você está no caminho certo."
            : weekBalance < 0
              ? "Ainda dá para equilibrar nos próximos dias."
              : "Bom equilíbrio calórico na semana."}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Refeições de hoje
        </h2>
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
