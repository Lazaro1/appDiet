"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { updateProfile } from "@/app/(app)/profile/actions"
import {
  SEX_LABELS,
  GOAL_LABELS,
  ACTIVITY_LABELS,
  ACTIVITY_DESCRIPTIONS,
} from "@/lib/onboarding/types"
import { formatKcal } from "@/lib/nutrition/format"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface ProfileFormProps {
  initial: {
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
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(initial)

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    startTransition(async () => {
      try {
        await updateProfile({
          name: form.name,
          birthDate: form.birthDate,
          sex: form.sex as "male" | "female",
          weight: form.weight,
          height: form.height,
          goal: form.goal as "lose" | "gain" | "maintain",
          activityLevel: form.activityLevel as "sedentary" | "light" | "moderate" | "active" | "very_active",
          restrictions: form.restrictions,
          conditions: form.conditions,
          foodPreferences: form.foodPreferences,
          mealsPerDay: form.mealsPerDay,
        })
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao salvar")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Dados básicos
        </h2>
        <div>
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="birthDate">Data de nascimento</Label>
          <Input id="birthDate" type="date" value={form.birthDate} onChange={(e) => updateField("birthDate", e.target.value)} />
        </div>
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

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Medidas
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input id="weight" type="number" step="0.1" value={form.weight} onChange={(e) => updateField("weight", parseFloat(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="height">Altura (cm)</Label>
            <Input id="height" type="number" value={form.height} onChange={(e) => updateField("height", parseFloat(e.target.value))} />
          </div>
        </div>
        <Link href="/weight" className="text-sm text-primary hover:underline">
          Registrar peso de hoje →
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
              <label key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </RadioGroup>
        </div>
        <div>
          <Label>Atividade</Label>
          <RadioGroup
            value={form.activityLevel}
            onValueChange={(v) => updateField("activityLevel", v as string)}
            className="mt-2 grid gap-2"
          >
            {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <RadioGroupItem value={value} />
                <span className="text-sm">
                  {label} — {ACTIVITY_DESCRIPTIONS[value]}
                </span>
              </label>
            ))}
          </RadioGroup>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Restrições
        </h2>
        <div>
          <Label htmlFor="restrictions">Alergias e intolerâncias</Label>
          <Input id="restrictions" value={form.restrictions} onChange={(e) => updateField("restrictions", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="conditions">Condições de saúde</Label>
          <Input id="conditions" value={form.conditions} onChange={(e) => updateField("conditions", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="foodPreferences">Preferências alimentares</Label>
          <Input id="foodPreferences" value={form.foodPreferences} onChange={(e) => updateField("foodPreferences", e.target.value)} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Rotina
        </h2>
        <div>
          <Label htmlFor="mealsPerDay">Refeições por dia</Label>
          <select
            id="mealsPerDay"
            value={form.mealsPerDay}
            onChange={(e) => updateField("mealsPerDay", parseInt(e.target.value))}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {[3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} refeições</option>
            ))}
          </select>
        </div>
      </section>

      {(form.bmr || form.tdee || form.dailyKcalTarget) && (
        <div className="rounded-lg border border-border bg-muted p-4 text-sm">
          <p className="text-muted-foreground">Valores calculados (atualizados ao salvar)</p>
          {form.bmr && <p className="mt-1 font-tabular-nums">BMR: {formatKcal(form.bmr)} kcal</p>}
          {form.tdee && <p className="font-tabular-nums">TDEE: {formatKcal(form.tdee)} kcal</p>}
          {form.dailyKcalTarget && <p className="font-tabular-nums">Meta diária: {formatKcal(form.dailyKcalTarget)} kcal</p>}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Perfil atualizado!</p>}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? <Loader2 className="animate-spin" /> : "Salvar alterações"}
      </Button>
    </form>
  )
}
