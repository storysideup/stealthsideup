// Emails a token purchase request to StorySideUp so payment/invoicing can be
// handled offline, then tokens credited manually via Admin Panel.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { company, gst, email, po, pack, corporateId, needsInvoice } = req.body
  if (!company || !email || !pack) return res.status(400).json({ error: 'company, email and pack are required' })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' })

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color:#0A3D35;">New Token Purchase Request</h2>
      <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
        <tr><td style="padding:6px 0; color:#6b7280;">Company</td><td style="padding:6px 0; font-weight:600;">${company}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Corporate ID</td><td style="padding:6px 0; font-weight:600;">${corporateId || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Pack requested</td><td style="padding:6px 0; font-weight:600;">${pack.tokens} tokens — ₹${pack.price?.toLocaleString('en-IN')} + GST (${pack.label})</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Billing email</td><td style="padding:6px 0; font-weight:600;">${email}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">Needs formal invoice</td><td style="padding:6px 0; font-weight:600;">${needsInvoice ? 'Yes' : 'No'}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">GSTIN</td><td style="padding:6px 0; font-weight:600;">${gst || '—'}</td></tr>
        <tr><td style="padding:6px 0; color:#6b7280;">PO Number</td><td style="padding:6px 0; font-weight:600;">${po || '—'}</td></tr>
      </table>
      <p style="color:#6b7280; font-size:12px; margin-top:16px;">Follow up to collect payment, then credit tokens manually via Admin Panel → Tokens tab.</p>
    </div>
  `

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'StealthSideUp <noreply@storysideup.com>',
        to: ['dorasuri@storysideup.com'],
        reply_to: email,
        subject: `Token purchase request: ${company} (${pack.tokens} tokens)`,
        html
      })
    })
    if (!response.ok) {
      const err = await response.text()
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send request' })
    }
    return res.status(200).json({ success: true })
  } catch (e) {
    console.error('Invoice request error:', e)
    return res.status(500).json({ error: e.message || 'Unknown error' })
  }
}
