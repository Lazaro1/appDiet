import { prisma } from "../prisma"
import type { MealSwapLog } from "@/generated/prisma"

export class MealSwapLogRepository {
  async create(data: {
    userId: string
    mealId: string
    mealItemId?: string
    date: Date
    originalItemName: string
    originalKcal?: number
    originalProtein?: number
    chosenName: string
    chosenKcal: number
    chosenProtein: number
    description?: string
  }): Promise<MealSwapLog> {
    return prisma.mealSwapLog.create({ data })
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<MealSwapLog[]> {
    return prisma.mealSwapLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: "desc" },
    })
  }
}
