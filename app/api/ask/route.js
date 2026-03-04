import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ASK_SYSTEM = `You are a senior PM who asks razor-sharp clarifying questions before writing any document.
Given raw PM input and the target document type, return exactly 3 questions that, if answered,
would most improve the quality of the output.

Return ONLY valid JSON: { "questions": ["q1", "q2", "q3"] }
No commentary. No markdown. Raw JSON only.`

const MODE_LABELS = {
  prd: 'Product Requirements Document',
  stories: 'User Stories',
  stakeholder: 'Stakeholder Update',
  roadmap: 'Quarterly Roadmap',
}

export async function POST(request) {
  const { input, mode } = await request.json()

  if (!input?.trim()) {
    return new Response(JSON.stringify({ error: 'Input is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 512,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: ASK_SYSTEM },
        {
          role: 'user',
          content: `Target document type: ${MODE_LABELS[mode] || mode}\n\nRaw PM input:\n${input}`,
        },
      ],
    })

    const parsed = JSON.parse(response.choices[0].message.content)
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(
      JSON.stringify({
        questions: [
          'Who is the primary user for this feature?',
          "What's the hard deadline and what happens if you miss it?",
          'Is there an existing solution this replaces, or is this net new?',
        ],
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
