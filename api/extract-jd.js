export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body
  if (!text || text.trim().length < 50) return res.status(400).json({ error: 'Too short' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Extract structured information from this job description. Return ONLY a valid JSON object, no markdown, no backticks, no explanation:
{"role_title":"exact job title","job_function":"one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Technology & Product, Legal & Compliance, Strategy & Consulting, General Management / P&L","seniority_level":"one of: Junior (0-5 yrs, individual contributor), Mid (5-12 yrs, may lead small teams), Senior (12-20 yrs, leads functions or large teams), Leadership (20+ yrs, CXO / functional head)","role_type":"Individual Contributor or Team Manager","role_context":"2-3 sentences on what this person owns — max 280 chars","why_role":"1-2 sentences on why exciting — max 180 chars","employment_type":"Full-time","location":"city name only","ctc_fixed_min":null,"ctc_fixed_max":null}

JD: ${text.slice(0, 3000)}`
        }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic error:', err)
      return res.status(500).json({ error: 'AI service error: ' + response.status })
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json({ success: true, data: parsed })
  } catch (e) {
    console.error('Extract JD error:', e.message)
    res.status(500).json({ error: 'Extraction failed: ' + e.message })
  }
}
