import { supabase } from './supabase'

// Fire-and-forget logging, mirrors logExtractionFailure.js — never blocks or breaks the
// actual notification flow, even if the log write itself fails.
function logWhatsAppSend({ templateName, phone, success, errorMessage, responseData }) {
  supabase.from('whatsapp_send_log').insert({
    template_name: templateName,
    phone: phone || null,
    success,
    error_message: errorMessage ? String(errorMessage).slice(0, 500) : null,
    response_data: responseData ? JSON.stringify(responseData).slice(0, 1000) : null
  }).then(
    () => {},
    e => console.error('Failed to log WhatsApp send (non-critical):', e)
  )
}

const sendWhatsApp = async (phone, templateName, bodyValues, buttonValues = {}) => {
  try {
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, templateName, bodyValues, buttonValues })
    })
    const data = await response.json()
    if (!response.ok) {
      console.error('WhatsApp send failed:', templateName, data.error)
      logWhatsAppSend({ templateName, phone, success: false, errorMessage: data.error })
      return
    }
    console.log('WhatsApp sent:', templateName, data)
    logWhatsAppSend({ templateName, phone, success: true, responseData: data })
    return data
  } catch (e) {
    console.error('WhatsApp error:', e)
    logWhatsAppSend({ templateName, phone, success: false, errorMessage: e.message || String(e) })
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
