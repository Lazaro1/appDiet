"use client"

import type { LucideIcon } from "lucide-react"
import {
  Armchair,
  Dumbbell,
  Footprints,
  Info,
  Minus,
  PersonStanding,
  Scale,
  Swords,
  TrendingUp,
} from "lucide-react"
import {
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
} from "@/lib/onboarding/types"
import type { Step3Data } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

const GOAL_OPTIONS = [
  { value: "lose" as const, icon: Scale },
  { value: "gain" as const, icon: TrendingUp },
  { value: "maintain" as const, icon: Minus },
]

const ACTIVITY_OPTIONS: {
  value: keyof typeof ACTIVITY_LABELS
  icon: LucideIcon
  wide?: boolean
}[] = [
  { value: "sedentary", icon: Armchair },
  { value: "light", icon: Footprints },
  { value: "moderate", icon: Dumbbell },
  { value: "active", icon: PersonStanding },
  { value: "very_active", icon: Swords, wide: true },
]

interface Step3Props {
  data: Partial<Step3Data>
  onChange: (field: keyof Step3Data, value: string) => void
  errors: Partial<Record<keyof Step3Data, string>>
}

function SelectionDot({
  selected,
  className,
}: {
  selected: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected ? "border-signature-teal" : "border-border",
        className,
      )}
      aria-hidden
    >
      {selected && <div className="size-2.5 rounded-full bg-signature-teal" />}
    </div>
  )
}

export function Step3GoalActivity({ data, onChange, errors }: Step3Props) {
  return (
    <div className="flex flex-col gap-8">
      {/* Goal */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Objetivo</h2>
        <div className="flex flex-col gap-3">
          {GOAL_OPTIONS.map(({ value, icon: Icon }) => {
            const selected = data.goal === value
            const label = GOAL_LABELS[value]
            const description = GOAL_DESCRIPTIONS[value]

            return (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="goal"
                  value={value}
                  checked={selected}
                  onChange={() => onChange("goal", value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "relative flex items-center gap-4 overflow-hidden rounded-xl border p-4 shadow-sm transition-all",
                    selected
                      ? "border-2 border-signature-teal bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-raised",
                  )}
                >
                  {selected && (
                    <div
                      className="pointer-events-none absolute inset-0 bg-signature-teal/5"
                      aria-hidden
                    />
                  )}
                  <div
                    className={cn(
                      "relative flex size-10 shrink-0 items-center justify-center rounded-full",
                      selected
                        ? "bg-signature-teal/20 text-signature-teal"
                        : "bg-surface-raised text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <div className="relative min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-base font-semibold",
                        selected ? "text-foreground" : "text-foreground",
                      )}
                    >
                      {label}
                    </p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                  <SelectionDot selected={selected} />
                </div>
              </label>
            )
          })}
        </div>
        {errors.goal && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-destructive">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.goal}
          </p>
        )}
      </section>

      {/* Activity Level */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Nível de atividade</h2>
        <div className="grid grid-cols-2 gap-3">
          {ACTIVITY_OPTIONS.map(({ value, icon: Icon, wide }) => {
            const selected = data.activityLevel === value
            const label = ACTIVITY_LABELS[value]
            const description = ACTIVITY_DESCRIPTIONS[value]

            return (
              <label
                key={value}
                className={cn("cursor-pointer", wide && "col-span-2")}
              >
                <input
                  type="radio"
                  name="activityLevel"
                  value={value}
                  checked={selected}
                  onChange={() => onChange("activityLevel", value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "relative h-full overflow-hidden rounded-xl border shadow-sm transition-all",
                    wide
                      ? "flex items-center justify-between gap-3 p-3 lg:flex-col lg:justify-center lg:gap-2 lg:p-4 lg:text-center"
                      : "flex flex-col justify-center p-3 lg:items-center lg:gap-2 lg:p-4 lg:text-center",
                    selected
                      ? "border-2 border-signature-teal bg-primary/10"
                      : "border-border bg-surface hover:bg-surface-raised",
                  )}
                >
                  {selected && (
                    <div
                      className="pointer-events-none absolute inset-0 bg-signature-teal/5"
                      aria-hidden
                    />
                  )}
                  <Icon
                    className={cn(
                      "relative hidden size-8 shrink-0 lg:block",
                      selected ? "text-signature-teal" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <div className={cn("relative min-w-0", wide && "flex-1 lg:flex-none")}>
                    <p
                      className={cn(
                        "text-base font-medium",
                        selected && "font-semibold text-signature-teal lg:text-signature-teal",
                      )}
                    >
                      {label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground lg:hidden">
                      {description}
                    </p>
                  </div>
                  {wide && <SelectionDot selected={selected} className="relative lg:hidden" />}
                </div>
              </label>
            )
          })}
        </div>
        {errors.activityLevel && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-destructive">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.activityLevel}
          </p>
        )}
      </section>
    </div>
  )
}
