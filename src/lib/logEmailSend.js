import { supabase } from './supabase'

// Fire-and-forget logging of every email send attempt, mirroring logExtractionFailure.js
// and the WhatsApp send logging — never blocks or breaks the actual email flow, even if
// the log write itself fails.
export function logEmailSend({ emailType, recipient, success, errorMessage }) {
  supabase.from('email_send_log').insert({
    email_type: emailType, // 'notification' | 'cv_to_recruiter'
    recipient: recipient || null,
    success,
    error_message: errorMessage ? String(errorMessage).slice(0, 500) : null
  }).then(
    () => {},
    e => console.error('Failed to log email send (non-critical):', e)
  )
}
