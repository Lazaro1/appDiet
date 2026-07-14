import { requireApiUser, apiError } from "@/lib/auth/require-api-user"
import { ChatMessageRepository } from "@/lib/db/repositories/chat-message-repository"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { getAIProvider } from "@/lib/ai/factory"
import { SYSTEM_PROMPT } from "@/lib/ai/prompts"
import { createSSEStream, sseResponse } from "@/lib/ai/streaming"

function buildContextPrompt(user: {
  name: string
  dailyKcalTarget: number | null
  goal: string | null
}, activePlan: { name: string; totalKcal: number; meals: Array<{ name: string; kcalTarget: number }> } | null) {
  let context = `\n\nContexto do paciente:\n- Nome: ${user.name}\n- Meta diária: ${user.dailyKcalTarget ?? "não definida"} kcal\n- Objetivo: ${user.goal ?? "não definido"}`
  if (activePlan) {
    context += `\n- Plano ativo: ${activePlan.name} (${activePlan.totalKcal} kcal/dia)`
    context += `\n- Refeições: ${activePlan.meals.map((m) => `${m.name} (${m.kcalTarget} kcal)`).join(", ")}`
  }
  return context
}

export async function POST(request: Request) {
  const { user, error } = await requireApiUser()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const message = body.message as string | undefined
  if (!message?.trim()) return apiError("Mensagem é obrigatória")

  const chatRepo = new ChatMessageRepository()
  const dietRepo = new DietPlanRepository()
  const sessionId = await chatRepo.getTodaySessionId(user!.id)

  await chatRepo.create({
    userId: user!.id,
    role: "user",
    content: message,
    sessionId,
  })

  const history = await chatRepo.findBySessionId(user!.id, sessionId)
  const activePlan = await dietRepo.findActiveByUserId(user!.id)

  const systemPrompt = SYSTEM_PROMPT + buildContextPrompt(user!, activePlan)

  const messages = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))

  const ai = getAIProvider()

  const stream = createSSEStream(
    (async function* () {
      let fullContent = ""
      try {
        for await (const chunk of ai.chatStream({ messages, systemPrompt })) {
          fullContent += chunk
          yield chunk
        }
      } catch {
        const fallback = await ai.chat({ messages, systemPrompt })
        fullContent = fallback.content
        yield fallback.content
      }

      if (fullContent) {
        await chatRepo.create({
          userId: user!.id,
          role: "assistant",
          content: fullContent,
          sessionId,
        })
      }
    })(),
  )

  return sseResponse(stream)
}
