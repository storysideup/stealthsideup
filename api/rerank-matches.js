// Re-ranks an already structurally-qualified shortlist of candidates for one JD,
// using the free-text "what are you looking for" (candidate headline) against
// "who are you looking for" (JD role_context / why_role).
//
// Deliberately NOT a full matching engine on its own — structured filtering in
// Corporate.jsx already decided who qualifies (hard filters: CTC, notice period,
// gender preference, blocked companies, etc., plus the weighted score threshold).
// This only re-orders and annotates that already-small shortlist, so it stays
// cheap and fast regardless of how large the overall candidate/JD pool grows.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { jd, candidates } = req.body || {}
  if (!jd || !Array.isArray(candidates) || candidates.length === 0) {
    return res.status(400).json({ error: 'jd and a non-empty candidates array are required' })
  }

  // Nothing meaningful to compare against — skip the AI call rather than waste one
  if (!jd.role_context && !jd.why_role) {
    return res.status(200).json({ rankings: candidates.map(c => ({ id: c.id, fitScore: 50, fitNote: null })) })
  }

  const candidateLines = candidates
    .filter(c => c.headline)
    .map(c => `- id: ${c.id}\n  headline: "${c.headline}"`)
    .join('\n')

  const prompt = `A recruiter is hiring for this role:
Title: ${jd.role_title || 'Not specified'}
What they're looking for: ${jd.role_context || 'Not specified'}
${jd.why_role ? `Why the role is compelling: ${jd.why_role}` : ''}

Here are candidates who already passed structured filtering (function, seniority, CTC, location, etc. already confirmed to fit). For each, read their own words about what they're looking for, and judge how well it aligns with what this recruiter wants:

${candidateLines}

Return ONLY a valid JSON array, no markdown, no backticks:
[{"id":"the candidate id exactly as given","fitScore":0-100,"fitNote":"one short sentence, under 20 words, on why this is or isn't a strong fit based on what they said they want"}]

Score based on genuine alignment of intent, not just keyword overlap. A candidate who didn't mention anything relevant should score around 50 (neutral), not be penalized as a bad fit — they simply didn't rule themselves out or in. Only give a low score if there's an actual stated mismatch (e.g., they say they want IC roles and this is a people-manager role, or they specify a company type / stage the recruiter's role doesn't match).`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    })
    const data = await response.json()
    const text = data.content?.[0]?.text || '[]'
    const cleaned = text.replace(/```json|```/g, '').trim()
    const rankings = JSON.parse(cleaned)
    res.status(200).json({ rankings })
  } catch (e) {
    console.error('Rerank failed:', e)
    // Fail open — the caller should fall back to the existing structured order
    res.status(200).json({ rankings: candidates.map(c => ({ id: c.id, fitScore: 50, fitNote: null })) })
  }
}
