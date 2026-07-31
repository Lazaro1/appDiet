"use client"

import { AlertCircle, Check, Info, Mars, Venus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SEX_LABELS } from "@/lib/onboarding/types"
import type { Step1Data } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

interface Step1Props {
  data: Partial<Step1Data>
  onChange: (field: keyof Step1Data, value: string) => void
  errors: Partial<Record<keyof Step1Data, string>>
}

const SEX_ICONS = {
  male: Mars,
  female: Venus,
} as const

export function Step1BasicInfo({ data, onChange, errors }: Step1Props) {
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="name"
          className="text-xs font-semibold tracking-wide text-foreground uppercase"
        >
          Nome
        </Label>
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder="Seu nome completo"
            value={data.name ?? ""}
            onChange={(e) => onChange("name", e.target.value)}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={cn(
              "h-12 rounded-lg border bg-surface px-4 text-base shadow-sm",
              errors.name
                ? "border-destructive pr-11 focus-visible:border-destructive focus-visible:ring-destructive/20"
                : "border-border focus-visible:border-signature-teal focus-visible:ring-signature-teal/30",
            )}
          />
          {errors.name && (
            <AlertCircle
              className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-destructive"
              aria-hidden
            />
          )}
        </div>
        {errors.name && (
          <p
            id="name-error"
            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.name}
          </p>
        )}
      </div>

      {/* Birth date */}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="birthDate"
          className="text-xs font-semibold tracking-wide text-foreground uppercase"
        >
          Data de nascimento
        </Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate ?? ""}
          onChange={(e) => onChange("birthDate", e.target.value)}
          aria-invalid={!!errors.birthDate}
          aria-describedby={errors.birthDate ? "birthDate-error" : undefined}
          max={new Date().toISOString().split("T")[0]}
          className={cn(
            "h-12 rounded-lg border bg-surface px-4 text-base shadow-sm [color-scheme:light]",
            errors.birthDate
              ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
              : "border-border focus-visible:border-signature-teal focus-visible:ring-signature-teal/30",
          )}
        />
        {errors.birthDate && (
          <p
            id="birthDate-error"
            className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
          >
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.birthDate}
          </p>
        )}
      </div>

      {/* Sex */}
      <div className="flex flex-col gap-3">
        <Label className="text-xs font-semibold tracking-wide text-foreground uppercase lg:normal-case lg:tracking-normal">
          <span className="lg:hidden">Sexo biológico</span>
          <span className="hidden lg:inline">Sexo</span>
        </Label>

        <div className="grid grid-cols-2 gap-3 lg:gap-3">
          {Object.entries(SEX_LABELS).map(([value, label]) => {
            const selected = data.sex === value
            const Icon = SEX_ICONS[value as keyof typeof SEX_ICONS]

            return (
              <label key={value} className="cursor-pointer">
                <input
                  type="radio"
                  name="sex"
                  value={value}
                  checked={selected}
                  onChange={() => onChange("sex", value)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border p-4 shadow-sm transition-all",
                    "h-[100px] lg:h-12 lg:flex-row lg:gap-2 lg:px-4",
                    selected
                      ? "border-2 border-signature-teal bg-primary/10 lg:bg-surface-raised"
                      : "border border-border bg-surface hover:bg-surface-raised",
                  )}
                >
                  <Icon
                    className={cn(
                      "mb-2 size-8 shrink-0 lg:mb-0 lg:size-5",
                      selected ? "text-signature-teal" : "text-muted-foreground",
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "text-base font-semibold lg:text-base",
                      selected ? "text-foreground" : "font-medium text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                  {selected && (
                    <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-signature-teal text-on-primary lg:hidden">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </div>
                  )}
                </div>
              </label>
            )
          })}
        </div>

        <p className="text-[11px] font-medium text-muted-foreground lg:hidden">
          Usado para calcular suas necessidades nutricionais diárias.
        </p>

        {errors.sex && (
          <p className="flex items-center gap-1 text-[11px] font-medium text-destructive">
            <Info className="size-3.5 shrink-0" aria-hidden />
            {errors.sex}
          </p>
        )}
      </div>
    </div>
  )
}
