export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { recruiterEmail, candidateProfile, jd, company, note, cvBase64, cvName, contactShared } = req.body
  if (!recruiterEmail || !cvBase64) return res.status(400).json({ error: 'Missing required fields' })

  const RESEND_KEY = process.env.RESEND_API_KEY
  if (!RESEND_KEY) return res.status(500).json({ error: 'Email service not configured' })

  const profileSummary = `
SSU ID: SSU-${candidateProfile.id?.slice(0,8).toUpperCase()}
Headline: ${candidateProfile.headline || '—'}
Experience: ${candidateProfile.years_experience || '—'} years
Function: ${candidateProfile.primary_function || '—'}
Industry: ${candidateProfile.current_industry || '—'}
Current CTC: ${candidateProfile.ctc_total ? '₹' + candidateProfile.ctc_total + 'L' : '—'}
Notice Period: ${candidateProfile.notice_period || '—'}
Contact: ${contactShared}
  `.trim()

  const emailBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0A3D35; padding: 24px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">StealthSideUp — Candidate Interest</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">by StorySideUp</p>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <p style="color: #374151; font-size: 14px; line-height: 1.6;">A candidate has expressed interest in your <strong>${jd?.title || 'role'}</strong> search.</p>
    
    ${note ? `<div style="background: #EFF8F6; border-left: 3px solid #0A3D35; padding: 12px 16px; border-radius: 6px; margin: 16px 0;">
      <p style="color: #374151; font-size: 13px; font-style: italic; margin: 0;">"${note}"</p>
    </div>` : ''}

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <h3 style="color: #0A3D35; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px;">Anonymous Profile Summary</h3>
      <pre style="color: #374151; font-size: 13px; line-height: 1.7; font-family: Arial; white-space: pre-wrap; margin: 0;">${profileSummary}</pre>
    </div>

    <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin-top: 20px;">
      Their CV is attached. Please reach out to them directly using the contact details above.<br/>
      StorySideUp is available to support the introduction if needed — reply to this email.
    </p>
  </div>
</div>
  `

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'StealthSideUp <noreply@storysideup.com>',
        to: [recruiterEmail, 'dorasuri@storysideup.com'],
        subject: `StealthSideUp: A candidate is interested in your ${jd?.title || 'role'} search`,
        html: emailBody,
        attachments: [{
          filename: cvName || 'CV.pdf',
          content: cvBase64
        }]
      })
    })

    if (!emailResponse.ok) {
      const err = await emailResponse.text()
      console.error('Resend error:', err)
      return res.status(500).json({ error: 'Failed to send email' })
    }

    res.status(200).json({ success: true })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}
