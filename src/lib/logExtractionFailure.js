import { supabase } from './supabase'

// Fire-and-forget logging of AI extraction failures, so Dora can see the real failure rate
// over time instead of only hearing about it when a candidate happens to complain.
// Never awaited by callers in a way that could delay or break the user-facing fallback —
// if logging itself fails, that's swallowed silently, since a broken log must never become
// a second reason someone's CV upload experience gets worse.
export function logExtractionFailure({ extractionType, errorType, errorMessage, contact, fileType }) {
  supabase.from('extraction_failures').insert({
    extraction_type: extractionType, // 'cv_prefill' | 'jd_extraction' | 'skill_autofill'
    error_type: errorType, // 'syntax_error' | 'other'
    error_message: errorMessage ? String(errorMessage).slice(0, 500) : null,
    contact: contact || null,
    file_type: fileType || null
  }).then(
    () => {},
    e => console.error('Failed to log extraction failure (non-critical):', e)
  )
}
