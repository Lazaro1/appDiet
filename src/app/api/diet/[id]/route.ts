import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"

export async function GET(
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

  return apiSuccess({ plan })
}

export async function PATCH(
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

  if (body.action === "reject") {
    await repo.rejectReview(id)
    return apiSuccess({ status: "rejected" })
  }

  return apiError("Ação inválida")
}
