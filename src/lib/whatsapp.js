const INTERAKT_API_KEY = import.meta.env.VITE_INTERAKT_KEY

const sendWhatsApp = async (phone, templateName, bodyValues, buttonValues = []) => {
  if (!INTERAKT_API_KEY) { console.warn('Interakt key not set'); return }
  
  // Format Indian number
  const formatted = phone.replace(/\D/g, '')
  const e164 = formatted.startsWith('91') ? formatted : `91${formatted}`

  try {
    const response = await fetch('https://api.interakt.ai/v1/public/message/', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${INTERAKT_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        countryCode: '+91',
        phoneNumber: e164,
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
    console.log('WhatsApp sent:', templateName, data)
    return data
  } catch (e) {
    console.error('WhatsApp error:', e)
  }
}

// 1. Candidate welcome — fired on registration
export const sendCandidateWelcome = (phone, name) =>
  sendWhatsApp(phone, 'ssu_candidate_welcome', [name])

// 2. Match notification — fired when corporate expresses interest
export const sendMatchNotification = (phone, name, function_, roleDetails) =>
  sendWhatsApp(phone, 'ssu_match_notification', [name, function_, roleDetails])

// 3. CV reminder — fired 24hrs after candidate says yes but no CV uploaded
export const sendCVReminder = (phone, name, function_) =>
  sendWhatsApp(phone, 'ssu_cv_reminder', [name, function_])

// 4. Weekly pulse — fired every Monday for all active candidates
export const sendWeeklyPulse = (phone, name, companyCount, function_, matchSummary) =>
  sendWhatsApp(phone, 'ssu_weekly_pulse', [name, String(companyCount), function_, matchSummary])

// 5. Profile nudge — fired 3 days after registration if profile incomplete
export const sendProfileNudge = (phone, name, strengthPercent, missingFields) =>
  sendWhatsApp(phone, 'ssu_profile_nudge', [name, String(strengthPercent), missingFields])

// 6. Low token alert — fired when corporate tokens drop to 2
export const sendLowTokenAlert = (phone, name, tokenCount) =>
  sendWhatsApp(phone, 'ssu_low_token_alert', [name, String(tokenCount)])

// 7. Corporate welcome — fired on corporate registration
export const sendCorporateWelcome = (phone, name, tokenCount) =>
  sendWhatsApp(phone, 'ssu_corporate_welcome', [name, String(tokenCount)])
