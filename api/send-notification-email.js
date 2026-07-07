// Generic transactional email sender via Resend. Used as the email fallback
// for corporate notifications (welcome, low-token alert) when no phone
// number was given for WhatsApp.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, subject, html } = req.body
  if (!to || !subject || !html) return res.status(400).json({ error: 'to, subject and html are required' })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' })

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'StealthSideUp <noreply@storysideup.com>',
        to: [to],
        subject,
        html
      })
    })
    if (!emailResponse.ok) {
      const err = await emailResponse.text()
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }
    return res.status(200).json({ success: true })
  } catch (e) {
    console.error('Email send error:', e)
    return res.status(500).json({ error: e.message || 'Unknown error' })
  }
}
