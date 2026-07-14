import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { UserRepository } from "@/lib/db/repositories/user-repository"
import type { User } from "@/generated/prisma"

export type ApiUserResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse }

export async function requireApiUser(options?: {
  requireOnboarding?: boolean
}): Promise<ApiUserResult> {
  const { userId: clerkId } = await auth()

  if (!clerkId) {
    return {
      user: null,
      error: NextResponse.json({ error: "Não autenticado" }, { status: 401 }),
    }
  }

  const userRepo = new UserRepository()
  let user = await userRepo.findByClerkId(clerkId)

  if (!user) {
    const clerkUser = await currentUser()
    if (!clerkUser) {
      return {
        user: null,
        error: NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 }),
      }
    }

    const name = clerkUser.fullName || clerkUser.firstName || "Paciente"
    const email = clerkUser.emailAddresses[0]?.emailAddress || ""
    user = await userRepo.create({ clerkId, name, email })
  }

  if (options?.requireOnboarding !== false && !user.onboardingCompleted) {
    return {
      user: null,
      error: NextResponse.json({ error: "Onboarding incompleto" }, { status: 403 }),
    }
  }

  return { user, error: null }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status })
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}
