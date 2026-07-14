import { prisma } from "../prisma"
import type { WeightLog } from "@/generated/prisma"

export class WeightLogRepository {
  async findByUserId(userId: string, limit = 30): Promise<WeightLog[]> {
    return prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
    })
  }

  async findLatest(userId: string): Promise<WeightLog | null> {
    return prisma.weightLog.findFirst({
      where: { userId },
      orderBy: { date: "desc" },
    })
  }

  async create(data: {
    userId: string
    weight: number
    date: Date
  }): Promise<WeightLog> {
    return prisma.weightLog.create({ data })
  }
}
