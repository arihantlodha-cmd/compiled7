export const dynamic = 'force-dynamic'

export async function GET() {
  const hasKey = !!process.env.OPENAI_API_KEY
  const keyPreview = hasKey
    ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...`
    : 'NOT SET'

  // Quick test call to OpenAI
  let openaiStatus = 'untested'
  if (hasKey) {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      })
      openaiStatus = res.ok ? `ok (${res.status})` : `error (${res.status})`
    } catch (err) {
      openaiStatus = `fetch failed: ${err.message}`
    }
  }

  return new Response(
    JSON.stringify({ hasKey, keyPreview, openaiStatus }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  )
}
