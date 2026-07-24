"use client"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
} from "@/lib/onboarding/types"
import type { Step3Data } from "@/lib/onboarding/types"
import type { Goal, ActivityLevel } from "@/generated/prisma"
import { Scale, TrendingUp, Minus, Dumbbell } from "lucide-react"

const GOAL_ICONS: Record<string, React.ReactNode> = {
  lose: <Scale className="size-5" />,
  gain: <TrendingUp className="size-5" />,
  maintain: <Minus className="size-5" />,
}

interface Step3Props {
  data: Partial<Step3Data>
  onChange: (field: keyof Step3Data, value: string) => void
  errors: Partial<Record<keyof Step3Data, string>>
}

export function Step3GoalActivity({ data, onChange, errors }: Step3Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Goal */}
      <div className="flex flex-col gap-3">
        <Label>Objetivo</Label>
        <RadioGroup
          value={data.goal ?? ""}
          onValueChange={(value) => onChange("goal", value as string)}
          className="grid gap-3"
        >
          {Object.entries(GOAL_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <RadioGroupItem value={value} />
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                {GOAL_ICONS[value]}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">
                  {GOAL_DESCRIPTIONS[value]}
                </span>
              </div>
            </label>
          ))}
        </RadioGroup>
        {errors.goal && (
          <p className="text-sm text-destructive">{errors.goal}</p>
        )}
      </div>

      {/* Activity Level */}
      <div className="flex flex-col gap-3">
        <Label>Nível de atividade</Label>
        <RadioGroup
          value={data.activityLevel ?? ""}
          onValueChange={(value) => onChange("activityLevel", value as string)}
          className="grid grid-cols-2 gap-3"
        >
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <RadioGroupItem value={value} />
              <div className="flex flex-col">
                <span className="text-base font-medium">{label}</span>
                <span className="text-sm text-muted-foreground">
                  {ACTIVITY_DESCRIPTIONS[value]}
                </span>
              </div>
            </label>
          ))}
        </RadioGroup>
        {errors.activityLevel && (
          <p className="text-sm text-destructive">{errors.activityLevel}</p>
        )}
      </div>
    </div>
  )
}
