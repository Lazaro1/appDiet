import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { generateDietPlanForUser, importDietPlanForUser } from "@/lib/diet/create-plan"

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
    const message = err instanceof Error ? err.message : "Erro ao criar dieta"
    return apiError(message, 500)
  }
}
