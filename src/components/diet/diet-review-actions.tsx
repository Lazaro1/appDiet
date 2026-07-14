"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DietReviewCard } from "./diet-review-card"
import { formatKcal } from "@/lib/nutrition/format"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

interface MealItem {
  id: string
  name: string
  quantity: number
  unit: string
  kcal: number
  protein: number
}

interface Meal {
  id: string
  name: string
  kcalTarget: number
  windowStart: number
  windowEnd: number
  mealItems: MealItem[]
}

interface DietReviewActionsProps {
  planId: string
  planName: string
  totalKcal: number
  meals: Meal[]
  reviewStatus: string
  isActive: boolean
}

export function DietReviewActions({
  planId,
  planName,
  totalKcal,
  meals,
  reviewStatus,
  isActive,
}: DietReviewActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleApprove() {
    setLoading("approve")
    setError(null)
    try {
      const res = await fetch(`/api/diet/${planId}/activate`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao ativar")
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao ativar")
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    setLoading("reject")
    setError(null)
    try {
      const res = await fetch(`/api/diet/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao rejeitar")
      router.push("/diet/new")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao rejeitar")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">{planName}</h1>
        <p className="text-sm text-muted-foreground">
          {formatKcal(totalKcal)} kcal/dia · {meals.length} refeições
          {isActive && " · Ativo"}
          {reviewStatus === "pending" && " · Aguardando revisão"}
        </p>
      </header>

      <div className="space-y-3">
        {meals.map((meal) => (
          <DietReviewCard key={meal.id} meal={meal} />
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {reviewStatus === "pending" && !isActive && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === "reject" ? <Loader2 className="animate-spin" /> : <XCircle />}
            Rejeitar
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading !== null}
            className="flex-1"
          >
            {loading === "approve" ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
            Aprovar e ativar
          </Button>
        </div>
      )}

      {isActive && (
        <Button onClick={() => router.push("/")} className="w-full">
          Ir para o dashboard
        </Button>
      )}
    </div>
  )
}
