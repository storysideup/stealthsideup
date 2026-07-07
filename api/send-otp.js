// Sends a real OTP via MSG91 SendOTP API to an Indian mobile number.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { contact } = req.body
  if (!contact) return res.status(400).json({ error: 'Phone number is required' })

  // Normalize: strip everything but digits, then ensure it has the 91 country code
  const digits = contact.replace(/\D/g, '')
  let mobile
  if (digits.length === 10) mobile = '91' + digits
  else if (digits.length === 12 && digits.startsWith('91')) mobile = digits
  else return res.status(400).json({ error: 'Enter a valid 10-digit Indian mobile number' })

  const AUTH_KEY = process.env.MSG91_AUTH_KEY
  const TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID
  if (!AUTH_KEY || !TEMPLATE_ID) return res.status(500).json({ error: 'OTP service not configured' })

  try {
    const url = `https://control.msg91.com/api/v5/otp?template_id=${TEMPLATE_ID}&mobile=${mobile}&authkey=${AUTH_KEY}&otp_length=6`
    const response = await fetch(url, { method: 'POST' })
    const data = await response.json()

    if (data.type === 'success') {
      return res.status(200).json({ success: true, requestId: data.request_id })
    }
    return res.status(400).json({ error: data.message || 'Could not send OTP. Please try again.' })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reach OTP service: ' + (e.message || 'Unknown error') })
  }
}
