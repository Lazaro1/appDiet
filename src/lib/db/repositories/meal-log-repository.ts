import { prisma } from "../prisma"
import type { MealLog } from "@/generated/prisma"
import type { MealLogStatus } from "@/generated/prisma"

export class MealLogRepository {
  async findByUserAndDate(userId: string, date: Date): Promise<MealLog[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: "asc" },
    })
  }

  async findByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<MealLog[]> {
    return prisma.mealLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: "asc" },
    })
  }

  async findByUserMealAndDate(
    userId: string,
    mealId: string,
    date: Date,
  ): Promise<MealLog | null> {
    const logs = await this.findByUserAndDate(userId, date)
    return logs.find((log) => log.mealId === mealId) ?? null
  }

  async create(data: {
    userId: string
    mealId?: string
    date: Date
    status: MealLogStatus
    rawText?: string
    parsedKcal?: number
    parsedProtein?: number
    parsedCarbs?: number
    parsedFat?: number
    conformant?: boolean
  }): Promise<MealLog> {
    return prisma.mealLog.create({ data })
  }

  async update(id: string, data: {
    rawText?: string | null
    parsedKcal?: number | null
    parsedProtein?: number | null
    parsedCarbs?: number | null
    parsedFat?: number | null
    conformant?: boolean | null
    status?: MealLogStatus
  }): Promise<MealLog> {
    return prisma.mealLog.update({ where: { id }, data })
  }

  async getDailyKcalSummary(userId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const result = await prisma.mealLog.aggregate({
      where: {
        userId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { not: "skipped" },
      },
      _sum: { parsedKcal: true },
    })

    return result._sum.parsedKcal ?? 0
  }
}
