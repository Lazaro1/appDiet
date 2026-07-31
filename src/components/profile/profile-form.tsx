"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/providers/toast-provider"
import { updateProfile } from "@/app/(app)/profile/actions"
import {
  SEX_LABELS,
  GOAL_LABELS,
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
} from "@/lib/onboarding/types"
import { formatKcal } from "@/lib/nutrition/format"
import { Loader2 } from "lucide-react"

export type ProfileSection = "account" | "goals" | "preferences"

export interface ProfileFormData {
  name: string
  birthDate: string
  sex: string
  weight: number
  height: number
  goal: string
  activityLevel: string
  restrictions: string
  conditions: string
  foodPreferences: string
  mealsPerDay: number
  bmr: number | null
  tdee: number | null
  dailyKcalTarget: number | null
}

interface ProfileFormProps {
  initial: ProfileFormData
  sections: ProfileSection[]
  onSaved?: () => void
}

export function ProfileForm({ initial, sections, onSaved }: ProfileFormProps) {
  const [pending, startTransition] = useTransition()
  const toast = useToast()
  const [form, setForm] = useState(initial)

  const show = (section: ProfileSection) => sections.includes(section)

  function updateField<K extends keyof ProfileFormData>(
    key: K,
    value: ProfileFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    startTransition(async () => {
      try {
        await updateProfile({
          name: form.name,
          birthDate: form.birthDate,
          sex: form.sex as "male" | "female",
          weight: form.weight,
          height: form.height,
          goal: form.goal as "lose" | "gain" | "maintain",
          activityLevel: form.activityLevel as
            | "sedentary"
            | "light"
            | "moderate"
            | "active"
            | "very_active",
          restrictions: form.restrictions,
          conditions: form.conditions,
          foodPreferences: form.foodPreferences,
          mealsPerDay: form.mealsPerDay,
        })
        toast.success("Perfil atualizado!")
        onSaved?.()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {show("account") && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dados básicos
          </h2>
          <Field label="Nome" htmlFor="name">
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="h-12 bg-surface"
            />
          </Field>
          <Field label="Data de nascimento" htmlFor="birthDate">
            <Input
              id="birthDate"
              type="date"
              value={form.birthDate}
              onChange={(e) => updateField("birthDate", e.target.value)}
              className="h-12 bg-surface"
            />
          </Field>
          <div>
            <Label>Sexo</Label>
            <RadioGroup
              value={form.sex}
              onValueChange={(v) => updateField("sex", v as string)}
              className="mt-2 flex gap-4"
            >
              {Object.entries(SEX_LABELS).map(([value, label]) => (
                <label key={value} className="flex items-center gap-2">
                  <RadioGroupItem value={value} />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
        </section>
      )}

      {show("goals") && (
        <>
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Medidas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso (kg)" htmlFor="weight">
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={form.weight}
                  onChange={(e) =>
                    updateField("weight", parseFloat(e.target.value))
                  }
                  className="h-12 bg-surface"
                />
              </Field>
              <Field label="Altura (cm)" htmlFor="height">
                <Input
                  id="height"
                  type="number"
                  value={form.height}
                  onChange={(e) =>
                    updateField("height", parseFloat(e.target.value))
                  }
                  className="h-12 bg-surface"
                />
              </Field>
            </div>
            <Link
              href="/weight"
              className="text-sm font-medium text-primary hover:underline"
            >
              Registrar peso de hoje →
            </Link>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Objetivo e atividade
            </h2>
            <div>
              <Label>Objetivo</Label>
              <RadioGroup
                value={form.goal}
                onValueChange={(v) => updateField("goal", v as string)}
                className="mt-2 grid gap-2"
              >
                {Object.entries(GOAL_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 rounded-lg border border-border bg-canvas px-3 py-2.5"
                  >
                    <RadioGroupItem value={value} />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label>Nível de atividade</Label>
              <RadioGroup
                value={form.activityLevel}
                onValueChange={(v) => updateField("activityLevel", v as string)}
                className="mt-2 grid gap-2"
              >
                {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-start gap-2 rounded-lg border border-border bg-canvas px-3 py-2.5"
                  >
                    <RadioGroupItem value={value} className="mt-0.5" />
                    <span className="text-sm">
                      <span className="font-medium">{label}</span>
                      <span className="block text-muted-foreground">
                        {ACTIVITY_DESCRIPTIONS[value]}
                      </span>
                    </span>
                  </label>
                ))}
              </RadioGroup>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rotina
            </h2>
            <Field label="Refeições por dia" htmlFor="mealsPerDay">
              <Select
                value={String(form.mealsPerDay)}
                onValueChange={(v) =>
                  updateField("mealsPerDay", parseInt(v as string))
                }
              >
                <SelectTrigger id="mealsPerDay" className="h-12 w-full bg-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} refeições
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </section>

          {(form.bmr || form.tdee || form.dailyKcalTarget) && (
            <div className="rounded-xl border border-border bg-surface p-4 text-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Valores calculados
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Atualizados ao salvar
              </p>
              {form.bmr && (
                <p className="mt-2 font-tabular-nums text-ink">
                  BMR: {formatKcal(form.bmr)} kcal
                </p>
              )}
              {form.tdee && (
                <p className="font-tabular-nums text-ink">
                  TDEE: {formatKcal(form.tdee)} kcal
                </p>
              )}
              {form.dailyKcalTarget && (
                <p className="font-tabular-nums font-semibold text-primary">
                  Meta diária: {formatKcal(form.dailyKcalTarget)} kcal
                </p>
              )}
            </div>
          )}
        </>
      )}

      {show("preferences") && (
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Restrições e preferências
          </h2>
          <Field label="Alergias e intolerâncias" htmlFor="restrictions">
            <Input
              id="restrictions"
              value={form.restrictions}
              onChange={(e) => updateField("restrictions", e.target.value)}
              className="h-12 bg-surface"
            />
          </Field>
          <Field label="Condições de saúde" htmlFor="conditions">
            <Input
              id="conditions"
              value={form.conditions}
              onChange={(e) => updateField("conditions", e.target.value)}
              className="h-12 bg-surface"
            />
          </Field>
          <Field label="Preferências alimentares" htmlFor="foodPreferences">
            <Input
              id="foodPreferences"
              value={form.foodPreferences}
              onChange={(e) => updateField("foodPreferences", e.target.value)}
              className="h-12 bg-surface"
            />
          </Field>
        </section>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-2xl text-sm font-semibold"
        size="lg"
      >
        {pending ? <Loader2 className="animate-spin" /> : "Salvar alterações"}
      </Button>
    </form>
  )
}
