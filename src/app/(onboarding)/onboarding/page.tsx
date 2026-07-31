import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { UserRepository } from "@/lib/db/repositories/user-repository"
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard"

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/sign-in")

  // Check if user already completed onboarding
  const userRepo = new UserRepository()
  let user = await userRepo.findByClerkId(clerkId)

  if (!user) {
    // Auto-create user from Clerk data
    const clerkUser = await currentUser()
    if (!clerkUser) redirect("/sign-in")

    const name = clerkUser.fullName || clerkUser.firstName || "Paciente"
    const email = clerkUser.emailAddresses[0]?.emailAddress || ""

    user = await userRepo.findOrCreateByClerkId({ clerkId, name, email })
  }

  if (user.onboardingCompleted) {
    redirect("/")
  }

  return <OnboardingWizard />
}
