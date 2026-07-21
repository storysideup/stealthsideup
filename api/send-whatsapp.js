// Sends a WhatsApp template message via Interakt. Runs server-side so the
// Interakt API key never reaches the browser bundle.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { phone, templateName, bodyValues = [], buttonValues = [] } = req.body
  if (!phone || !templateName) return res.status(400).json({ error: 'phone and templateName are required' })

  const INTERAKT_API_KEY = process.env.INTERAKT_API_KEY
  if (!INTERAKT_API_KEY) return res.status(500).json({ error: 'WhatsApp service not configured' })

  // Interakt expects phoneNumber as just the 10-digit local number, with countryCode
  // carrying the prefix separately — NOT the country code baked into phoneNumber too.
  // Always take the last 10 digits, which correctly handles every input variation
  // (91 prefix, +91 prefix, leading 0, or an already-clean 10-digit number).
  const digits = phone.replace(/\D/g, '').slice(-10)

  try {
    const response = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${INTERAKT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: digits,
        type: 'Template',
        template: {
          name: templateName,
          languageCode: 'en',
          bodyValues,
          buttonValues
        }
      })
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('Interakt error:', data)
      return res.status(400).json({ error: data.message || 'Failed to send WhatsApp message' })
    }
    return res.status(200).json({ success: true, data })
  } catch (e) {
    console.error('WhatsApp send error:', e)
    return res.status(500).json({ error: 'Failed to reach WhatsApp service: ' + (e.message || 'Unknown error') })
  }
}
