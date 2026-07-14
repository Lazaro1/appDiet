import { prisma } from "../prisma"
import type { ChatMessage } from "@/generated/prisma"
import type { ChatRole } from "@/generated/prisma"

export class ChatMessageRepository {
  async findBySessionId(userId: string, sessionId: string): Promise<ChatMessage[]> {
    return prisma.chatMessage.findMany({
      where: { userId, sessionId },
      orderBy: { createdAt: "asc" },
    })
  }

  async create(data: {
    userId: string
    role: ChatRole
    content: string
    sessionId: string
  }): Promise<ChatMessage> {
    return prisma.chatMessage.create({ data })
  }

  async getTodaySessionId(userId: string): Promise<string> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateStr = today.toISOString().split("T")[0]
    return `${userId}-${dateStr}`
  }
}
