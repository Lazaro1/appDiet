"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { UserRepository } from "@/lib/db/repositories/user-repository"
import type { Prisma } from "@/generated/prisma"
import { calculateBMR, calculateAge } from "@/lib/nutrition/bmr"
import { calculateTDEE } from "@/lib/nutrition/tdee"
import { calculateDailyKcalTarget } from "@/lib/nutrition/macros"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2).max(100),
  birthDate: z.string().min(1),
  sex: z.enum(["male", "female"]),
  weight: z.number().min(30).max(300),
  height: z.number().min(100).max(250),
  goal: z.enum(["lose", "gain", "maintain"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  restrictions: z.string().optional(),
  conditions: z.string().optional(),
  foodPreferences: z.string().optional(),
  mealsPerDay: z.number().min(3).max(6),
})

export type ProfileFormData = z.infer<typeof profileSchema>

export async function updateProfile(data: ProfileFormData) {
  const { userId: clerkId } = await auth()
  if (!clerkId) throw new Error("Não autenticado")

  const validated = profileSchema.parse(data)
  const userRepo = new UserRepository()
  const user = await userRepo.findByClerkId(clerkId)
  if (!user) throw new Error("Usuário não encontrado")

  const birthDate = new Date(validated.birthDate + "T00:00:00")
  const age = calculateAge(birthDate)
  const bmr = calculateBMR(validated.weight, validated.height, age, validated.sex)
  const tdee = calculateTDEE(bmr, validated.activityLevel)
  const dailyKcalTarget = calculateDailyKcalTarget(tdee, validated.goal)
  const mealPresets = MEAL_PRESETS[validated.mealsPerDay]

  await userRepo.updateProfile(user.id, {
    name: validated.name,
    birthDate,
    sex: validated.sex,
    height: validated.height,
    weight: validated.weight,
    activityLevel: validated.activityLevel,
    goal: validated.goal,
    restrictions: validated.restrictions || undefined,
    conditions: validated.conditions || undefined,
    preferences: {
      mealsPerDay: validated.mealsPerDay,
      meals: mealPresets,
      foodPreferences: validated.foodPreferences,
    } as unknown as Prisma.InputJsonValue,
  })

  await userRepo.updateCalculatedFields(user.id, {
    bmr,
    tdee,
    dailyKcalTarget,
  })

  revalidatePath("/profile")
  revalidatePath("/")
}
