import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { getAIProvider } from "@/lib/ai/factory"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const { id } = await params
  const repo = new DietPlanRepository()
  const plan = await repo.findById(id)

  if (!plan || plan.userId !== user!.id) {
    return apiError("Plano não encontrado", 404)
  }

  const body = await request.json().catch(() => ({}))
  const itemName = body.itemName as string | undefined
  const itemKcal = body.itemKcal as number | undefined
  const itemProtein = body.itemProtein as number | undefined
  const availableFoods = body.availableFoods as string | undefined
  const mealKcalTarget = body.mealKcalTarget as number | undefined

  if (!itemName || !availableFoods?.trim()) {
    return apiError("itemName e availableFoods são obrigatórios")
  }

  try {
    const ai = getAIProvider()
    const suggestions = await ai.suggestSwap({
      itemName,
      itemKcal: itemKcal ?? 0,
      itemProtein: itemProtein ?? 0,
      availableFoods,
      mealKcalTarget: mealKcalTarget ?? 500,
    })
    return apiSuccess({ suggestions })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao sugerir trocas"
    return apiError(message, 500)
  }
}
