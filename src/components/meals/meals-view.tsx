"use client"

import { useCallback, useMemo, useState } from "react"
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Lightbulb,
  Loader2,
  Timer,
} from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { CalorieBar } from "@/components/ui/calorie-bar"
import { MealQuickView } from "@/components/meals/meal-quick-view"
import { buildDaySnapshot } from "@/lib/nutrition/day"
import {
  formatMealHour,
  formatMonthYear,
  formatWeekdayShort,
  getDailyTip,
  getMealIcon,
  getMealVisualState,
  getWeekDays,
  isSameDay,
  toDateKey,
  type MealsPageMeal,
  type MealVisualState,
} from "@/lib/nutrition/meal-display"
import { canLogMealsForDate } from "@/lib/nutrition/meal-dates"
import { formatKcal } from "@/lib/nutrition/format"
import { isMealLogged } from "@/lib/nutrition/meal-status"
import { cn } from "@/lib/utils"

interface MealsViewProps {
  planMeals: MealsPageMeal[]
  dailyTarget: number
  initialConsumed: number
  initialDate: string
}

interface DayData {
  meals: MealsPageMeal[]
  consumedToday: number
}

const MOBILE_BORDER: Record<MealVisualState, string> = {
  eaten: "bg-success",
  pending: "bg-primary",
  skipped: "bg-muted-foreground",
  out_of_window: "bg-accent-warm",
  future: "bg-accent-warm",
}

const MOBILE_ICON: Record<MealVisualState, string> = {
  eaten: "bg-success/10 text-success",
  pending: "bg-primary/10 text-primary",
  skipped: "bg-muted/30 text-muted-foreground",
  out_of_window: "bg-accent-warm/10 text-accent-warm",
  future: "bg-accent-warm/10 text-accent-warm",
}

const DESKTOP_BORDER: Record<MealVisualState, string> = {
  eaten: "border-l-success",
  pending: "border-l-signature-teal",
  skipped: "border-l-muted-foreground",
  out_of_window: "border-l-signature-warm",
  future: "border-l-signature-warm",
}

function mergeSnapshot(
  planMeals: MealsPageMeal[],
  snapshot: ReturnType<typeof buildDaySnapshot>,
): MealsPageMeal[] {
  return planMeals.map((meal) => {
    const snap = snapshot.meals.find((m) => m.id === meal.id)
    if (!snap) return meal
    return {
      ...meal,
      kcalConsumed: snap.kcalConsumed,
      status: snap.status,
      conformant: snap.conformant,
    }
  })
}

function MobileMealCard({
  meal,
  now,
  onSelect,
}: {
  meal: MealsPageMeal
  now: Date
  onSelect: () => void
}) {
  const visual = getMealVisualState(meal.status, meal.windowStart, now)
  const Icon = getMealIcon(meal.name)
  const isLogged = isMealLogged(meal.status)
  const kcal = meal.kcalConsumed ?? meal.kcalTarget

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl border border-border bg-surface text-left shadow-sm transition-colors hover:bg-surface-raised",
        meal.status === "skipped" && "opacity-80",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 z-10 w-1 transition-all group-hover:w-1.5",
          MOBILE_BORDER[visual],
        )}
      />
      <div className="flex items-center justify-between p-3 pl-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              MOBILE_ICON[visual],
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-ink">{meal.name}</h3>
            <span className="text-[11px] text-muted-foreground">
              {formatMealHour(meal.windowStart)}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-lg font-semibold text-ink font-tabular-nums">
            {formatKcal(kcal)}
            <span className="ml-1 text-[11px] font-normal text-muted-foreground">
              kcal{isLogged ? "" : " (meta)"}
            </span>
          </span>
          <MealStatusPill visual={visual} />
        </div>
      </div>
    </button>
  )
}

function DesktopMealCard({
  meal,
  now,
  onSelect,
}: {
  meal: MealsPageMeal
  now: Date
  onSelect: () => void
}) {
  const visual = getMealVisualState(meal.status, meal.windowStart, now)
  const Icon = getMealIcon(meal.name)
  const isLogged = isMealLogged(meal.status)
  const isPending = meal.status === "pending"
  const showChips = isPending && meal.items.length > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border border-border border-l-4 bg-canvas p-4 text-left shadow-sm transition-shadow hover:shadow-md",
        DESKTOP_BORDER[visual],
        meal.status === "skipped" && "opacity-75",
        showChips ? "flex flex-col gap-4" : "flex items-center justify-between",
      )}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-full",
              MOBILE_ICON[visual],
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-ink">{meal.name}</h3>
            <span className="text-sm text-muted-foreground">
              {formatMealHour(meal.windowStart)} • {formatKcal(meal.kcalTarget)}{" "}
              kcal
            </span>
          </div>
        </div>
        {isLogged ? (
          <CheckCircle2 className="size-6 shrink-0 text-success" />
        ) : (
          <DesktopStatusBadge visual={visual} />
        )}
      </div>
      {showChips && (
        <div className="flex flex-wrap gap-2 pl-16">
          {meal.items.slice(0, 2).map((item) => (
            <span
              key={item.id}
              className="rounded bg-surface px-2 py-1 text-[11px] text-body"
            >
              {item.name}
            </span>
          ))}
          {meal.items.length > 2 && (
            <span className="rounded bg-surface px-2 py-1 text-[11px] text-body">
              +{meal.items.length - 2}
            </span>
          )}
        </div>
      )}
    </button>
  )
}

function MealStatusPill({ visual }: { visual: MealVisualState }) {
  if (visual === "eaten") {
    return (
      <div className="mt-1 flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-success">
        <CheckCircle2 className="size-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Registrado
        </span>
      </div>
    )
  }
  if (visual === "future") {
    return (
      <div className="mt-1 flex items-center gap-1 rounded-full bg-accent-warm/10 px-2 py-0.5 text-accent-warm">
        <Timer className="size-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Futuro
        </span>
      </div>
    )
  }
  if (visual === "skipped") {
    return (
      <div className="mt-1 flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Pulada
        </span>
      </div>
    )
  }
  if (visual === "out_of_window") {
    return (
      <div className="mt-1 flex items-center gap-1 rounded-full bg-accent-warm/10 px-2 py-0.5 text-accent-warm">
        <Clock className="size-3" />
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Fora da janela
        </span>
      </div>
    )
  }
  return (
    <div className="mt-1 flex items-center gap-1 rounded-full bg-primary/20 px-2 py-0.5 text-primary">
      <Clock className="size-3" />
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        Pendente
      </span>
    </div>
  )
}

function DesktopStatusBadge({ visual }: { visual: MealVisualState }) {
  if (visual === "future") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-accent-warm/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-accent-warm">
        <Timer className="size-4" />
        Futuro
      </span>
    )
  }
  if (visual === "skipped") {
    return (
      <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pulada
      </span>
    )
  }
  if (visual === "out_of_window") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-accent-warm/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-accent-warm">
        <Clock className="size-4" />
        Fora da janela
      </span>
    )
  }
  if (visual === "eaten") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-success/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-success">
        <CheckCircle2 className="size-4" />
        Registrada
      </span>
    )
  }
  return (
    <span className="rounded-md bg-primary/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-signature-teal">
      Pendente
    </span>
  )
}

function DaySelector({
  days,
  selected,
  onSelect,
  className,
}: {
  days: Date[]
  selected: Date
  onSelect: (day: Date) => void
  className?: string
}) {
  const today = new Date()

  return (
    <div
      className={cn(
        "flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {days.map((day) => {
        const isSelected = isSameDay(day, selected)
        const isToday = isSameDay(day, today)
        const isPast = toDateKey(day) < toDateKey(today)

        return (
          <button
            key={toDateKey(day)}
            type="button"
            onClick={() => onSelect(day)}
            className={cn(
              "flex shrink-0 flex-col items-center justify-center rounded-xl transition-colors",
              isSelected
                ? "min-w-14 border border-primary/20 bg-primary/20 px-3 py-2 text-primary shadow-sm"
                : isPast
                  ? "h-16 w-12 bg-surface text-muted-foreground"
                  : "h-16 w-12 border border-border bg-canvas text-ink",
            )}
          >
            <span
              className={cn(
                "text-[11px] font-semibold uppercase tracking-wider",
                isSelected ? "opacity-90" : "opacity-70",
              )}
            >
              {formatWeekdayShort(day)}
            </span>
            <span
              className={cn(
                "mt-1 text-lg font-semibold font-tabular-nums",
                isSelected && "font-bold",
              )}
            >
              {day.getDate()}
            </span>
            {isSelected && (
              <span className="mt-1 size-1 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export function MealsView({
  planMeals,
  dailyTarget,
  initialConsumed,
  initialDate,
}: MealsViewProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate + "T12:00:00"))
  const [dayData, setDayData] = useState<DayData>({
    meals: planMeals,
    consumedToday: initialConsumed,
  })
  const [loading, setLoading] = useState(false)
  const [selectedMeal, setSelectedMeal] = useState<MealsPageMeal | null>(null)

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])
  const today = new Date()
  const isToday = isSameDay(selectedDate, today)
  const now = isToday ? today : selectedDate
  const selectedDateKey = toDateKey(selectedDate)
  const canLogSelectedDay = canLogMealsForDate(selectedDate)
  const dailyTip = getDailyTip(selectedDate)
  const progressPct =
    dailyTarget > 0
      ? Math.min((dayData.consumedToday / dailyTarget) * 100, 100)
      : 0

  const handleMealSkipped = useCallback((mealId: string) => {
    setDayData((prev) => {
      const skipped = prev.meals.find((m) => m.id === mealId)
      const removedKcal = skipped?.kcalConsumed ?? 0
      return {
        meals: prev.meals.map((m) =>
          m.id === mealId
            ? { ...m, status: "skipped" as const, kcalConsumed: undefined, conformant: undefined }
            : m,
        ),
        consumedToday: Math.max(0, prev.consumedToday - removedKcal),
      }
    })
    setSelectedMeal((prev) =>
      prev?.id === mealId
        ? { ...prev, status: "skipped", kcalConsumed: undefined, conformant: undefined }
        : prev,
    )
  }, [])

  const loadDay = useCallback(
    async (date: Date) => {
      const key = toDateKey(date)
      if (key === initialDate) {
        setDayData({ meals: planMeals, consumedToday: initialConsumed })
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/meals?date=${key}`)
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)

        const snapshot = buildDaySnapshot({
          meals: json.data.meals.map(
            (m: {
              id: string
              name: string
              windowStart: number
              windowEnd: number
              kcalTarget: number
            }) => ({
              id: m.id,
              name: m.name,
              windowStart: m.windowStart,
              windowEnd: m.windowEnd,
              kcalTarget: m.kcalTarget,
            }),
          ),
          logs: json.data.logs,
          dailyTarget,
          hasActivePlan: true,
          now: date,
        })

        setDayData({
          meals: mergeSnapshot(planMeals, snapshot),
          consumedToday: snapshot.consumedToday,
        })
      } catch {
        setDayData({ meals: planMeals, consumedToday: 0 })
      } finally {
        setLoading(false)
      }
    },
    [dailyTarget, initialConsumed, initialDate, planMeals],
  )

  const handleSelectDay = (day: Date) => {
    setSelectedDate(day)
    void loadDay(day)
  }

  return (
    <PageContainer className="space-y-0 px-0 py-0 lg:space-y-6 lg:px-4 lg:py-8">
      {/* ── MOBILE ─────────────────────────────────────── */}
      <div className="lg:hidden">
        <section className="sticky top-0 z-30 border-b border-border bg-canvas/90 px-4 py-3 backdrop-blur-md">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-lg font-semibold capitalize text-ink">
              {formatMonthYear(selectedDate)}
            </h2>
            <button
              type="button"
              onClick={() => handleSelectDay(today)}
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary"
            >
              Hoje
              <ChevronDown className="size-4" />
            </button>
          </div>
          <DaySelector
            days={weekDays}
            selected={selectedDate}
            onSelect={handleSelectDay}
          />
        </section>

        <section className="px-4 py-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-muted-foreground">
                Consumido / Meta
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-semibold text-ink font-tabular-nums">
                  {formatKcal(dayData.consumedToday)}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  / {formatKcal(dailyTarget)} kcal
                </span>
              </div>
            </div>
            <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-signature-teal transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-3 px-4 pb-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            dayData.meals.map((meal) => (
              <MobileMealCard
                key={meal.id}
                meal={meal}
                now={now}
                onSelect={() => setSelectedMeal(meal)}
              />
            ))
          )}

          <div className="mt-1 flex items-start gap-3 rounded-xl border border-accent-warm/20 bg-signature-cream/40 p-3">
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-warm/20">
              <Lightbulb className="size-[18px] text-accent-warm" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-accent-warm">
                Dica do Dia
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-ink">{dailyTip}</p>
            </div>
          </div>
        </section>
      </div>

      {/* ── DESKTOP ────────────────────────────────────── */}
      <div className="hidden space-y-6 lg:block">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[28px] font-bold tracking-tight text-ink">
              Plano Alimentar
            </h1>
            <button
              type="button"
              onClick={() => handleSelectDay(today)}
              className="flex size-10 items-center justify-center rounded-full bg-surface text-primary transition-colors hover:bg-surface-raised"
            >
              <CalendarDays className="size-5" />
            </button>
          </div>

          <DaySelector
            days={weekDays}
            selected={selectedDate}
            onSelect={handleSelectDay}
            className="gap-3"
          />

          <div className="mt-1 flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Consumo Diário
              </span>
              <span className="text-sm font-bold text-primary font-tabular-nums">
                {formatKcal(dayData.consumedToday)} / {formatKcal(dailyTarget)} kcal
              </span>
            </div>
            <CalorieBar
              consumed={dayData.consumedToday}
              target={dailyTarget}
              showRemaining={false}
              size="md"
            />
          </div>
        </header>

        <section className="flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : (
            dayData.meals.map((meal) => (
              <DesktopMealCard
                key={meal.id}
                meal={meal}
                now={now}
                onSelect={() => setSelectedMeal(meal)}
              />
            ))
          )}
        </section>
      </div>

      <MealQuickView
        meal={selectedMeal}
        open={selectedMeal !== null}
        onClose={() => setSelectedMeal(null)}
        logDateKey={selectedDateKey}
        canLog={canLogSelectedDay}
        onMealSkipped={handleMealSkipped}
      />
    </PageContainer>
  )
}
