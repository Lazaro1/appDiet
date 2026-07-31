import { prisma } from "../prisma"
import { Prisma, type User } from "@/generated/prisma"
import type { Sex, ActivityLevel, Goal } from "@/generated/prisma"

export class UserRepository {
  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { clerkId } })
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async create(data: {
    clerkId: string
    name: string
    email: string
  }): Promise<User> {
    return prisma.user.create({ data })
  }

  /**
   * Find or create by clerkId. Safe under concurrent callers (layout + page SSR):
   * if create hits P2002, re-fetch the row the other request just inserted.
   */
  async findOrCreateByClerkId(data: {
    clerkId: string
    name: string
    email: string
  }): Promise<User> {
    const existing = await this.findByClerkId(data.clerkId)
    if (existing) return existing

    try {
      return await this.create(data)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const again = await this.findByClerkId(data.clerkId)
        if (again) return again
      }
      throw error
    }
  }

  async updateProfile(id: string, data: {
    name?: string
    birthDate?: Date
    sex?: Sex | null
    height?: number
    weight?: number
    activityLevel?: ActivityLevel | null
    goal?: Goal | null
    restrictions?: string
    preferences?: Prisma.InputJsonValue
    conditions?: string
    onboardingCompleted?: boolean
  }): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async updateCalculatedFields(id: string, data: {
    bmr?: number
    tdee?: number
    dailyKcalTarget?: number
  }): Promise<User> {
    return prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } })
  }
}
