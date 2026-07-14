"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Step4Data } from "@/lib/onboarding/types"

interface Step4Props {
  data: Partial<Step4Data>
  onChange: (field: keyof Step4Data, value: string) => void
  errors: Partial<Record<keyof Step4Data, string>>
}

export function Step4Restrictions({ data, onChange, errors }: Step4Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Restrictions */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="restrictions">Alergias e intolerâncias</Label>
        <textarea
          id="restrictions"
          placeholder="Ex: lactose, glúten, amendoim..."
          value={data.restrictions ?? ""}
          onChange={(e) => onChange("restrictions", e.target.value)}
          className="flex min-h-[100px] w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Separe por vírgula se houver mais de uma
        </p>
        {errors.restrictions && (
          <p className="text-sm text-danger">{errors.restrictions}</p>
        )}
      </div>

      {/* Conditions */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="conditions">Condições de saúde</Label>
        <textarea
          id="conditions"
          placeholder="Ex: diabetes tipo 2, hipertensão..."
          value={data.conditions ?? ""}
          onChange={(e) => onChange("conditions", e.target.value)}
          className="flex min-h-[100px] w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          Informe condições que possam afetar sua alimentação
        </p>
        {errors.conditions && (
          <p className="text-sm text-danger">{errors.conditions}</p>
        )}
      </div>

      {/* Preferences */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="preferences">Preferências alimentares</Label>
        <textarea
          id="preferences"
          placeholder="Ex: vegetariano, não gosto de peixe, prefiro arroz integral..."
          value={data.preferences ?? ""}
          onChange={(e) => onChange("preferences", e.target.value)}
          className="flex min-h-[100px] w-full rounded-xl border border-border bg-transparent px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">
          O que você gosta e não gosta de comer
        </p>
        {errors.preferences && (
          <p className="text-sm text-danger">{errors.preferences}</p>
        )}
      </div>
    </div>
  )
}
