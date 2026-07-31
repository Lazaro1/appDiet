"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAsyncAction } from "@/hooks/use-async-action"
import { Loader2, FileText } from "lucide-react"

export function DietImportForm() {
  const router = useRouter()
  const [text, setText] = useState("")

  const { run, loading, error } = useAsyncAction(async () => {
    if (!text.trim()) throw new Error("Cole o texto da sua dieta")

    const res = await fetch("/api/diet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", text }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error ?? "Erro ao importar dieta")
    router.push(`/diet/${json.data.plan.id}`)
  })

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cole o texto da dieta que você recebeu do nutricionista. A IA vai estruturar as refeições,
        incluindo opções alternativas (marcadas como Opção A, Opção B, etc.).
      </p>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cole aqui o plano completo: macros, refeições, horários e alternativas..."
        className="min-h-[200px]"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={() => run()} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            Importando...
          </>
        ) : (
          <>
            <FileText />
            Importar dieta
          </>
        )}
      </Button>
    </div>
  )
}
