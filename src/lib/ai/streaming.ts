export function createSSEStream(
  generator: AsyncGenerator<string, void, unknown>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"))
      } catch (error) {
        const message = error instanceof Error ? error.message : "Stream error"
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })
}

export function sseResponse(stream: ReadableStream<Uint8Array>): Response {
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
