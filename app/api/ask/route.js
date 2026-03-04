import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const ASK_SYSTEM = `You are a senior PM who asks razor-sharp clarifying questions before writing any document.
Given raw PM input and the target document type, return exactly 3 questions that, if answered,
would most improve the quality of the output.

Return ONLY valid JSON: { "questions": ["q1", "q2", "q3"] }
No commentary. No markdown. Raw JSON only.`

export async function POST(request) {
  const { input, mode } = await request.json()

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: 'Input is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const modeLabels = {
    prd: 'Product Requirements Document',
    stories: 'User Stories',
    stakeholder: 'Stakeholder Update',
    roadmap: 'Quarterly Roadmap',
  }

  const userMessage = `Target document type: ${modeLabels[mode] || mode}

Raw PM input:
${input}`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 512,
      system: ASK_SYSTEM,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    const rawText = message.content[0]?.text || '{}'

    // Extract JSON — sometimes model wraps in backticks
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText)

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({
        questions: [
          'Who is the primary user for this feature or product?',
          "What's the hard deadline and what are the consequences of missing it?",
          'Is there an existing solution this replaces, or is this net new?',
        ],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
