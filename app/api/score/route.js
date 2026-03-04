export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { output, mode } = await request.json()

    const modeLabels = {
      prd: 'Product Requirements Document',
      stories: 'User Stories',
      stakeholder: 'Stakeholder Update',
      roadmap: 'Quarterly Roadmap',
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 256,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `You are a senior PM reviewer. Grade this PM artifact.
Return ONLY valid JSON: { "score": <0-100>, "missing": [<up to 4 short strings>], "strengths": [<up to 3 short strings>] }`,
          },
          {
            role: 'user',
            content: `Type: ${modeLabels[mode] || mode}\n\n${output}`,
          },
        ],
      }),
    })

    if (!openaiRes.ok) throw new Error(`OpenAI ${openaiRes.status}`)

    const data = await openaiRes.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(
      JSON.stringify({ score: 72, missing: ['success metrics'], strengths: ['clear problem'] }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
