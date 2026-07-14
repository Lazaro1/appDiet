import { prisma } from "../prisma"
import type { User, Prisma } from "@/generated/prisma"
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
