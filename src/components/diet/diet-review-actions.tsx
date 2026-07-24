"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { PageContainer, PageHeader } from "@/components/ui/page-container"
import { useToast } from "@/components/providers/toast-provider"
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
  const toast = useToast()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)

  async function handleApprove() {
    setLoading("approve")
    try {
      const res = await fetch(`/api/diet/${planId}/activate`, { method: "POST" })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao ativar")
      toast.success("Dieta ativada!")
      router.push("/")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao ativar")
      setLoading(null)
    }
  }

  async function handleReject() {
    setLoading("reject")
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
      toast.error(err instanceof Error ? err.message : "Erro ao rejeitar")
      setLoading(null)
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title={planName}
        subtitle={`${formatKcal(totalKcal)} kcal/dia · ${meals.length} refeições${
          isActive ? " · Ativo" : ""
        }${reviewStatus === "pending" ? " · Aguardando revisão" : ""}`}
      />

      <div className="space-y-3">
        {meals.map((meal) => (
          <DietReviewCard key={meal.id} meal={meal} />
        ))}
      </div>

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
    </PageContainer>
  )
}
