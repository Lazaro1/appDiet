"use client"

import { AlertCircle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Step2Data } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

interface Step2Props {
  data: Partial<Step2Data>
  onChange: (field: "weight" | "height", value: string) => void
  errors: Partial<Record<"weight" | "height", string>>
}

export function Step2Measurements({ data, onChange, errors }: Step2Props) {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Weight */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="weight"
          className="text-xs font-semibold tracking-wide text-foreground uppercase"
        >
          Peso
        </Label>
        <div className="relative">
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            placeholder="70"
            value={data.weight ?? ""}
            onChange={(e) => onChange("weight", e.target.value)}
            aria-invalid={!!errors.weight}
            aria-describedby={errors.weight ? "weight-error" : undefined}
            className={cn(
              "h-12 rounded-xl border bg-surface px-4 pr-12 text-base shadow-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              errors.weight
                ? "border-destructive pr-12 focus-visible:border-destructive focus-visible:ring-destructive/20"
                : "border-border focus-visible:border-signature-teal focus-visible:ring-signature-teal/30",
            )}
            min={30}
            max={300}
            step={0.1}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            kg
          </span>
          {errors.weight && (
            <AlertCircle
              className="pointer-events-none absolute top-1/2 right-11 size-5 -translate-y-1/2 text-destructive"
              aria-hidden
            />
          )}
        </div>
        {errors.weight && (
          <p
            id="weight-error"
            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.weight}
          </p>
        )}
      </div>

      {/* Height */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="height"
          className="text-xs font-semibold tracking-wide text-foreground uppercase"
        >
          Altura
        </Label>
        <div className="relative">
          <Input
            id="height"
            type="number"
            inputMode="numeric"
            placeholder="170"
            value={data.height ?? ""}
            onChange={(e) => onChange("height", e.target.value)}
            aria-invalid={!!errors.height}
            aria-describedby={errors.height ? "height-error" : undefined}
            className={cn(
              "h-12 rounded-xl border bg-surface px-4 pr-12 text-base shadow-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              errors.height
                ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                : "border-border focus-visible:border-signature-teal focus-visible:ring-signature-teal/30",
            )}
            min={100}
            max={250}
            step={1}
          />
          <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-sm font-medium text-muted-foreground">
            cm
          </span>
          {errors.height && (
            <AlertCircle
              className="pointer-events-none absolute top-1/2 right-11 size-5 -translate-y-1/2 text-destructive"
              aria-hidden
            />
          )}
        </div>
        {errors.height && (
          <p
            id="height-error"
            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.height}
          </p>
        )}
      </div>
    </div>
  )
}
