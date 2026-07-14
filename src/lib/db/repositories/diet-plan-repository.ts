import { prisma } from "../prisma"
import type { DietPlan, DietPlanReview, Prisma } from "@/generated/prisma"
import type { PortionUnit } from "@/generated/prisma"

const planWithMealsInclude = {
  meals: { include: { mealItems: true }, orderBy: { order: "asc" as const } },
  review: true,
} satisfies Prisma.DietPlanInclude

export type DietPlanWithMeals = Prisma.DietPlanGetPayload<{
  include: typeof planWithMealsInclude
}>

export class DietPlanRepository {
  async findActiveByUserId(userId: string): Promise<DietPlanWithMeals | null> {
    return prisma.dietPlan.findFirst({
      where: { userId, isActive: true },
      include: planWithMealsInclude,
    })
  }

  async findById(id: string): Promise<DietPlanWithMeals | null> {
    return prisma.dietPlan.findUnique({
      where: { id },
      include: planWithMealsInclude,
    })
  }

  async findAllByUserId(userId: string) {
    return prisma.dietPlan.findMany({
      where: { userId },
      include: { meals: { orderBy: { order: "asc" } }, review: true },
      orderBy: { createdAt: "desc" },
    })
  }

  async create(data: {
    userId: string
    name: string
    totalKcal: number
    meals: Array<{
      name: string
      kcalTarget: number
      windowStart: number
      windowEnd: number
      order: number
      mealItems: Array<{
        foodId?: string
        name: string
        quantity: number
        unit: PortionUnit
        kcal: number
        protein: number
        carbs: number
        fat: number
      }>
    }>
  }): Promise<DietPlanWithMeals> {
    return prisma.dietPlan.create({
      data: {
        userId: data.userId,
        name: data.name,
        totalKcal: data.totalKcal,
        meals: {
          create: data.meals.map((meal) => ({
            name: meal.name,
            kcalTarget: meal.kcalTarget,
            windowStart: meal.windowStart,
            windowEnd: meal.windowEnd,
            order: meal.order,
            mealItems: {
              create: meal.mealItems,
            },
          })),
        },
        review: {
          create: { status: "pending" },
        },
      },
      include: planWithMealsInclude,
    })
  }

  async activate(id: string): Promise<DietPlan> {
    const plan = await prisma.dietPlan.findUnique({ where: { id } })
    if (plan) {
      await prisma.dietPlan.updateMany({
        where: { userId: plan.userId, isActive: true },
        data: { isActive: false },
      })
    }
    return prisma.dietPlan.update({
      where: { id },
      data: { isActive: true },
    })
  }

  async approveReview(dietPlanId: string): Promise<DietPlanReview> {
    return prisma.dietPlanReview.update({
      where: { dietPlanId },
      data: { status: "approved" },
    })
  }

  async rejectReview(dietPlanId: string): Promise<DietPlanReview> {
    return prisma.dietPlanReview.update({
      where: { dietPlanId },
      data: { status: "rejected" },
    })
  }
}
