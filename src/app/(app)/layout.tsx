import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { AppProviders } from "@/components/providers/app-providers"
import { buildDaySnapshot, type DaySnapshot } from "@/lib/nutrition/day"

async function getDaySnapshot(
  userId: string,
  dailyKcalTarget: number | null,
): Promise<DaySnapshot> {
  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()
  const activePlan = await dietRepo.findActiveByUserId(userId)

  if (!activePlan) {
    return {
      meals: [],
      consumedToday: 0,
      dailyTarget: dailyKcalTarget ?? 2000,
      hasActivePlan: false,
    }
  }

  const todayLogs = await mealLogRepo.findByUserAndDate(userId, new Date())

  return buildDaySnapshot({
    meals: activePlan.meals,
    logs: todayLogs,
    dailyTarget: dailyKcalTarget ?? activePlan.totalKcal,
    hasActivePlan: true,
  })
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const daySnapshot = await getDaySnapshot(
    result.user.id,
    result.user.dailyKcalTarget,
  )

  return <AppProviders daySnapshot={daySnapshot}>{children}</AppProviders>
}
