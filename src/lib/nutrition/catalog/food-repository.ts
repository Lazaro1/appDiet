import { prisma } from "@/lib/db/prisma"
import type { TBACFood } from "@/generated/prisma"
import { computeFoodNutrition } from "../calculations/compute-food-nutrition"
import type { NutritionTotals } from "../types"

export class FoodRepository {
  async findById(id: string): Promise<TBACFood | null> {
    return prisma.tBACFood.findFirst({
      where: { id, active: true },
    })
  }

  async findByIds(ids: string[]): Promise<TBACFood[]> {
    if (ids.length === 0) return []

    return prisma.tBACFood.findMany({
      where: { id: { in: ids }, active: true },
    })
  }

  async findByExternalCode(code: string): Promise<TBACFood | null> {
    return prisma.tBACFood.findFirst({
      where: { externalCode: code, active: true },
    })
  }

  async computeNutritionForFood(
    foodId: string,
    grams: number,
  ): Promise<NutritionTotals | null> {
    const food = await this.findById(foodId)
    if (!food) return null

    return computeFoodNutrition(food, grams)
  }

  async countActive(): Promise<number> {
    return prisma.tBACFood.count({ where: { active: true } })
  }
}

export const foodRepository = new FoodRepository()
