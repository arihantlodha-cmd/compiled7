import OpenAI from 'openai'

export const runtime = 'edge'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
        const openaiStream = await client.chat.completions.create({
          model: 'gpt-4o',
          max_tokens: 4096,
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: input },
          ],
        })

        for await (const chunk of openaiStream) {
          const text = chunk.choices[0]?.delta?.content || ''
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            )
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        )
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
