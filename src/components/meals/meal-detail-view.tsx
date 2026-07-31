"use client"

import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Flame,
  Pencil,
} from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { MealLogSection } from "@/components/meals/meal-log-section"
import {
  formatMealLogDateLabel,
  isFutureDate,
  isTodayDate,
  parseDateKey,
} from "@/lib/nutrition/meal-dates"
import {
  formatMealHour,
  formatMealSuggestion,
  getMealIcon,
  sumMealMacros,
  type MealItemDisplay,
} from "@/lib/nutrition/meal-display"
import type { MealStatus } from "@/lib/nutrition/meal-status"
import { isMealLogged } from "@/lib/nutrition/meal-status"
import { formatKcal } from "@/lib/nutrition/format"
import { cn } from "@/lib/utils"

const CHIP_COLORS = [
  "bg-signature-teal",
  "bg-signature-warm",
  "bg-signature-sage",
  "bg-signature-peach",
] as const

export interface MealDetailData {
  id: string
  name: string
  windowStart: number
  windowEnd: number
  kcalTarget: number
  kcalConsumed?: number
  status: MealStatus
  items: MealItemDisplay[]
}

interface MealDetailViewProps {
  meal: MealDetailData
  planId: string
  logDateKey: string
  canLog: boolean
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
}

function KcalComparison({
  target,
  register,
  isLogged = false,
}: {
  target: number
  register: number
  isLogged?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-surface p-3">
        <span className="mb-1 text-[11px] text-muted-foreground">Meta</span>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-ink font-tabular-nums">
            {formatKcal(target)}
          </span>
          <span className="text-[11px] text-muted-foreground">kcal</span>
        </div>
      </div>
      <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-surface p-3">
        <div className="pointer-events-none absolute inset-0 bg-primary/5" />
        <span className="relative mb-1 text-[11px] font-medium text-primary">
          {isLogged ? "Consumido" : "Registrar"}
        </span>
        <div className="relative flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary font-tabular-nums">
            {formatKcal(register)}
          </span>
          <span className="text-[11px] text-primary">kcal</span>
        </div>
      </div>
    </div>
  )
}

function MacrosBar({ items }: { items: MealItemDisplay[] }) {
  const macros = sumMealMacros(items)

  return (
    <div className="flex gap-3 rounded-xl border border-border bg-surface p-3">
      {[
        { label: "Carb", value: macros.carbs },
        { label: "Prot", value: macros.protein },
        { label: "Gord", value: macros.fat },
      ].map((macro, i) => (
        <div key={macro.label} className="flex flex-1 items-center">
          {i > 0 && <div className="mr-3 h-8 w-px bg-border" />}
          <div className="flex flex-1 flex-col items-center">
            <span className="text-[11px] text-muted-foreground">{macro.label}</span>
            <span className="text-lg font-semibold text-ink font-tabular-nums">
              {Math.round(macro.value)}g
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function PlanItemsList({ items }: { items: MealItemDisplay[] }) {
  if (items.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">
        Nenhum item definido no plano
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0"
        >
          <div className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                CHIP_COLORS[index % CHIP_COLORS.length],
              )}
            />
            <span className="truncate text-sm text-ink">{item.name}</span>
          </div>
          <span className="shrink-0 pl-2 text-sm text-muted-foreground font-tabular-nums">
            {item.quantity}
            {item.unit} · {formatKcal(item.kcal)} kcal
          </span>
        </div>
      ))}
    </div>
  )
}

export function MealDetailView({
  meal,
  planId,
  logDateKey,
  canLog,
  existingLog,
}: MealDetailViewProps) {
  const router = useRouter()
  const Icon = getMealIcon(meal.name)
  const suggestion = formatMealSuggestion(meal.items)
  const registerKcal = existingLog?.parsedKcal ?? meal.kcalConsumed ?? meal.kcalTarget
  const isLogged = isMealLogged(meal.status)
  const logDate = parseDateKey(logDateKey)
  const readOnlyMessage = !canLog
    ? isFutureDate(logDate)
      ? `Você poderá registrar esta refeição ${formatMealLogDateLabel(logDate)}.`
      : "Este dia está fora do período permitido para registro."
    : null

  return (
    <PageContainer className="space-y-0 px-0 py-0 lg:max-w-lg lg:space-y-6 lg:px-4 lg:py-8">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-canvas/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => router.push("/meals")}
          className="flex size-10 items-center justify-center text-primary transition-opacity hover:opacity-80"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 truncate px-2 text-center text-base font-bold text-primary">
          {meal.name}
        </h1>
        <div className="size-10" />
      </header>

      {/* Desktop hero */}
      <div className="relative hidden h-36 w-full overflow-hidden rounded-xl lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-signature-teal/30 via-signature-cream/40 to-signature-peach/30" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="size-16 text-primary/40" />
        </div>
        <button
          type="button"
          onClick={() => router.push("/meals")}
          className="absolute left-4 top-4 flex size-9 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur transition-colors hover:bg-canvas"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      <div
        className={cn(
          "flex flex-col gap-6 px-4 py-6 lg:px-0 lg:py-0 lg:pb-0",
          canLog
            ? "pb-[calc(10rem+env(safe-area-inset-bottom,0px))]"
            : "pb-8",
        )}
      >
        {/* Title block */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3 lg:mt-0">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary lg:hidden">
              <Icon className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold leading-tight text-ink lg:text-[28px]">
                {meal.name}
              </h2>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {formatMealHour(meal.windowStart)}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <Flame className="size-4" />
                  {formatKcal(meal.kcalTarget)} kcal
                </span>
              </p>
            </div>
          </div>

          <KcalComparison
            target={meal.kcalTarget}
            register={registerKcal}
            isLogged={isLogged || !isTodayDate(logDate)}
          />

          {meal.items.length > 0 && <MacrosBar items={meal.items} />}
        </section>

        {/* Plan suggestion */}
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Sugestão do Nutricionista
          </h3>
          <p className="text-base font-medium leading-relaxed text-ink lg:hidden">
            {suggestion}
          </p>
          <div className="mt-3 lg:mt-0">
            <h4 className="mb-2 hidden text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:block">
              Itens da Refeição
            </h4>
            <PlanItemsList items={meal.items} />
          </div>
        </section>

        <div className="flex items-start gap-2 px-1 text-muted-foreground">
          <Pencil className="mt-0.5 size-4 shrink-0" />
          <p className="text-xs leading-relaxed">
            {canLog
              ? "Selecione os itens do plano abaixo ou descreva o que comeu se foi diferente da sugestão."
              : readOnlyMessage}
          </p>
        </div>

        {/* Interactive log */}
        <MealLogSection
          mealItems={meal.items}
          planId={planId}
          mealId={meal.id}
          kcalTarget={meal.kcalTarget}
          existingLog={existingLog}
          isEaten={isLogged}
          logDateKey={logDateKey}
          canLog={canLog}
        />
      </div>
    </PageContainer>
  )
}
