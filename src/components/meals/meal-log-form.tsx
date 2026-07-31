"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MealParseResult } from "./meal-parse-result"
import type { SelectedItem } from "./meal-log-section"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useToast } from "@/components/providers/toast-provider"
import { useDay } from "@/components/providers/day-provider"
import { Loader2, CheckCircle2, PlusCircle, SkipForward, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MealStatus } from "@/lib/nutrition/meal-status"
import { isTodayDate, parseDateKey } from "@/lib/nutrition/meal-dates"

interface ParsedItem {
  foodName: string
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}

interface MealLogFormProps {
  mealId: string
  kcalTarget: number
  logDateKey: string
  canLog?: boolean
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
  selectedItems?: SelectedItem[]
  onRemoveItem?: (id: string) => void
  isEaten?: boolean
}

export function MealLogForm({
  mealId,
  kcalTarget,
  logDateKey,
  canLog = true,
  existingLog,
  selectedItems = [],
  onRemoveItem,
  isEaten = false,
}: MealLogFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { markMealEaten, markMealSkipped } = useDay()
  const [text, setText] = useState(existingLog?.rawText ?? "")
  const [result, setResult] = useState<{
    parsedKcal: number
    conformant: boolean
    items: ParsedItem[]
  } | null>(null)

  const logAction = useAsyncAction(async () => {
    const chipsText = selectedItems.map((i) => i.label).join(", ")
    const combined = [chipsText, text.trim()].filter(Boolean).join(", ")
    if (!combined) throw new Error("Adicione itens ou descreva o que você comeu")

    const res = await fetch(`/api/meals/${mealId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: combined, date: logDateKey }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao registrar")

    const log = json.data?.log
    const mealStatus: MealStatus =
      log?.status === "out_of_window" ? "out_of_window" : "eaten"
    if (isTodayDate(parseDateKey(logDateKey))) {
      markMealEaten(
        mealId,
        log?.parsedKcal ?? 0,
        log?.conformant ?? false,
        mealStatus,
      )
    }
    setResult({
      parsedKcal: log?.parsedKcal ?? 0,
      conformant: log?.conformant ?? false,
      items: json.data?.items ?? [],
    })
    toast.success("Refeição registrada!")
    router.push("/meals")
    router.refresh()
  })

  const skipAction = useAsyncAction(async () => {
    const res = await fetch(`/api/meals/${mealId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "skip", date: logDateKey }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao pular")

    if (isTodayDate(parseDateKey(logDateKey))) {
      markMealSkipped(mealId)
    }
    toast.toast("Refeição marcada como pulada", "info")
    router.push("/meals")
    router.refresh()
  })

  const busy = logAction.loading || skipAction.loading
  const error = logAction.error ?? skipAction.error
  const canSubmit = selectedItems.length > 0 || text.trim().length > 0

  return (
    <div className="space-y-4">
      {selectedItems.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-ink"
            >
              {item.label}
              {onRemoveItem && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="text-muted-foreground transition-colors hover:text-ink"
                  aria-label={`Remover ${item.label}`}
                >
                  <X size={14} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Descreva o que você comeu ou adicione observações..."
        className="min-h-[120px] rounded-xl border-border bg-surface text-sm"
        aria-invalid={Boolean(error)}
        disabled={!canLog}
      />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {result && (
        <MealParseResult
          kcalTarget={kcalTarget}
          parsedKcal={result.parsedKcal}
          conformant={result.conformant}
          items={result.items}
        />
      )}

      {canLog && (
      <div
        className={cn(
          "fixed inset-x-0 z-40 border-t border-border/60 bg-canvas/95 px-4 py-3 backdrop-blur-md",
          "bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]",
          "lg:static lg:z-auto lg:mt-2 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none",
        )}
      >
        <div
          className={cn(
            "mx-auto flex max-w-lg flex-col gap-2",
            !isEaten && "lg:flex-row lg:gap-3",
          )}
        >
          <Button
            onClick={() => logAction.run()}
            disabled={busy || !canSubmit}
            className={cn(
              "h-12 w-full gap-2 rounded-2xl text-sm font-semibold",
              "shadow-md shadow-primary/15 transition-shadow",
              "hover:shadow-lg hover:shadow-primary/20",
              "disabled:shadow-none",
              !isEaten ? "order-1 lg:order-2 lg:flex-[2] lg:text-base" : "lg:text-base",
            )}
          >
            {logAction.loading ? (
              <>
                <Loader2 className="size-[18px] animate-spin" />
                Salvando...
              </>
            ) : isEaten ? (
              <>
                <CheckCircle2 className="size-[18px]" />
                Atualizar refeição
              </>
            ) : (
              <>
                <PlusCircle className="size-[18px]" />
                Registrar refeição
              </>
            )}
          </Button>

          {!isEaten && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => skipAction.run()}
              disabled={busy}
              className={cn(
                "order-2 h-11 w-full gap-2 rounded-2xl text-sm font-medium text-muted-foreground",
                "hover:bg-surface hover:text-ink",
                "lg:order-1 lg:h-12 lg:flex-1 lg:border lg:border-border lg:bg-surface",
                "lg:text-base lg:font-semibold lg:text-ink lg:shadow-none lg:hover:bg-muted",
              )}
            >
              {skipAction.loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <SkipForward className="size-4 lg:hidden" />
                  <span className="lg:hidden">Pular esta refeição</span>
                  <span className="hidden lg:inline">Pular</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
