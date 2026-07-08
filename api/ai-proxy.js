// Server-side proxy for all client-triggered Anthropic calls (CV parsing, JD parsing,
// skill auto-fill). The API key stays here, in process.env, and is never sent to the browser.
// Client components POST the same { model, max_tokens, messages } body they used to send
// directly to api.anthropic.com, and get back the same raw Anthropic response shape.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { model, max_tokens, messages } = req.body || {}
  if (!model || !messages) return res.status(400).json({ error: 'model and messages are required' })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({ model, max_tokens: max_tokens || 1000, messages })
    })
    const data = await response.json()
    res.status(response.status).json(data)
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'AI request failed' })
  }
}
