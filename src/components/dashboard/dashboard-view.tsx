"use client"

import Link from "next/link"
import {
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock,
  Flame,
  Scale,
  Star,
  TrendingDown,
  Trophy,
  Utensils,
} from "lucide-react"
import { CalorieBar } from "@/components/ui/calorie-bar"
import { MealCard } from "@/components/ui/meal-card"
import { PageContainer } from "@/components/ui/page-container"
import { useDay } from "@/components/providers/day-provider"
import type { DayMealSnapshot } from "@/lib/nutrition/day"
import { isMealLogged } from "@/lib/nutrition/meal-status"
import {
  formatCalorieRemaining,
  formatKcal,
  formatWeight,
} from "@/lib/nutrition/format"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  userName: string
  weekBalance: number
  adherenceScore: number
  currentWeight?: number | null
}

function formatTodayDate() {
  return new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
}

function getWeekMessage(weekBalance: number) {
  if (weekBalance > 0) {
    return {
      title: "Sua semana está em déficit!",
      body: "Continue assim, você está no caminho certo para atingir seus objetivos de forma saudável.",
    }
  }
  if (weekBalance < 0) {
    return {
      title: "Sua semana está em superávit",
      body: "Ainda dá para equilibrar nos próximos dias com refeições mais leves.",
    }
  }
  return {
    title: "Sua semana está equilibrada",
    body: "Bom equilíbrio calórico na semana. Mantenha a consistência.",
  }
}

function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "A"

  return (
    <div
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-lg font-bold text-primary shadow-sm"
    >
      {initial}
    </div>
  )
}

function DesktopStat({
  icon,
  iconClass,
  label,
  value,
  unit,
  emphasis,
}: {
  icon: React.ReactNode
  iconClass: string
  label: string
  value: string
  unit?: string
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full [&_svg]:size-4",
            iconClass,
          )}
        >
          {icon}
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-tabular-nums font-bold tracking-tight text-ink",
            emphasis ? "text-[28px] leading-none" : "text-xl",
          )}
        >
          {value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  )
}

const mealBorderClass: Record<DayMealSnapshot["status"], string> = {
  pending: "bg-primary",
  eaten: "bg-success",
  skipped: "bg-muted-foreground",
  out_of_window: "bg-accent-warm",
}

const mealKcalClass: Record<DayMealSnapshot["status"], string> = {
  pending: "text-primary",
  eaten: "text-success",
  skipped: "text-muted-foreground",
  out_of_window: "text-accent-warm",
}

function DesktopMealCard({ meal }: { meal: DayMealSnapshot }) {
  const isLogged = isMealLogged(meal.status)
  const isEaten = meal.status === "eaten"
  const nonConformantEaten = isEaten && meal.conformant === false
  const borderClass = nonConformantEaten
    ? "bg-warning"
    : mealBorderClass[meal.status]
  const kcalClass = nonConformantEaten
    ? "text-warning"
    : mealKcalClass[meal.status]
  const kcal = meal.kcalConsumed ?? meal.kcalTarget

  return (
    <Link
      href={`/meals/${meal.id}`}
      className={cn(
        "group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm transition-colors hover:bg-surface-raised",
        meal.status === "skipped" && "opacity-75",
      )}
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1", borderClass)}
      />
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-canvas text-muted-foreground">
        <Utensils className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-base font-semibold text-ink">
            {meal.name}
          </span>
          <span
            className={cn(
              "flex shrink-0 items-center gap-1 text-sm font-semibold font-tabular-nums",
              kcalClass,
            )}
          >
            {isLogged && <CheckCircle2 className="size-4" />}
            {formatKcal(kcal)} kcal
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
          <Clock className="size-4 shrink-0" />
          {meal.timeWindow}
        </p>
      </div>
    </Link>
  )
}

export function DashboardView({
  userName,
  weekBalance,
  adherenceScore,
  currentWeight,
}: DashboardViewProps) {
  const { meals, consumedToday, dailyTarget } = useDay()

  const remaining = dailyTarget - consumedToday
  const isOverTarget = remaining < 0
  const heroKcal = isOverTarget ? Math.abs(remaining) : remaining
  const heroLabel = isOverTarget ? "Acima hoje" : "Restantes hoje"
  const weekMessage = getWeekMessage(weekBalance)
  const deficitKcal = Math.abs(weekBalance)

  return (
    <PageContainer className="space-y-6">
      {/* Header — mobile: greeting + avatar */}
      <header className="flex items-center justify-between gap-3 lg:hidden">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-body">
            Olá, {userName}!
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {formatTodayDate()}
          </p>
        </div>
        <UserAvatar name={userName} />
      </header>

      {/* Header — desktop: title + calendar */}
      <header className="hidden items-end justify-between gap-3 lg:flex">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Início
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Resumo do seu dia</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm transition-colors hover:bg-surface-raised">
          <CalendarDays className="size-5" />
        </div>
      </header>

      {/* ── MOBILE ─────────────────────────────────────── */}
      <div className="space-y-6 lg:hidden">
        {/* Calorie hero */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {heroLabel}
              </p>
              <h2
                className={cn(
                  "font-tabular-nums text-[36px] font-extrabold leading-none tracking-tighter",
                  isOverTarget ? "text-accent-warm" : "text-primary",
                )}
              >
                {formatKcal(heroKcal)}{" "}
                <span className="text-lg font-medium text-muted-foreground">
                  kcal
                </span>
              </h2>
            </div>
            <Flame
              className={cn(
                "size-8 shrink-0",
                isOverTarget ? "text-accent-warm" : "text-primary",
              )}
              aria-hidden
            />
          </div>

          <CalorieBar
            consumed={consumedToday}
            target={dailyTarget}
            showRemaining={false}
            size="md"
          />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-tabular-nums">
              Consumido: {formatKcal(consumedToday)} kcal
            </span>
            <span className="font-tabular-nums">
              Meta: {formatKcal(dailyTarget)} kcal
            </span>
          </div>
          <p className="sr-only">
            {formatCalorieRemaining(consumedToday, dailyTarget)}
          </p>
        </section>

        {/* Signature card */}
        <section className="relative overflow-hidden rounded-xl border border-primary/20 bg-signature-teal p-5 shadow-md">
          <Trophy
            className="pointer-events-none absolute -right-8 -top-8 size-28 rotate-12 text-white/20"
            aria-hidden
          />
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <Star
                className="size-4 fill-signature-sage text-signature-sage"
                aria-hidden
              />
              <span className="text-xs font-semibold uppercase tracking-wider text-signature-sage">
                Progresso
              </span>
            </div>
            <h3 className="pr-8 text-xl font-semibold leading-tight text-on-primary">
              {weekMessage.title}
            </h3>
            <p className="mt-2 text-sm text-on-primary/90">{weekMessage.body}</p>
          </div>
        </section>

        {/* Meal list */}
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-body">Refeições de hoje</h2>
          {meals.map((meal) => (
            <Link key={meal.id} href={`/meals/${meal.id}`}>
              <MealCard
                name={meal.name}
                timeWindow={meal.timeWindow}
                kcalTarget={meal.kcalTarget}
                kcalConsumed={meal.kcalConsumed}
                status={meal.status}
                conformant={meal.conformant}
                layout="row"
              />
            </Link>
          ))}
        </section>
      </div>

      {/* ── DESKTOP ────────────────────────────────────── */}
      <div className="hidden space-y-6 lg:block">
        {/* Stat grid 2x2 */}
        <section className="grid grid-cols-2 gap-3">
          <DesktopStat
            icon={<Flame />}
            iconClass="bg-primary/10 text-primary"
            label={heroLabel}
            value={formatKcal(heroKcal)}
            emphasis
          />
          <DesktopStat
            icon={<CheckCheck />}
            iconClass="bg-signature-teal/10 text-signature-teal"
            label="Adesão semanal"
            value={`${adherenceScore}%`}
            emphasis
          />
          <DesktopStat
            icon={<TrendingDown />}
            iconClass="bg-signature-warm/10 text-signature-warm"
            label={weekBalance >= 0 ? "Déficit acum." : "Superávit acum."}
            value={formatKcal(deficitKcal)}
            unit="kcal"
          />
          <DesktopStat
            icon={<Scale />}
            iconClass="bg-muted-foreground/10 text-muted-foreground"
            label="Peso atual"
            value={currentWeight != null ? formatWeight(currentWeight) : "—"}
          />
        </section>

        {/* Consumption bar */}
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-3 flex items-end justify-between">
            <span className="text-lg font-semibold text-ink">
              Consumo diário
            </span>
            <span className="font-tabular-nums text-sm text-muted-foreground">
              {formatKcal(consumedToday)} / {formatKcal(dailyTarget)} kcal
            </span>
          </div>
          <CalorieBar
            consumed={consumedToday}
            target={dailyTarget}
            showRemaining={false}
            size="md"
          />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0 kcal</span>
            <span>Meta</span>
          </div>
        </section>

        {/* Meal list */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-ink">Refeições de hoje</h2>
            <Link
              href="/meals"
              className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
            >
              Ver todas
            </Link>
          </div>
          {meals.map((meal) => (
            <DesktopMealCard key={meal.id} meal={meal} />
          ))}
        </section>
      </div>
    </PageContainer>
  )
}
