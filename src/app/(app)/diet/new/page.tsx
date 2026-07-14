import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { NewDietTabs } from "@/components/diet/new-diet-tabs"

export default async function NewDietPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  return <NewDietTabs />
}
