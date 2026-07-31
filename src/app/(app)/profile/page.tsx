import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { ProfileView } from "@/components/profile/profile-view"
import { parseUserPreferences } from "@/lib/diet/map-ai-plan"

export default async function ProfilePage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { user } = result
  const prefs = parseUserPreferences(user.preferences)

  const dietRepo = new DietPlanRepository()
  const activePlan = await dietRepo.findActiveByUserId(user.id)

  return (
    <ProfileView
      hasActivePlan={Boolean(activePlan)}
      planName={activePlan?.name ?? null}
      initial={{
        name: user.name,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().split("T")[0]
          : "",
        sex: user.sex ?? "male",
        weight: user.weight ?? 70,
        height: user.height ?? 170,
        goal: user.goal ?? "maintain",
        activityLevel: user.activityLevel ?? "moderate",
        restrictions: user.restrictions ?? "",
        conditions: user.conditions ?? "",
        foodPreferences: prefs?.foodPreferences ?? "",
        mealsPerDay: prefs?.mealsPerDay ?? 4,
        bmr: user.bmr,
        tdee: user.tdee,
        dailyKcalTarget: user.dailyKcalTarget,
      }}
    />
  )
}
