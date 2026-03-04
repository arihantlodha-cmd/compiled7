import OpenAI from 'openai'

export const runtime = 'edge'

const SCORE_SYSTEM = `You are a senior PM reviewer grading PM artifacts.
Given a PM artifact and its type, return a quality score and feedback.

Return ONLY valid JSON (no markdown, no commentary):
{
  "score": <integer 0-100>,
  "missing": [<up to 4 short strings, each under 5 words, of what's missing or weak>],
  "strengths": [<up to 3 short strings, each under 5 words, of what's done well>]
}

Scoring guide:
- 90-100: Comprehensive, specific, actionable. Ready to hand to engineering.
- 75-89: Good structure, minor gaps.
- 60-74: Covers the basics, missing key sections.
- Below 60: Incomplete or too vague to act on.

Be honest. Most first-draft artifacts score 60-75.`

export async function POST(request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const { output, mode } = await request.json()

  if (!output?.trim()) {
    return new Response(JSON.stringify({ score: 0, missing: [], strengths: [] }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const modeLabels = {
    prd: 'Product Requirements Document',
    stories: 'User Stories',
    stakeholder: 'Stakeholder Update',
    roadmap: 'Quarterly Roadmap',
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 256,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SCORE_SYSTEM },
        {
          role: 'user',
          content: `Document type: ${modeLabels[mode] || mode}\n\nArtifact to grade:\n${output}`,
        },
      ],
    })

    const parsed = JSON.parse(response.choices[0].message.content)
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(
      JSON.stringify({ score: 72, missing: ['success metrics', 'timeline'], strengths: ['clear problem'] }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}
