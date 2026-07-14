import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { ProfileForm } from "@/components/profile/profile-form"
import { parseUserPreferences } from "@/lib/diet/map-ai-plan"

export default async function ProfilePage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { user } = result
  const prefs = parseUserPreferences(user.preferences)

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Perfil</h1>
        <p className="text-sm text-muted-foreground">Edite seus dados e preferências</p>
      </header>

      <ProfileForm
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
    </div>
  )
}
