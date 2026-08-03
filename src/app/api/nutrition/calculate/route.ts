import { apiError, apiSuccess, requireApiUser } from "@/lib/auth/require-api-user"
import { foodRepository } from "@/lib/nutrition/catalog/food-repository"
import { z } from "zod"

const bodySchema = z.object({
  foodId: z.string().min(1),
  grams: z.number().positive().max(5000),
})

export async function POST(request: Request) {
  const { error } = await requireApiUser()
  if (error) return error

  const body = await request.json().catch(() => null)
  const parsed = bodySchema.safeParse(body)

  if (!parsed.success) {
    return apiError("foodId e grams são obrigatórios (grams > 0)")
  }

  const nutrition = await foodRepository.computeNutritionForFood(
    parsed.data.foodId,
    parsed.data.grams,
  )

  if (!nutrition) {
    return apiError("Alimento não encontrado", 404)
  }

  return apiSuccess({
    foodId: parsed.data.foodId,
    grams: parsed.data.grams,
    nutrition,
  })
}
