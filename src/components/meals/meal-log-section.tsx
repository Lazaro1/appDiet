"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SwapSheetTrigger } from "@/components/meals/swap-sheet"
import { MealLogForm } from "@/components/meals/meal-log-form"
import { formatKcal } from "@/lib/nutrition/format"
import type { SwapSuggestion } from "@/lib/nutrition/swap-types"
import { Check, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MealItem {
  id: string
  name: string
  quantity: number
  unit: string
  kcal: number
  protein: number
}

export interface SelectedItem {
  id: string
  label: string
}

interface MealLogSectionProps {
  mealItems: MealItem[]
  planId: string
  mealId: string
  kcalTarget: number
  logDateKey: string
  canLog?: boolean
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
  isEaten?: boolean
}

export function MealLogSection({
  mealItems,
  planId,
  mealId,
  kcalTarget,
  logDateKey,
  canLog = true,
  existingLog,
  isEaten = false,
}: MealLogSectionProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const addItem = (item: MealItem) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [
        ...prev,
        { id: item.id, label: `${item.name} (${item.quantity}${item.unit})` },
      ]
    })
  }

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id))
  }

  const addSwapSuggestion = (suggestion: SwapSuggestion) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        id: `swap-${crypto.randomUUID()}`,
        label: `${suggestion.name} (${formatKcal(suggestion.kcal)} kcal, troca)`,
      },
    ])
  }

  return (
    <div className="space-y-6">
      {mealItems.length > 0 && canLog && (
        <section className="rounded-xl border border-border bg-canvas p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Adicionar do plano
          </h2>
          <ul className="mt-3 space-y-2">
            {mealItems.map((item) => {
              const added = selectedItems.some((i) => i.id === item.id)
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2.5",
                    added && "border-primary/30 bg-primary/5",
                  )}
                >
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">
                      {item.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.quantity}
                      {item.unit} ·{" "}
                      <span className="font-tabular-nums">
                        {formatKcal(item.kcal)} kcal
                      </span>
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <SwapSheetTrigger
                      planId={planId}
                      mealId={mealId}
                      mealItemId={item.id}
                      logDateKey={logDateKey}
                      itemName={item.name}
                      itemKcal={item.kcal}
                      itemProtein={item.protein}
                      mealKcalTarget={kcalTarget}
                      onUseSuggestion={addSwapSuggestion}
                    />
                    <Button
                      variant={added ? "secondary" : "outline"}
                      size="xs"
                      type="button"
                      onClick={() => addItem(item)}
                      disabled={added}
                      className="rounded-lg"
                    >
                      {added ? (
                        <Check className="size-3.5" />
                      ) : (
                        <Plus className="size-3.5" />
                      )}
                      {added ? "Ok" : "Add"}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {canLog && (
      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          O que você comeu?
        </h2>
        <MealLogForm
          mealId={mealId}
          kcalTarget={kcalTarget}
          existingLog={existingLog}
          selectedItems={selectedItems}
          onRemoveItem={removeItem}
          isEaten={isEaten}
          logDateKey={logDateKey}
          canLog={canLog}
        />
      </section>
      )}

      {!canLog && existingLog?.rawText && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            O que você comeu
          </h2>
          <p className="text-sm leading-relaxed text-ink">{existingLog.rawText}</p>
        </section>
      )}
    </div>
  )
}
