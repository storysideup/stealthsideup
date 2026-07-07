// Verifies an OTP via MSG91's verify endpoint. MSG91 handles the actual
// matching/expiry server-side — we just relay the mobile + code.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { contact, otp } = req.body
  if (!contact || !otp) return res.status(400).json({ error: 'Phone number and OTP are required' })
  if (!/^\d{4,6}$/.test(otp)) return res.status(400).json({ error: 'Enter the OTP code' })

  const digits = contact.replace(/\D/g, '')
  let mobile
  if (digits.length === 10) mobile = '91' + digits
  else if (digits.length === 12 && digits.startsWith('91')) mobile = digits
  else return res.status(400).json({ error: 'Invalid phone number' })

  const AUTH_KEY = process.env.MSG91_AUTH_KEY
  if (!AUTH_KEY) return res.status(500).json({ error: 'OTP service not configured' })

  try {
    const url = `https://control.msg91.com/api/v5/otp/verify?otp=${otp}&mobile=${mobile}`
    const response = await fetch(url, {
      method: 'GET',
      headers: { authkey: AUTH_KEY }
    })
    const data = await response.json()

    if (data.type === 'success') {
      return res.status(200).json({ success: true })
    }
    return res.status(400).json({ error: data.message || 'Incorrect or expired OTP' })
  } catch (e) {
    return res.status(500).json({ error: 'Failed to reach OTP service: ' + (e.message || 'Unknown error') })
  }
}
