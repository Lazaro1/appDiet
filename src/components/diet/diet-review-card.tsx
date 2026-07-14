"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { formatKcal, formatTimeWindow } from "@/lib/nutrition/format"
import { cn } from "@/lib/utils"

interface MealItem {
  id: string
  name: string
  quantity: number
  unit: string
  kcal: number
  protein: number
}

interface Meal {
  id: string
  name: string
  kcalTarget: number
  windowStart: number
  windowEnd: number
  mealItems: MealItem[]
}

interface DietReviewCardProps {
  meal: Meal
}

export function DietReviewCard({ meal }: DietReviewCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-4 text-left"
      >
        <div>
          <h3 className="font-semibold text-ink">{meal.name}</h3>
          <p className="text-xs text-muted-foreground">
            {formatTimeWindow(meal.windowStart, meal.windowEnd)} · {formatKcal(meal.kcalTarget)} kcal meta
          </p>
        </div>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <div className={cn("border-t border-border px-4 pb-4", !expanded && "hidden")}>
        <ul className="mt-3 space-y-2">
          {meal.mealItems.map((item) => (
            <li key={item.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {item.name}{" "}
                <span className="text-muted-foreground">
                  ({item.quantity}{item.unit})
                </span>
              </span>
              <span className="font-tabular-nums text-muted-foreground">
                {formatKcal(item.kcal)} kcal · {item.protein}g prot
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
