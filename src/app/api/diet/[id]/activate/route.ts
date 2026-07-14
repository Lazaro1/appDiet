import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"

export async function POST(
  _request: Request,
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

  await repo.approveReview(id)
  const activated = await repo.activate(id)
  return apiSuccess({ plan: activated })
}
