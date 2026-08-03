import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { generateDietPlanForUser, importDietPlanForUser } from "@/lib/diet/create-plan"
import { toUserFacingAiError } from "@/lib/ai/errors"
import {
  DietPlanGenerationError,
  DietPlanUnfeasibleError,
  EmptyFoodCatalogError,
} from "@/lib/nutrition/orchestration/errors"

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const repo = new DietPlanRepository()
  const activePlan = await repo.findActiveByUserId(user!.id)
  return apiSuccess({ plan: activePlan })
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const action = body.action as string | undefined

  try {
    if (action === "generate") {
      const plan = await generateDietPlanForUser(user!)
      return apiSuccess({ plan }, 201)
    }

    if (action === "import") {
      const text = body.text as string | undefined
      if (!text?.trim()) return apiError("Texto da dieta é obrigatório")
      const plan = await importDietPlanForUser(user!, text)
      return apiSuccess({ plan }, 201)
    }

    return apiError("Ação inválida. Use action: 'generate' ou 'import'")
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[POST /api/diet]", err)
    }

    if (err instanceof DietPlanUnfeasibleError) {
      return apiError(
        `Não conseguimos montar um plano com suas restrições: ${err.reason}. Revise as restrições no seu perfil e tente de novo.`,
        422,
      )
    }

    if (err instanceof EmptyFoodCatalogError) {
      return apiError(
        "Nenhum alimento do catálogo atende às suas restrições. Revise as restrições no seu perfil.",
        422,
      )
    }

    if (err instanceof DietPlanGenerationError) {
      return apiError(err.message, 422)
    }

    return apiError(toUserFacingAiError(err), 500)
  }
}
