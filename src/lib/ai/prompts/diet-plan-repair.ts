import type {
  DietGenerationContext,
  DietRepairIssue,
  GeneratedDietDraft,
} from "../types"
import { buildDietPlanUserPrompt } from "./diet-plan-user"

function formatIssues(issues: DietRepairIssue[]): string {
  return issues
    .map((issue) => `- [${issue.code}]${issue.path ? ` ${issue.path}:` : ""} ${issue.message}`)
    .join("\n")
}

/** Repair prompt: re-send the catalog plus the specific problems to fix. */
export function buildDietPlanRepairPrompt(params: {
  context: DietGenerationContext
  previousDraft: GeneratedDietDraft
  issues: DietRepairIssue[]
}): string {
  return `${buildDietPlanUserPrompt(params.context)}

O plano anterior foi rejeitado pela validação.

PLANO ANTERIOR:
${JSON.stringify(params.previousDraft)}

PROBLEMAS A CORRIGIR:
${formatIssues(params.issues)}

Corrija apenas os problemas listados, mantendo os mesmos mealId e respeitando o catálogo. Retorne o plano completo em JSON.`
}
