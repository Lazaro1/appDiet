"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  Loader2,
  Pencil,
  PlusCircle,
  X,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useToast } from "@/components/providers/toast-provider"
import { useDay } from "@/components/providers/day-provider"
import {
  formatMealHour,
  formatMealSuggestion,
  getMealIcon,
  sumMealMacros,
  toDateKey,
  type MealsPageMeal,
} from "@/lib/nutrition/meal-display"
import { formatKcal } from "@/lib/nutrition/format"
import {
  formatMealLogDateLabel,
  isFutureDate,
  isTodayDate,
  parseDateKey,
} from "@/lib/nutrition/meal-dates"
import { isMealLogged } from "@/lib/nutrition/meal-status"
import { cn } from "@/lib/utils"

interface MealQuickViewProps {
  meal: MealsPageMeal | null
  open: boolean
  onClose: () => void
  logDateKey?: string
  canLog?: boolean
  onMealSkipped?: (mealId: string) => void
}

const CHIP_COLORS = [
  "bg-signature-teal",
  "bg-signature-warm",
  "bg-signature-sage",
  "bg-signature-peach",
] as const

export function MealQuickView({
  meal,
  open,
  onClose,
  logDateKey,
  canLog = true,
  onMealSkipped,
}: MealQuickViewProps) {
  const router = useRouter()
  const toast = useToast()
  const { markMealSkipped } = useDay()
  const effectiveDateKey = logDateKey ?? toDateKey(new Date())
  const detailHref =
    effectiveDateKey === toDateKey(new Date())
      ? `/meals/${meal?.id}`
      : `/meals/${meal?.id}?date=${effectiveDateKey}`
  const logDate = parseDateKey(effectiveDateKey)

  const skipAction = useAsyncAction(async () => {
    if (!meal || !canLog) return
    const res = await fetch(`/api/meals/${meal.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "skip", date: effectiveDateKey }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao pular")

    if (isTodayDate(logDate)) {
      markMealSkipped(meal.id)
      router.refresh()
    } else {
      onMealSkipped?.(meal.id)
    }
    toast.toast("Refeição marcada como pulada", "info")
    onClose()
  })

  if (!open || !meal) return null

  const Icon = getMealIcon(meal.name)
  const suggestion = formatMealSuggestion(meal.items)
  const macros = sumMealMacros(meal.items)
  const registerKcal = meal.kcalConsumed ?? meal.kcalTarget
  const isLogged = isMealLogged(meal.status)
  const readOnlyMessage = !canLog
    ? isFutureDate(logDate)
      ? `Você poderá registrar esta refeição ${formatMealLogDateLabel(logDate)}.`
      : "Este dia está fora do período permitido para registro."
    : null

  const actionButtons = canLog ? (
    <div className="flex flex-col gap-2">
      <Link
        href={detailHref}
        className={buttonVariants({
          className: cn(
            "h-12 w-full rounded-2xl text-sm font-semibold shadow-sm lg:text-base",
          ),
        })}
      >
        {isLogged ? (
          <>
            <CheckCircle2 className="size-[18px] lg:size-4" />
            Editar refeição
          </>
        ) : (
          <>
            <PlusCircle className="size-[18px]" />
            Registrar refeição
          </>
        )}
      </Link>
      {!isLogged && (
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-2xl text-sm font-semibold lg:text-base"
          onClick={() => skipAction.run()}
          disabled={skipAction.loading}
        >
          {skipAction.loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Pular esta refeição"
          )}
        </Button>
      )}
    </div>
  ) : (
    <div className="flex items-start gap-2 rounded-xl border border-border bg-surface p-3 text-sm text-muted-foreground">
      <Clock className="mt-0.5 size-4 shrink-0" />
      <p>{readOnlyMessage}</p>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center lg:items-center lg:p-4">
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Mobile: bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[85vh] w-full max-w-[480px] flex-col overflow-hidden bg-canvas shadow-xl",
          "rounded-t-[20px] border-t border-border lg:hidden",
          "animate-in slide-in-from-bottom duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 justify-center pt-3 pb-1">
          <div className="h-1 w-9 rounded-full bg-border" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold leading-tight text-ink">
                  {meal.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {isLogged
                    ? "Refeição registrada"
                    : isFutureDate(logDate)
                      ? "Refeição futura"
                      : "Detalhes sugeridos"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-full bg-surface text-muted-foreground transition-colors hover:bg-surface-raised"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface p-3">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sugestão do Nutricionista
            </h4>
            <p className="text-base font-medium leading-relaxed text-ink">
              {suggestion}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-border bg-surface p-3">
              <span className="mb-1 text-[11px] text-muted-foreground">Meta</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-ink font-tabular-nums">
                  {formatKcal(meal.kcalTarget)}
                </span>
                <span className="text-[11px] text-muted-foreground">kcal</span>
              </div>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
            <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-primary/30 bg-surface p-3">
              <div className="pointer-events-none absolute inset-0 bg-primary/5" />
              <span className="relative mb-1 text-[11px] font-medium text-primary">
                {isLogged || !isTodayDate(logDate) ? "Consumido" : "Registrar"}
              </span>
              <div className="relative flex items-baseline gap-1">
                <span className="text-xl font-bold text-primary font-tabular-nums">
                  {formatKcal(registerKcal)}
                </span>
                <span className="text-[11px] text-primary">kcal</span>
              </div>
            </div>
          </div>

          {!isLogged && canLog && (
            <div className="flex items-start gap-2 px-1 text-muted-foreground">
              <Pencil className="mt-0.5 size-4 shrink-0" />
              <p className="text-xs">
                Você pode editar os alimentos e quantidades exatas na próxima tela
                se comeu algo diferente.
              </p>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-border bg-canvas px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {actionButtons}
        </div>
      </div>

      {/* Desktop: centered modal */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative hidden max-h-[85vh] w-full max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-canvas shadow-xl lg:flex",
          "animate-in zoom-in-95 duration-300",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 w-full bg-gradient-to-br from-signature-teal/30 via-signature-cream/40 to-signature-peach/30">
          <div className="absolute inset-0 flex items-center justify-center">
            <Icon className="size-16 text-primary/40" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur transition-colors hover:bg-canvas"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5">
          <div>
            <h2 className="text-[28px] font-bold text-ink">{meal.name}</h2>
            <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-[18px]" />
              {formatMealHour(meal.windowStart)}
              <span className="text-border">•</span>
              <Flame className="size-[18px]" />
              {formatKcal(meal.kcalTarget)} kcal
            </p>
          </div>

          <div className="flex gap-3 rounded-xl border border-border bg-surface p-3">
            {[
              { label: "Carb", value: macros.carbs },
              { label: "Prot", value: macros.protein },
              { label: "Gord", value: macros.fat },
            ].map((macro, i) => (
              <div key={macro.label} className="flex flex-1 items-center">
                {i > 0 && <div className="mr-3 h-8 w-px bg-border" />}
                <div className="flex flex-1 flex-col items-center">
                  <span className="text-[11px] text-muted-foreground">
                    {macro.label}
                  </span>
                  <span className="text-lg font-semibold text-ink font-tabular-nums">
                    {Math.round(macro.value)}g
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-1 flex flex-col gap-1">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Itens da Refeição
            </h4>
            {meal.items.length === 0 ? (
              <p className="py-2 text-sm text-muted-foreground">
                Nenhum item definido no plano
              </p>
            ) : (
              meal.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-border/50 py-2 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        CHIP_COLORS[index % CHIP_COLORS.length],
                      )}
                    />
                    <span className="text-sm text-ink">{item.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {item.quantity}
                    {item.unit}
                  </span>
                </div>
              ))
            )}
          </div>

        </div>

        <div className="shrink-0 border-t border-border bg-canvas p-5 pt-3">
          {actionButtons}
        </div>
      </div>
    </div>
  )
}
