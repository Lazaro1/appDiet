/** Maps low-level AI/provider errors to user-facing Portuguese messages. */
export function toUserFacingAiError(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Erro ao processar com IA. Tente novamente."
  }

  const message = err.message.toLowerCase()

  if (message.includes("json") || message.includes("validation")) {
    return "A IA retornou uma resposta inválida. Tente gerar novamente."
  }

  if (message.includes("both primary and fallback") || message.includes("openrouter")) {
    return "Serviço de IA indisponível no momento. Tente em alguns minutos."
  }

  return err.message
}
