"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MealParseResult } from "./meal-parse-result"
import { Loader2 } from "lucide-react"

interface ParsedItem {
  foodName: string
  estimatedKcal: number
  estimatedProtein: number
  estimatedCarbs: number
  estimatedFat: number
}

interface MealLogFormProps {
  mealId: string
  kcalTarget: number
  existingLog?: {
    parsedKcal: number | null
    conformant: boolean | null
    rawText: string | null
  } | null
}

export function MealLogForm({ mealId, kcalTarget, existingLog }: MealLogFormProps) {
  const router = useRouter()
  const [text, setText] = useState(existingLog?.rawText ?? "")
  const [loading, setLoading] = useState<"log" | "skip" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    parsedKcal: number
    conformant: boolean
    items: ParsedItem[]
  } | null>(
    existingLog?.parsedKcal
      ? {
          parsedKcal: existingLog.parsedKcal,
          conformant: existingLog.conformant ?? false,
          items: [],
        }
      : null,
  )

  async function handleLog() {
    if (!text.trim()) {
      setError("Descreva o que você comeu")
      return
    }
    setLoading("log")
    setError(null)

    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao registrar")
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar")
    } finally {
      setLoading(null)
    }
  }

  async function handleSkip() {
    setLoading("skip")
    setError(null)

    try {
      const res = await fetch(`/api/meals/${mealId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "skip" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao pular")
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao pular")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: comi arroz, feijão, frango grelhado e salada"
        className="min-h-[120px] w-full rounded-lg border border-border bg-background p-3 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={loading !== null}
          className="flex-1"
        >
          {loading === "skip" ? <Loader2 className="animate-spin" /> : "Pulei"}
        </Button>
        <Button
          onClick={handleLog}
          disabled={loading !== null}
          className="flex-1"
        >
          {loading === "log" ? <Loader2 className="animate-spin" /> : "Registrar"}
        </Button>
      </div>
      {result && (
        <MealParseResult
          kcalTarget={kcalTarget}
          parsedKcal={result.parsedKcal}
          conformant={result.conformant}
          items={result.items}
        />
      )}
    </div>
  )
}
