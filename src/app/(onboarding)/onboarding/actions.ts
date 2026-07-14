"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserRepository } from "@/lib/db/repositories/user-repository"
import type { Prisma } from "@/generated/prisma"
import { calculateBMR, calculateAge } from "@/lib/nutrition/bmr"
import { calculateTDEE } from "@/lib/nutrition/tdee"
import { calculateDailyKcalTarget } from "@/lib/nutrition/macros"
import { onboardingSchema, MEAL_PRESETS } from "@/lib/onboarding/types"
import type { OnboardingFormData } from "@/lib/onboarding/types"

export async function completeOnboarding(formData: OnboardingFormData) {
  const { userId: clerkId } = await auth()
  if (!clerkId) {
    throw new Error("Não autenticado")
  }

  // Validate all data
  const validated = onboardingSchema.parse(formData)

  // Calculate derived fields
  const birthDate = new Date(validated.birthDate + "T00:00:00")
  const age = calculateAge(birthDate)
  const bmr = calculateBMR(validated.weight, validated.height, age, validated.sex)
  const tdee = calculateTDEE(bmr, validated.activityLevel)
  const dailyKcalTarget = calculateDailyKcalTarget(tdee, validated.goal)

  // Build preferences JSON with meal routine
  const mealPresets = MEAL_PRESETS[validated.mealsPerDay]

  // Update user
  const userRepo = new UserRepository()
  const user = await userRepo.findByClerkId(clerkId)

  if (!user) {
    throw new Error("Usuário não encontrado")
  }

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
      foodPreferences: validated.preferences,
    } as unknown as Prisma.InputJsonValue,
    onboardingCompleted: true,
  })

  await userRepo.updateCalculatedFields(user.id, {
    bmr,
    tdee,
    dailyKcalTarget,
  })

  redirect("/diet/new")
}
