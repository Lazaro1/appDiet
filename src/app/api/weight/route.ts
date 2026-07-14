import { requireApiUser, apiSuccess, apiError } from "@/lib/auth/require-api-user"
import { WeightLogRepository } from "@/lib/db/repositories/weight-log-repository"

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const repo = new WeightLogRepository()
  const logs = await repo.findByUserId(user!.id, 30)
  return apiSuccess({ logs: logs.reverse() })
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const weight = body.weight as number | undefined

  if (!weight || weight < 30 || weight > 300) {
    return apiError("Peso inválido (30–300 kg)")
  }

  const repo = new WeightLogRepository()
  const log = await repo.create({
    userId: user!.id,
    weight,
    date: new Date(),
  })

  return apiSuccess({ log }, 201)
}
