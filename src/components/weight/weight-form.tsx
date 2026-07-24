"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useToast } from "@/components/providers/toast-provider"
import { Loader2 } from "lucide-react"

export function WeightForm() {
  const router = useRouter()
  const toast = useToast()
  const [weight, setWeight] = useState("")

  const { run, loading, error } = useAsyncAction(async () => {
    const value = parseFloat(weight.replace(",", "."))
    if (isNaN(value) || value < 30 || value > 300) {
      throw new Error("Informe um peso entre 30 e 300 kg")
    }

    const res = await fetch("/api/weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: value }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao registrar")

    setWeight("")
    toast.success("Peso registrado!")
    router.refresh()
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        run()
      }}
      className="space-y-4"
    >
      <Field label="Peso (kg)" htmlFor="weight" error={error ?? undefined}>
        <Input
          id="weight"
          type="text"
          inputMode="decimal"
          placeholder="Ex: 78.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          aria-invalid={Boolean(error)}
        />
      </Field>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : "Registrar peso"}
      </Button>
    </form>
  )
}
