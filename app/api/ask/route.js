export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { input, mode } = await request.json()

    const modeLabels = {
      prd: 'Product Requirements Document',
      stories: 'User Stories',
      stakeholder: 'Stakeholder Update',
      roadmap: 'Quarterly Roadmap',
    }

    const openaiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'HTTP-Referer': 'https://compiled7.vercel.app',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b:free',
        max_tokens: 512,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a senior PM who asks razor-sharp clarifying questions before writing any document.
Return ONLY valid JSON: { "questions": ["q1", "q2", "q3"] }`,
          },
          {
            role: 'user',
            content: `Document type: ${modeLabels[mode] || mode}\n\n${input}`,
          },
        ],
      }),
    })

    if (!openaiRes.ok) {
      throw new Error(`OpenAI ${openaiRes.status}`)
    }

    const data = await openaiRes.json()
    const parsed = JSON.parse(data.choices[0].message.content)
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
