export default async function handler(req, res) {
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
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Read this CV. Extract the candidate's top skills with proof points from their actual experience.

Return ONLY a JSON array, no markdown, no explanation:
[
  {
    "subFunction": "specific skill area name",
    "proficiency": "familiar or proficient or expert",
    "specialisation": "most relevant specialisation if clear",
    "proofPoint": "one specific achievement proving this skill — under 140 chars, no company names, use numbers where possible",
    "customDepth": "any specific tool or platform"
  }
]

Maximum 8 entries. Only include skills with clear evidence. Do not invent skills.

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
