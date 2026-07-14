"use client"

import { useState } from "react"
import { DietGenerateForm } from "@/components/diet/diet-generate-form"
import { DietImportForm } from "@/components/diet/diet-import-form"
import { cn } from "@/lib/utils"

export function NewDietTabs() {
  const [tab, setTab] = useState<"generate" | "import">("generate")

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Criar dieta</h1>
        <p className="text-sm text-muted-foreground">
          Gere um plano com IA ou importe a dieta do seu nutricionista
        </p>
      </header>

      <div className="flex rounded-lg border border-border bg-muted p-1">
        <button
          type="button"
          onClick={() => setTab("generate")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
            tab === "generate" ? "bg-background text-ink shadow-sm" : "text-muted-foreground",
          )}
        >
          Gerar com IA
        </button>
        <button
          type="button"
          onClick={() => setTab("import")}
          className={cn(
            "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
            tab === "import" ? "bg-background text-ink shadow-sm" : "text-muted-foreground",
          )}
        >
          Colar dieta
        </button>
      </div>

      {tab === "generate" ? <DietGenerateForm /> : <DietImportForm />}
    </div>
  )
}
