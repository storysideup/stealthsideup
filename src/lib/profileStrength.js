// Shared profile-completeness check, used both for the Complete/Partial match badges
// and for the profile-nudge WhatsApp message's strength percentage. One source of truth
// so the two don't drift out of sync with different ideas of what "complete" means.
const PROFILE_STRENGTH_FIELDS = [
  c => !!(c.ctc_total || c.min_expected_ctc),
  c => !!c.highest_degree,
  c => !!c.role_type,
  c => !!c.notice_period,
  c => !!(c.skill_tree && Object.keys(c.skill_tree).length > 0),
  c => !!(c.career_history?.length > 0),
  c => !!(c.preferred_locations?.cities?.length > 0),
]

const PROFILE_STRENGTH_LABELS = [
  'CTC', 'Highest Degree', 'Role Type', 'Notice Period', 'Skills', 'Career History', 'Preferred Locations'
]

export function computeProfileStrength(candidate) {
  const filledCount = PROFILE_STRENGTH_FIELDS.filter(check => check(candidate)).length
  const percent = Math.round((filledCount / PROFILE_STRENGTH_FIELDS.length) * 100)
  const missing = PROFILE_STRENGTH_FIELDS
    .map((check, i) => (check(candidate) ? null : PROFILE_STRENGTH_LABELS[i]))
    .filter(Boolean)
  return { percent, missing }
}
