"use client"

import { Info, Sparkles, UtensilsCrossed } from "lucide-react"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import type { Step5Data } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

interface CaloriePreview {
  bmr: number
  tdee: number
  dailyKcalTarget: number
  macros: { protein: number; carbs: number; fat: number }
}

interface Step5Props {
  data: Partial<Step5Data>
  onChange: (field: keyof Step5Data, value: string) => void
  errors: Partial<Record<keyof Step5Data, string>>
  calculated?: CaloriePreview | null
  goalLabel?: string
}

const MEAL_OPTIONS = [3, 4, 5, 6] as const

const DESKTOP_BORDER_COLORS = [
  "border-l-primary",
  "border-l-signature-sage",
] as const

function formatWindow(start: number, end: number) {
  return `${String(start).padStart(2, "0")}h – ${String(end).padStart(2, "0")}h`
}

function formatDesktopTime(hour: number) {
  return `${String(hour).padStart(2, "0")}:00`
}

function CaloriePreviewCard({
  calculated,
  goalLabel,
}: {
  calculated: CaloriePreview
  goalLabel?: string
}) {
  return (
    <>
      {/* Mobile layout */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-primary/10 p-4 shadow-sm lg:hidden">
        <div className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/5 blur-2xl" aria-hidden />
        <div className="relative z-10 mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-4" aria-hidden />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Sua meta calórica</h3>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-x-4 gap-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Metabolismo basal
            </span>
            <span className="text-base font-semibold font-tabular-nums text-foreground">
              {calculated.bmr} kcal
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
              Gasto total
            </span>
            <span className="text-base font-semibold font-tabular-nums text-foreground">
              {calculated.tdee} kcal
            </span>
          </div>
          <div className="col-span-2 mt-1 flex flex-col gap-1">
            <span className="text-[11px] font-bold tracking-wider text-primary uppercase">
              Meta diária{goalLabel ? ` (${goalLabel})` : ""}
            </span>
            <span className="text-[28px] leading-none font-bold font-tabular-nums text-primary">
              {calculated.dailyKcalTarget} kcal
            </span>
          </div>
          <div className="col-span-2 mt-1 flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border/30 bg-canvas/50 p-2">
            <span className="text-[11px] font-semibold text-body">Macros:</span>
            <span className="text-[11px] text-muted-foreground">
              Proteína <strong className="text-foreground">{calculated.macros.protein}g</strong>
            </span>
            <span className="text-border">|</span>
            <span className="text-[11px] text-muted-foreground">
              Carboidrato <strong className="text-foreground">{calculated.macros.carbs}g</strong>
            </span>
            <span className="text-border">|</span>
            <span className="text-[11px] text-muted-foreground">
              Gordura <strong className="text-foreground">{calculated.macros.fat}g</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="relative hidden overflow-hidden rounded-xl border border-border bg-signature-cream p-4 shadow-sm lg:block">
        <div
          className="pointer-events-none absolute -top-10 -right-10 size-32 rounded-full bg-signature-peach/20 blur-2xl"
          aria-hidden
        />
        <h3 className="relative mb-4 text-lg font-semibold text-foreground">
          Sua meta calórica
        </h3>
        <div className="relative mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface/60 p-3 backdrop-blur-sm">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">Taxa basal</p>
            <p className="text-base font-medium font-tabular-nums text-foreground">
              {calculated.bmr} kcal
            </p>
          </div>
          <div className="rounded-lg bg-surface/60 p-3 backdrop-blur-sm">
            <p className="mb-1 text-[11px] font-medium text-muted-foreground">Gasto total</p>
            <p className="text-base font-medium font-tabular-nums text-foreground">
              {calculated.tdee} kcal
            </p>
          </div>
        </div>
        <div className="relative flex items-end justify-between border-t border-signature-peach pt-3">
          <p className="text-base font-medium text-foreground">Meta diária</p>
          <p className="text-[36px] leading-none font-extrabold font-tabular-nums text-primary">
            {calculated.dailyKcalTarget}{" "}
            <span className="text-xs font-semibold text-primary/70">kcal</span>
          </p>
        </div>
      </div>
    </>
  )
}

export function Step5Routine({
  data,
  onChange,
  errors,
  calculated,
  goalLabel,
}: Step5Props) {
  const selectedMeals = data.mealsPerDay ? MEAL_PRESETS[data.mealsPerDay] : null

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {/* Meals per day */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          <span className="lg:hidden">Refeições por dia</span>
          <span className="hidden lg:inline">Quantas refeições por dia?</span>
        </h2>

        {/* Mobile: 2×2 icon cards */}
        <div className="grid grid-cols-2 gap-3 lg:hidden">
          {MEAL_OPTIONS.map((num) => {
            const selected = data.mealsPerDay === num

            return (
              <label key={num} className="cursor-pointer">
                <input
                  type="radio"
                  name="mealsPerDay"
                  value={num}
                  checked={selected}
                  onChange={() => onChange("mealsPerDay", String(num))}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border p-4 shadow-sm transition-all",
                    selected
                      ? "border-2 border-signature-teal bg-primary/10 shadow-md"
                      : "border-border bg-surface hover:border-border hover:bg-surface-raised",
                  )}
                >
                  <div
                    className={cn(
                      "mb-2 flex size-10 items-center justify-center rounded-full transition-colors",
                      selected
                        ? "bg-signature-teal text-on-primary"
                        : "bg-surface-raised text-muted-foreground",
                    )}
                  >
                    <UtensilsCrossed className="size-5" aria-hidden />
                  </div>
                  <span
                    className={cn(
                      "text-[28px] leading-none font-bold font-tabular-nums",
                      selected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {num}
                  </span>
                  <span
                    className={cn(
                      "mt-1 text-xs font-semibold tracking-wide",
                      selected ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    refeições
                  </span>
                </div>
              </label>
            )
          })}
        </div>

        {/* Desktop: compact number pills */}
        <div className="hidden grid-cols-4 gap-2 lg:grid">
          {MEAL_OPTIONS.map((num) => {
            const selected = data.mealsPerDay === num

            return (
              <label key={num} className="cursor-pointer">
                <input
                  type="radio"
                  name="mealsPerDay"
                  value={num}
                  checked={selected}
                  onChange={() => onChange("mealsPerDay", String(num))}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg border py-3 text-lg font-semibold transition-colors",
                    selected
                      ? "border-2 border-signature-teal bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-surface text-foreground hover:bg-surface-raised",
                  )}
                >
                  {num}
                </div>
              </label>
            )
          })}
        </div>

        {errors.mealsPerDay && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-destructive">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.mealsPerDay}
          </p>
        )}
      </section>

      {/* Meal schedule preview */}
      {selectedMeals && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            <span className="lg:hidden">Horários sugeridos</span>
            <span className="hidden lg:inline">Sugestão de horários</span>
          </h2>

          {/* Mobile: divided list */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm lg:hidden">
            {selectedMeals.map((meal, i) => (
              <div
                key={meal.name}
                className={cn(
                  "flex items-center justify-between px-3 py-3",
                  i > 0 && "border-t border-border/50",
                )}
              >
                <span className="text-base font-medium text-foreground">{meal.name}</span>
                <span className="text-sm font-medium font-tabular-nums text-muted-foreground">
                  {formatWindow(meal.windowStart, meal.windowEnd)}
                </span>
              </div>
            ))}
          </div>

          {/* Desktop: left-border accent rows */}
          <div className="hidden overflow-hidden rounded-xl border border-border bg-surface shadow-sm lg:block">
            {selectedMeals.map((meal, i) => (
              <div
                key={meal.name}
                className={cn(
                  "flex items-center justify-between border-l-4 p-4",
                  DESKTOP_BORDER_COLORS[i % DESKTOP_BORDER_COLORS.length],
                  i < selectedMeals.length - 1 && "border-b border-border",
                )}
              >
                <span className="text-base font-medium text-foreground">{meal.name}</span>
                <span className="rounded bg-surface-raised px-2 py-1 text-xs font-semibold font-tabular-nums text-muted-foreground">
                  {formatDesktopTime(meal.windowStart)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-center text-[11px] font-medium text-muted-foreground lg:text-left lg:text-sm">
            Você pode ajustar os horários depois
          </p>
        </section>
      )}

      {/* Calorie preview */}
      {calculated && (
        <section className="flex flex-col gap-3">
          <CaloriePreviewCard calculated={calculated} goalLabel={goalLabel} />
        </section>
      )}
    </div>
  )
}
