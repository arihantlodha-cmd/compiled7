import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'edge'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  const { input, mode, systemPrompt } = await request.json()

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: 'Input is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: 'claude-opus-4-5',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: input,
            },
          ],
        })

        for await (const event of anthropicStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta?.type === 'text_delta'
          ) {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(chunk))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        const errChunk = `data: ${JSON.stringify({ error: err.message })}\n\n`
        controller.enqueue(encoder.encode(errChunk))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
