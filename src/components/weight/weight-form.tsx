"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function WeightForm() {
  const router = useRouter()
  const [weight, setWeight] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = parseFloat(weight.replace(",", "."))
    if (isNaN(value) || value < 30 || value > 300) {
      setError("Informe um peso entre 30 e 300 kg")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: value }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao registrar")
      setSuccess(true)
      setWeight("")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="text"
          inputMode="decimal"
          placeholder="Ex: 78.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {success && <p className="text-sm text-success">Peso registrado!</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="animate-spin" /> : "Registrar peso"}
      </Button>
    </form>
  )
}
