export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body
  if (!text || text.trim().length < 100) return res.status(400).json({ error: 'Too short' })

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
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Read this CV carefully. Extract the following information and return ONLY a JSON object, no markdown:

{
  "current_industry": "the industry of their most recent/current role — pick from: FMCG, Banking / Financial Services, Insurance, Fintech, IT / Software, SaaS / Product, Internet / E-commerce, Telecom / Wireless, Pharma / Healthcare, Auto / Manufacturing, Retail, Consulting / Professional Services, Media / Entertainment, Real Estate, Education, Events / Hospitality, Other",
  "previous_industries": ["array of up to 3 industries from previous roles, same options as above"],
  "role_type": "Individual Contributor or Team Manager",
  "years_experience": "total years of experience as a number e.g. 15",
  "skills": [
    {
      "subFunction": "specific skill area name",
      "proficiency": "familiar or proficient or expert",
      "specialisation": "most relevant specialisation if clear",
      "proofPoint": "one specific achievement proving this skill — under 140 chars, no company names, use numbers where possible"
    }
  ]
}

Maximum 8 skill entries. Only include skills with clear evidence.

CV text:
${text.slice(0, 8000)}`
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
    res.status(500).json({ error: 'CV extraction failed' })
  }
}
