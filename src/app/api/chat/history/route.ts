import { requireApiUser, apiSuccess } from "@/lib/auth/require-api-user"
import { ChatMessageRepository } from "@/lib/db/repositories/chat-message-repository"

export async function GET() {
  const { user, error } = await requireApiUser()
  if (error) return error

  const chatRepo = new ChatMessageRepository()
  const sessionId = await chatRepo.getTodaySessionId(user!.id)
  const messages = await chatRepo.findBySessionId(user!.id, sessionId)

  return apiSuccess({ messages, sessionId })
}
