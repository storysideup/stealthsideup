import { INDUSTRIES, CAREER_ROLE_TYPES, ROLE_TENURES, FUNCTIONS, SKILLS_BY_FUNCTION } from '../data/formData'

const EMPTY_ROLE = {
  industry: '',
  org_type: '',
  role_type: '',
  primary_function: '',
  key_skills: [],
  tenure: ''
}

const ORG_TYPES_SHORT = [
  "Large Indian Conglomerate",
  "Mid-size Indian Company",
  "Indian Startup — Early Stage",
  "Indian Startup — Growth Stage",
  "MNC / International",
  "Own Venture / Founded"
]

function RoleCard({ role, index, onChange, label }) {
  const set = (k, v) => onChange({ ...role, [k]: v })
  const skillOptions = role.primary_function && SKILLS_BY_FUNCTION[role.primary_function]
    ? SKILLS_BY_FUNCTION[role.primary_function]
    : []

  const toggleSkill = (skill) => {
    const current = role.key_skills || []
    const updated = current.includes(skill)
      ? current.filter(s => s !== skill)
      : current.length < 6 ? [...current, skill] : current
    set('key_skills', updated)
  }

  return (
    <div style={{
      border: '1.5px solid var(--grey-200)', borderRadius: 12,
      padding: 16, marginBottom: 16, background: index === 0 ? 'var(--teal-light)' : 'white'
    }}>
      {/* Role label */}
      <div style={{
        fontSize: 12, fontWeight: 700, color: index === 0 ? 'var(--teal)' : 'var(--grey-400)',
        textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14
      }}>
        {label}
      </div>

      {/* Industry */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Industry</div>
        <select className="form-select" value={role.industry || ''} onChange={e => set('industry', e.target.value)}>
          <option value="">Select industry...</option>
          {INDUSTRIES.map(group => (
            <optgroup key={group.sector} label={group.sector}>
              {group.items.map(item => <option key={item} value={item}>{item}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      {/* Org type */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Organisation Type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ORG_TYPES_SHORT.map(type => (
            <button key={type} type="button"
              className={`tag ${role.org_type === type ? 'selected' : ''}`}
              onClick={() => set('org_type', type)}
              style={{ fontSize: 12 }}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Role type / team size */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Role Type</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CAREER_ROLE_TYPES.map(type => (
            <button key={type} type="button"
              className={`tag ${role.role_type === type ? 'selected' : ''}`}
              onClick={() => set('role_type', type)}
              style={{ fontSize: 12 }}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Function */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Primary Function</div>
        <select className="form-select" value={role.primary_function || ''}
          onChange={e => set('primary_function', e.target.value)}>
          <option value="">Select function...</option>
          {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Key skills — up to 6 */}
      {skillOptions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>
            Key Skills in This Role
            <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, textTransform: 'none', color: 'var(--grey-400)' }}>up to 6</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {skillOptions.map(skill => (
              <button key={skill} type="button"
                className={`tag ${(role.key_skills || []).includes(skill) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill)}
                style={{ fontSize: 12 }}>
                {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tenure */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Tenure in This Role</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {ROLE_TENURES.map(t => (
            <button key={t} type="button"
              className={`tag ${role.tenure === t ? 'selected' : ''}`}
              onClick={() => set('tenure', t)}
              style={{ fontSize: 12 }}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CareerHistory({ value = [], onChange }) {
  // Ensure exactly 3 roles
  const roles = [
    value[0] || { ...EMPTY_ROLE },
    value[1] || { ...EMPTY_ROLE },
    value[2] || { ...EMPTY_ROLE },
  ]

  const updateRole = (idx, updated) => {
    const newRoles = [...roles]
    newRoles[idx] = updated
    onChange(newRoles)
  }

  const labels = ['Current Role', 'Previous Role', 'Role Before That']

  const isComplete = (role) => role.industry && role.org_type && role.role_type && role.tenure

  const completedCount = roles.filter(isComplete).length

  return (
    <div>
      {/* Progress indicator */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {roles.map((role, i) => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: isComplete(role) ? 'var(--teal)' : 'var(--grey-200)'
          }} />
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 16 }}>
        {completedCount} of 3 roles completed
        {completedCount < 3 && <span style={{ color: 'var(--orange)', marginLeft: 6 }}>— all 3 required</span>}
      </div>

      {labels.map((label, i) => (
        <RoleCard
          key={i}
          index={i}
          label={label}
          role={roles[i]}
          onChange={(updated) => updateRole(i, updated)}
        />
      ))}
    </div>
  )
}

// Export a display component for the corporate match view
export function CareerHistoryDisplay({ careerHistory = [] }) {
  if (!careerHistory || careerHistory.length === 0) return (
    <div style={{ fontSize: 12, color: 'var(--grey-400)', fontStyle: 'italic' }}>Career history not provided</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {careerHistory.map((role, i) => (
        <div key={i} style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          padding: '8px 10px',
          background: i === 0 ? 'var(--teal-light)' : 'var(--grey-50)',
          borderRadius: 8, border: `1px solid ${i === 0 ? 'var(--teal-border)' : 'var(--grey-200)'}`
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
            background: i === 0 ? 'var(--teal)' : 'var(--grey-300)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 700, color: 'white'
          }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: i === 0 ? 'var(--teal)' : 'var(--grey-800)', marginBottom: 3 }}>
              {role.industry || '—'} · {role.org_type || '—'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-600)', marginBottom: 3 }}>
              {role.role_type || '—'} · {role.primary_function || '—'} · {role.tenure || '—'}
            </div>
            {role.key_skills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {role.key_skills.slice(0, 4).map(s => (
                  <span key={s} className="badge badge-grey" style={{ fontSize: 10 }}>{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
