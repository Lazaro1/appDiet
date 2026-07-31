"use client"

import { formatKcal, formatCalorieComparison } from "@/lib/nutrition/format"
import { AppBadge } from "@/components/ui/app-badge"

interface ParsedItem {
  foodName: string
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}

interface MealParseResultProps {
  kcalTarget: number
  parsedKcal: number
  conformant: boolean | null
  items: ParsedItem[]
}

export function MealParseResult({
  kcalTarget,
  parsedKcal,
  conformant,
  items,
}: MealParseResultProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-tabular-nums text-xl font-bold text-ink">
          {formatCalorieComparison(parsedKcal, kcalTarget)}
        </p>
        {conformant !== null && (
          <AppBadge variant={conformant ? "success" : "warning"}>
            {conformant ? "Na meta" : "Fora da meta"}
          </AppBadge>
        )}
      </div>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2 border-t border-border/50 pt-3">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between text-sm">
              <span className="text-ink">{item.foodName}</span>
              <span className="font-tabular-nums text-muted-foreground">
                {formatKcal(item.estimatedKcal)} kcal
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
