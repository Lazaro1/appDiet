import { auth, currentUser } from "@clerk/nextjs/server"
import { UserRepository } from "@/lib/db/repositories/user-repository"
import type { User } from "@/generated/prisma"

export interface AuthenticatedUserResult {
  user: User
  redirectTo?: string
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUserResult | null> {
  const { userId: clerkId } = await auth()
  if (!clerkId) return null

  const userRepo = new UserRepository()
  let user = await userRepo.findByClerkId(clerkId)

  if (!user) {
    const clerkUser = await currentUser()
    if (!clerkUser) return null

    const name = clerkUser.fullName || clerkUser.firstName || "Paciente"
    const email = clerkUser.emailAddresses[0]?.emailAddress || ""
    user = await userRepo.create({ clerkId, name, email })
  }

  if (!user.onboardingCompleted) {
    return { user, redirectTo: "/onboarding" }
  }

  return { user }
}

export async function requireAuthenticatedUser(): Promise<User> {
  const result = await getAuthenticatedUser()
  if (!result) {
    throw new Error("Não autenticado")
  }
  return result.user
}
