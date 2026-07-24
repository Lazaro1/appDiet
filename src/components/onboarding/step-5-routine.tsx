"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import type { Step5Data } from "@/lib/onboarding/types"
import { UtensilsCrossed, Clock } from "lucide-react"

interface Step5Props {
  data: Partial<Step5Data>
  onChange: (field: keyof Step5Data, value: string) => void
  errors: Partial<Record<keyof Step5Data, string>>
}

export function Step5Routine({ data, onChange, errors }: Step5Props) {
  const selectedMeals = data.mealsPerDay ? MEAL_PRESETS[data.mealsPerDay] : null

  return (
    <div className="flex flex-col gap-6">
      {/* Meals per day */}
      <div className="flex flex-col gap-3">
        <Label>Refeições por dia</Label>
        <RadioGroup
          value={data.mealsPerDay?.toString() ?? ""}
          onValueChange={(value) => onChange("mealsPerDay", value)}
          className="grid grid-cols-2 gap-3"
        >
          {[3, 4, 5, 6].map((num) => (
            <label
              key={num}
              className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <RadioGroupItem value={num.toString()} className="sr-only" />
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary group-has-[:checked]:bg-primary group-has-[:checked]:text-on-primary">
                <UtensilsCrossed className="size-6" />
              </div>
              <span className="text-2xl font-semibold">{num}</span>
              <span className="text-sm text-muted-foreground">refeições</span>
            </label>
          ))}
        </RadioGroup>
        {errors.mealsPerDay && (
          <p className="text-sm text-destructive">{errors.mealsPerDay}</p>
        )}
      </div>

      {/* Meal schedule preview */}
      {selectedMeals && (
        <div className="flex flex-col gap-3">
          <Label className="flex items-center gap-2">
            <Clock className="size-4" />
            Horários sugeridos
          </Label>
          <div className="flex flex-col gap-2">
            {selectedMeals.map((meal, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="text-base font-medium">{meal.name}</span>
                <span className="text-sm text-muted-foreground">
                  {String(meal.windowStart).padStart(2, "0")}h –{" "}
                  {String(meal.windowEnd).padStart(2, "0")}h
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Você pode ajustar os horários depois
          </p>
        </div>
      )}
    </div>
  )
}
