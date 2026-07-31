"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useToast } from "@/components/providers/toast-provider"
import type { SwapSuggestion } from "@/lib/nutrition/swap-types"
import { formatKcal } from "@/lib/nutrition/format"
import { MessageCircle, RefreshCw, Loader2 } from "lucide-react"

export type { SwapSuggestion }

interface SwapSheetTriggerProps {
  planId: string
  mealId: string
  mealItemId: string
  logDateKey: string
  itemName: string
  itemKcal: number
  itemProtein: number
  mealKcalTarget: number
  onUseSuggestion: (suggestion: SwapSuggestion) => void
}

async function recordSwapHistory(params: {
  mealId: string
  logDateKey: string
  mealItemId: string
  itemName: string
  itemKcal: number
  itemProtein: number
  suggestion: SwapSuggestion
}) {
  await fetch(`/api/meals/${params.mealId}/swaps`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: params.logDateKey,
      mealItemId: params.mealItemId,
      originalItemName: params.itemName,
      originalKcal: params.itemKcal,
      originalProtein: params.itemProtein,
      chosenName: params.suggestion.name,
      chosenKcal: params.suggestion.kcal,
      chosenProtein: params.suggestion.protein,
      description: params.suggestion.description,
    }),
  })
}

export function SwapSheetTrigger({
  planId,
  mealId,
  mealItemId,
  logDateKey,
  itemName,
  itemKcal,
  itemProtein,
  mealKcalTarget,
  onUseSuggestion,
}: SwapSheetTriggerProps) {
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const [availableFoods, setAvailableFoods] = useState("")
  const [suggestions, setSuggestions] = useState<SwapSuggestion[]>([])

  const { run: handleSuggest, loading, error } = useAsyncAction(async () => {
    if (!availableFoods.trim()) {
      throw new Error("Informe o que você tem disponível")
    }

    const res = await fetch(`/api/diet/${planId}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        itemName,
        itemKcal,
        itemProtein,
        availableFoods,
        mealKcalTarget,
      }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao sugerir trocas")
    setSuggestions(json.data.suggestions)
  })

  const handleUseSuggestion = (suggestion: SwapSuggestion) => {
    onUseSuggestion(suggestion)
    void recordSwapHistory({
      mealId,
      logDateKey,
      mealItemId,
      itemName,
      itemKcal,
      itemProtein,
      suggestion,
    }).catch(() => {
      toast.toast("Troca adicionada, mas não foi possível salvar o histórico", "info")
    })
    setOpen(false)
    toast.success("Adicionado ao registro da refeição")
  }

  const chatHref = `/chat?context=swap&itemName=${encodeURIComponent(itemName)}`

  return (
    <>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => setOpen(true)}
        type="button"
      >
        <RefreshCw size={14} />
        Trocar
      </Button>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={`Trocar ${itemName}`}
        footer={
          <div className="space-y-3">
            <Textarea
              value={availableFoods}
              onChange={(e) => setAvailableFoods(e.target.value)}
              placeholder="O que você tem disponível? Ex: ovo, queijo, atum"
              className="min-h-[80px]"
              aria-invalid={Boolean(error)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              onClick={() => handleSuggest()}
              disabled={loading}
              className="h-12 w-full rounded-2xl text-sm font-semibold"
            >
              {loading ? (
                <Loader2 className="size-[18px] animate-spin" />
              ) : (
                "Sugerir alternativas"
              )}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          Original: {formatKcal(itemKcal)} kcal · {itemProtein}g proteína
        </p>
        <Link
          href={chatHref}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          onClick={() => setOpen(false)}
        >
          <MessageCircle className="size-4" />
          Falar com o coach
        </Link>
        {suggestions.length > 0 && (
          <ul className="mt-4 space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <p className="font-medium text-ink">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKcal(s.kcal)} kcal · {s.protein}g proteína
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full rounded-xl"
                  onClick={() => handleUseSuggestion(s)}
                >
                  Usar esta opção
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
