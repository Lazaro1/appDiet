import { redirect, notFound } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { DietReviewActions } from "@/components/diet/diet-review-actions"

export default async function DietReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const { id } = await params
  const repo = new DietPlanRepository()
  const plan = await repo.findById(id)

  if (!plan || plan.userId !== result.user.id) notFound()

  return (
    <DietReviewActions
      planId={plan.id}
      planName={plan.name}
      totalKcal={plan.totalKcal}
      meals={plan.meals}
      reviewStatus={plan.review?.status ?? "pending"}
      isActive={plan.isActive}
    />
  )
}
