import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { MealLogRepository } from "@/lib/db/repositories/meal-log-repository"
import { AppShell } from "@/components/layout/app-shell"

async function getFabHref(userId: string): Promise<string | null> {
  const dietRepo = new DietPlanRepository()
  const mealLogRepo = new MealLogRepository()
  const activePlan = await dietRepo.findActiveByUserId(userId)

  if (!activePlan) return "/diet/new"

  const todayLogs = await mealLogRepo.findByUserAndDate(userId, new Date())
  const loggedMealIds = new Set(
    todayLogs.filter((log) => log.mealId).map((log) => log.mealId!),
  )

  const pending = activePlan.meals.find((meal) => !loggedMealIds.has(meal.id))
  return pending ? `/meals/${pending.id}` : null
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

  const fabHref = await getFabHref(result.user.id)

  return (
    <AppShell fabHref={fabHref}>
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 pb-20 md:pb-0 md:pl-64">{children}</main>
      </div>
    </AppShell>
  )
}
