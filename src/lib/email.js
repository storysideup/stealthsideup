const sendEmail = async (to, subject, html) => {
  try {
    const response = await fetch('/api/send-notification-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html })
    })
    const data = await response.json()
    if (!response.ok) console.error('Email send failed:', subject, data.error)
    return data
  } catch (e) {
    console.error('Email error:', e)
  }
}

const wrap = (title, bodyHtml) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0A3D35; padding: 24px; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 20px;">${title}</h1>
    <p style="color: rgba(255,255,255,0.7); margin: 6px 0 0; font-size: 14px;">StealthSideUp by StorySideUp</p>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    ${bodyHtml}
  </div>
</div>
`

export const sendCorporateWelcomeEmail = (email, name, tokenCount) =>
  sendEmail(email, 'Welcome to StealthSideUp', wrap('Welcome to StealthSideUp',
    `<p style="color:#374151;font-size:14px;line-height:1.6;">Hi ${name},</p>
     <p style="color:#374151;font-size:14px;line-height:1.6;">Your account is ready. You have <strong>${tokenCount} free tokens</strong> to express interest in matched candidate profiles, valid for 30 days.</p>
     <p style="color:#6b7280;font-size:12px;line-height:1.6;margin-top:20px;">Log in at stealthsideup.com to post your first search.</p>`
  ))

export const sendLowTokenAlertEmail = (email, name, tokenCount) =>
  sendEmail(email, 'You are running low on StealthSideUp tokens', wrap('Low Token Balance',
    `<p style="color:#374151;font-size:14px;line-height:1.6;">Hi ${name},</p>
     <p style="color:#374151;font-size:14px;line-height:1.6;">You have <strong>${tokenCount} tokens</strong> remaining. Top up to keep expressing interest in matched candidates.</p>`
  ))

export const sendPasswordResetEmail = (email, resetLink) =>
  sendEmail(email, 'Reset your StealthSideUp password', wrap('Reset Your Password',
    `<p style="color:#374151;font-size:14px;line-height:1.6;">We received a request to reset your StealthSideUp password.</p>
     <p style="margin:20px 0;"><a href="${resetLink}" style="background:#0A3D35;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Reset Password</a></p>
     <p style="color:#6b7280;font-size:12px;line-height:1.6;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't be changed.</p>`
  ))

export const sendTokenCreditConfirmationEmail = (email, companyName, tokensAdded, newBalance) =>
  sendEmail(email, 'Your StealthSideUp tokens have been added', wrap('Tokens Added',
    `<p style="color:#374151;font-size:14px;line-height:1.6;">Hi ${companyName || 'there'},</p>
     <p style="color:#374151;font-size:14px;line-height:1.6;">Payment confirmed — <strong>${tokensAdded} tokens</strong> have been added to your account. Your new balance is <strong>${newBalance} tokens</strong>.</p>
     <p style="color:#6b7280;font-size:12px;line-height:1.6;margin-top:20px;">Log in at stealthsideup.com to start expressing interest in matched candidates.</p>`
  ))
