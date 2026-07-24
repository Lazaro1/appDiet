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
import { Loader2, X } from "lucide-react"

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
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
  selectedItems?: SelectedItem[]
  onRemoveItem?: (id: string) => void
}

export function MealLogForm({
  mealId,
  kcalTarget,
  existingLog,
  selectedItems = [],
  onRemoveItem,
}: MealLogFormProps) {
  const router = useRouter()
  const toast = useToast()
  const { markMealEaten, markMealSkipped } = useDay()
  const [text, setText] = useState(existingLog?.rawText ?? "")
  const [result, setResult] = useState<{
    parsedKcal: number
    conformant: boolean
    items: ParsedItem[]
  } | null>(
    existingLog?.parsedKcal
      ? {
          parsedKcal: existingLog.parsedKcal,
          conformant: existingLog.conformant ?? false,
          items: [],
        }
      : null,
  )

  const logAction = useAsyncAction(async () => {
    const chipsText = selectedItems.map((i) => i.label).join(", ")
    const combined = [chipsText, text.trim()].filter(Boolean).join(", ")
    if (!combined) throw new Error("Adicione itens ou descreva o que você comeu")

    const res = await fetch(`/api/meals/${mealId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: combined }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao registrar")

    const log = json.data?.log
    markMealEaten(mealId, log?.parsedKcal ?? 0, log?.conformant ?? false)
    setResult({
      parsedKcal: log?.parsedKcal ?? 0,
      conformant: log?.conformant ?? false,
      items: json.data?.items ?? [],
    })
    toast.success("Refeição registrada!")
    router.push("/")
    router.refresh()
  })

  const skipAction = useAsyncAction(async () => {
    const res = await fetch(`/api/meals/${mealId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "skip" }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao pular")

    markMealSkipped(mealId)
    toast.toast("Refeição marcada como pulada", "info")
    router.push("/")
    router.refresh()
  })

  const busy = logAction.loading || skipAction.loading
  const error = logAction.error ?? skipAction.error

  return (
    <div className="space-y-4">
      {selectedItems.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm text-ink"
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
        placeholder="Adicione observações ou itens fora do plano"
        className="min-h-[120px]"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => skipAction.run()}
          disabled={busy}
          className="flex-1"
        >
          {skipAction.loading ? <Loader2 className="animate-spin" /> : "Pulei"}
        </Button>
        <Button onClick={() => logAction.run()} disabled={busy} className="flex-1">
          {logAction.loading ? <Loader2 className="animate-spin" /> : "Registrar"}
        </Button>
      </div>
      {result && (
        <MealParseResult
          kcalTarget={kcalTarget}
          parsedKcal={result.parsedKcal}
          conformant={result.conformant}
          items={result.items}
        />
      )}
    </div>
  )
}
