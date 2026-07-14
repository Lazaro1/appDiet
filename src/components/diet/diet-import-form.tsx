"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, FileText } from "lucide-react"

export function DietImportForm() {
  const router = useRouter()
  const [text, setText] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImport() {
    if (!text.trim()) {
      setError("Cole o texto da sua dieta")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/diet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro ao importar dieta")
      router.push(`/diet/${json.data.plan.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar dieta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Cole o texto da dieta que você recebeu do nutricionista. A IA vai estruturar as refeições.
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ex: Café da manhã: 2 ovos, 1 fatia de pão integral, café..."
        className="min-h-[200px] w-full rounded-lg border border-border bg-background p-3 text-sm text-ink placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={handleImport} disabled={loading} className="w-full" size="lg">
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
