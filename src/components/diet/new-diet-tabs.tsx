"use client"

import { useState } from "react"
import { DietGenerateForm } from "@/components/diet/diet-generate-form"
import { DietImportForm } from "@/components/diet/diet-import-form"
import { PageContainer, PageHeader } from "@/components/ui/page-container"
import { cn } from "@/lib/utils"

export function NewDietTabs() {
  const [tab, setTab] = useState<"generate" | "import">("generate")

  return (
    <PageContainer>
      <PageHeader
        title="Criar dieta"
        subtitle="Gere um plano com IA ou importe a dieta do seu nutricionista"
      />

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
    </PageContainer>
  )
}
