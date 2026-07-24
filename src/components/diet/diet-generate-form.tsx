"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAsyncAction } from "@/hooks/use-async-action"
import { Loader2, Sparkles } from "lucide-react"

export function DietGenerateForm() {
  const router = useRouter()

  const { run, loading, error } = useAsyncAction(async () => {
    const res = await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate" }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao gerar dieta")
    router.push(`/diet/${json.data.plan.id}`)
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        A IA vai criar um plano alimentar completo com base no seu perfil, objetivo e restrições.
      </p>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={() => run()} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Gerando plano...
          </>
        ) : (
          <>
            <Sparkles />
            Gerar com IA
          </>
        )}
      </Button>
    </div>
  )
}
