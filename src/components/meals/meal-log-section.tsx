"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SwapSheetTrigger } from "@/components/meals/swap-sheet"
import { MealLogForm } from "@/components/meals/meal-log-form"
import { formatKcal } from "@/lib/nutrition/format"
import { Plus, Check } from "lucide-react"

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
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
}

export function MealLogSection({
  mealItems,
  planId,
  mealId,
  kcalTarget,
  existingLog,
}: MealLogSectionProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const addItem = (item: MealItem) => {
    setSelectedItems((prev) => {
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, { id: item.id, label: `${item.name} (${item.quantity}${item.unit})` }]
    })
  }

  const removeItem = (id: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="space-y-6">
      {mealItems.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Plano
          </h2>
          <ul className="mt-3 space-y-2">
            {mealItems.map((item) => {
              const added = selectedItems.some((i) => i.id === item.id)
              return (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink">
                    {item.name}{" "}
                    <span className="text-muted-foreground">
                      ({item.quantity}
                      {item.unit})
                    </span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-tabular-nums text-muted-foreground">
                      {formatKcal(item.kcal)} kcal
                    </span>
                    <SwapSheetTrigger
                      planId={planId}
                      itemName={item.name}
                      itemKcal={item.kcal}
                      itemProtein={item.protein}
                      mealKcalTarget={kcalTarget}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      type="button"
                      onClick={() => addItem(item)}
                      disabled={added}
                    >
                      {added ? <Check size={14} /> : <Plus size={14} />}
                      {added ? "Adicionado" : "Adicionar"}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          O que você comeu?
        </h2>
        <MealLogForm
          mealId={mealId}
          kcalTarget={kcalTarget}
          existingLog={existingLog}
          selectedItems={selectedItems}
          onRemoveItem={removeItem}
        />
      </div>
    </div>
  )
}
