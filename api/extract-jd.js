export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body
  if (!text || text.trim().length < 50) return res.status(400).json({ error: 'Too short' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Extract structured information from this job description. Return ONLY a JSON object, no markdown, no explanation:
{
  "role_title": "exact job title",
  "job_function": "one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Procurement & Sourcing, Design & Creative, Technology & Product, Legal & Compliance, Strategy & Consulting, General Management / P&L, Administration & Facilities, Production & Manufacturing, Engineering (Civil / Mechanical / Electrical), Research & Development, Customer Success & Service, Content & Editorial, Training & Facilitation, Investor Relations & Corporate Finance, Import / Export & International Trade",
  "seniority_level": "one of: Junior (0-5 yrs, individual contributor), Mid (5-12 yrs, may lead small teams), Senior (12-20 yrs, leads functions or large teams), Leadership (20+ yrs, CXO / functional head)",
  "role_type": "Individual Contributor or Team Manager",
  "role_context": "2-3 sentences on what this person owns and what success looks like — max 280 chars",
  "why_role": "1-2 sentences on why this is exciting — max 180 chars",
  "employment_type": "Full-time or Freelance / Contract or Fractional",
  "location": "city name only",
  "ctc_fixed_min": number in lakhs or null,
  "ctc_fixed_max": number in lakhs or null
}

JD:
${text}`
        }]
      })
    })

    const data = await response.json()
    const rawText = data.content?.[0]?.text || ''
    const clean = rawText.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)
    res.status(200).json({ success: true, data: parsed })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Extraction failed' })
  }
}
