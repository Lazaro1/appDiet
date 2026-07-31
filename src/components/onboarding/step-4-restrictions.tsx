"use client"

import { Info } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Step4Data } from "@/lib/onboarding/types"
import { cn } from "@/lib/utils"

interface Step4Props {
  data: Partial<Step4Data>
  onChange: (field: keyof Step4Data, value: string) => void
  errors: Partial<Record<keyof Step4Data, string>>
}

const FIELDS: {
  key: keyof Step4Data
  label: string
  hint: string
  placeholder: string
}[] = [
  {
    key: "restrictions",
    label: "Alergias e intolerâncias",
    hint: "Separe por vírgula se houver mais de uma",
    placeholder: "Ex: lactose, glúten, amendoim...",
  },
  {
    key: "conditions",
    label: "Condições de saúde",
    hint: "Informe condições que possam afetar sua alimentação",
    placeholder: "Ex: diabetes tipo 2, hipertensão...",
  },
  {
    key: "preferences",
    label: "Preferências alimentares",
    hint: "O que você gosta e não gosta de comer",
    placeholder: "Ex: vegetariano, não gosto de peixe, prefiro arroz integral...",
  },
]

export function Step4Restrictions({ data, onChange, errors }: Step4Props) {
  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      {FIELDS.map(({ key, label, hint, placeholder }) => {
        const error = errors[key]

        return (
          <div key={key} className="flex flex-col gap-1">
            <Label
              htmlFor={key}
              className="text-base font-semibold text-foreground lg:text-lg"
            >
              {label}
            </Label>
            <p className="mb-2 text-[11px] font-medium text-muted-foreground lg:text-sm">
              {hint}
            </p>
            <Textarea
              id={key}
              placeholder={placeholder}
              value={data[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? `${key}-error` : undefined}
              rows={3}
              className={cn(
                "min-h-[100px] resize-none rounded-xl border bg-surface px-4 py-3 text-base shadow-sm",
                error
                  ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20"
                  : "border-border focus-visible:border-signature-teal focus-visible:ring-signature-teal/30",
              )}
            />
            {error && (
              <p
                id={`${key}-error`}
                className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive"
              >
                <Info className="size-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
