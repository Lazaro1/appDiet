"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useAsyncAction } from "@/hooks/use-async-action"
import { RefreshCw, Loader2 } from "lucide-react"
import { formatKcal } from "@/lib/nutrition/format"

interface SwapSuggestion {
  name: string
  kcal: number
  protein: number
  description: string
}

interface SwapSheetTriggerProps {
  planId: string
  itemName: string
  itemKcal: number
  itemProtein: number
  mealKcalTarget: number
}

export function SwapSheetTrigger({
  planId,
  itemName,
  itemKcal,
  itemProtein,
  mealKcalTarget,
}: SwapSheetTriggerProps) {
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

      <Sheet open={open} onClose={() => setOpen(false)} title={`Trocar ${itemName}`}>
        <p className="mb-4 text-sm text-muted-foreground">
          Original: {formatKcal(itemKcal)} kcal · {itemProtein}g proteína
        </p>
        <Textarea
          value={availableFoods}
          onChange={(e) => setAvailableFoods(e.target.value)}
          placeholder="O que você tem disponível? Ex: ovo, queijo, atum"
          className="mb-4 min-h-[80px]"
          aria-invalid={Boolean(error)}
        />
        {error && <p className="mb-2 text-sm text-destructive">{error}</p>}
        <Button onClick={() => handleSuggest()} disabled={loading} className="mb-4 w-full">
          {loading ? <Loader2 className="animate-spin" /> : "Sugerir alternativas"}
        </Button>
        {suggestions.length > 0 && (
          <ul className="space-y-3">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-lg border border-border p-3">
                <p className="font-medium text-ink">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatKcal(s.kcal)} kcal · {s.protein}g proteína
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Sheet>
    </>
  )
}
