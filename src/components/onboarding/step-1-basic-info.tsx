"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { SEX_LABELS } from "@/lib/onboarding/types"
import type { Step1Data } from "@/lib/onboarding/types"

interface Step1Props {
  data: Partial<Step1Data>
  onChange: (field: keyof Step1Data, value: string) => void
  errors: Partial<Record<keyof Step1Data, string>>
}

export function Step1BasicInfo({ data, onChange, errors }: Step1Props) {
  return (
    <div className="flex flex-col gap-6">
      {/* Name */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Seu nome"
          value={data.name ?? ""}
          onChange={(e) => onChange("name", e.target.value)}
          aria-invalid={!!errors.name}
          className="h-12 rounded-xl px-4 text-base"
        />
        {errors.name && (
          <p className="text-sm text-danger">{errors.name}</p>
        )}
      </div>

      {/* Birth date */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          value={data.birthDate ?? ""}
          onChange={(e) => onChange("birthDate", e.target.value)}
          aria-invalid={!!errors.birthDate}
          className="h-12 rounded-xl px-4 text-base"
          max={new Date().toISOString().split("T")[0]}
        />
        {errors.birthDate && (
          <p className="text-sm text-danger">{errors.birthDate}</p>
        )}
      </div>

      {/* Sex */}
      <div className="flex flex-col gap-3">
        <Label>Sexo</Label>
        <RadioGroup
          value={data.sex ?? ""}
          onValueChange={(value) => onChange("sex", value as string)}
          className="grid grid-cols-2 gap-3"
        >
          {Object.entries(SEX_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-soft"
            >
              <RadioGroupItem value={value} />
              <span className="text-base font-medium">{label}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.sex && (
          <p className="text-sm text-danger">{errors.sex}</p>
        )}
      </div>
    </div>
  )
}
