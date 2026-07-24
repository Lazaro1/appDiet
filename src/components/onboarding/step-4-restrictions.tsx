"use client"

import { Field } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import type { Step4Data } from "@/lib/onboarding/types"

interface Step4Props {
  data: Partial<Step4Data>
  onChange: (field: keyof Step4Data, value: string) => void
  errors: Partial<Record<keyof Step4Data, string>>
}

export function Step4Restrictions({ data, onChange, errors }: Step4Props) {
  return (
    <div className="flex flex-col gap-6">
      <Field
        label="Alergias e intolerâncias"
        htmlFor="restrictions"
        hint="Separe por vírgula se houver mais de uma"
        error={errors.restrictions}
      >
        <Textarea
          id="restrictions"
          placeholder="Ex: lactose, glúten, amendoim..."
          value={data.restrictions ?? ""}
          onChange={(e) => onChange("restrictions", e.target.value)}
          className="min-h-[100px]"
          rows={3}
        />
      </Field>

      <Field
        label="Condições de saúde"
        htmlFor="conditions"
        hint="Informe condições que possam afetar sua alimentação"
        error={errors.conditions}
      >
        <Textarea
          id="conditions"
          placeholder="Ex: diabetes tipo 2, hipertensão..."
          value={data.conditions ?? ""}
          onChange={(e) => onChange("conditions", e.target.value)}
          className="min-h-[100px]"
          rows={3}
        />
      </Field>

      <Field
        label="Preferências alimentares"
        htmlFor="preferences"
        hint="O que você gosta e não gosta de comer"
        error={errors.preferences}
      >
        <Textarea
          id="preferences"
          placeholder="Ex: vegetariano, não gosto de peixe, prefiro arroz integral..."
          value={data.preferences ?? ""}
          onChange={(e) => onChange("preferences", e.target.value)}
          className="min-h-[100px]"
          rows={3}
        />
      </Field>
    </div>
  )
}
