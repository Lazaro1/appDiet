import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { suggestFoodSwaps } from "@/lib/nutrition/orchestration/suggest-food-swaps"

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

  if (!itemName || !availableFoods?.trim()) {
    return apiError("itemName e availableFoods são obrigatórios")
  }

  try {
    const suggestions = await suggestFoodSwaps({
      itemName,
      itemKcal: itemKcal ?? 0,
      itemProtein: itemProtein ?? 0,
      availableFoodsText: availableFoods,
      restrictions: user!.restrictions,
      limit: 3,
    })
    return apiSuccess({ suggestions })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao sugerir trocas"
    return apiError(message, 500)
  }
}
