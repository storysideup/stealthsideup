import { useState } from 'react'
import { SKILL_TREE, PROFICIENCY_LEVELS } from '../data/skillTree'

// Single skill entry with proficiency + depth + free text
function SkillEntry({ functionName, subFunction, onRemove, onChange, entry }) {
  const tree = SKILL_TREE[functionName]?.[subFunction]
  const specialisations = tree?.specialisations || []
  const depthOptions = entry.specialisation ? (tree?.depth?.[entry.specialisation] || []) : []

  const toggleDepth = (item) => {
    const current = entry.depth || []
    const updated = current.includes(item) ? current.filter(d => d !== item) : [...current, item]
    onChange({ ...entry, depth: updated })
  }

  return (
    <div style={{ border: '1.5px solid var(--teal-border)', borderRadius: 10, padding: 14, marginBottom: 12, background: 'var(--teal-light)' }}>
      {/* Sub-function header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{subFunction}</div>
        <button type="button" onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--grey-400)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>

      {/* Proficiency */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Proficiency Level</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PROFICIENCY_LEVELS.map(level => (
            <button key={level.value} type="button"
              onClick={() => onChange({ ...entry, proficiency: level.value })}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, padding: '9px 12px',
                border: entry.proficiency === level.value ? '2px solid var(--teal)' : '1.5px solid var(--grey-200)',
                borderRadius: 8, background: entry.proficiency === level.value ? 'white' : 'white',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
              }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                border: entry.proficiency === level.value ? '5px solid var(--teal)' : '2px solid var(--grey-300)',
                background: 'white', transition: 'all 0.15s'
              }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: entry.proficiency === level.value ? 'var(--teal)' : 'var(--grey-800)' }}>{level.label}</div>
                <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 1, lineHeight: 1.4 }}>{level.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Specialisation */}
      {specialisations.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Specialisation</div>
          <div className="tag-cloud">
            {specialisations.map(s => (
              <button key={s} type="button"
                className={`tag ${entry.specialisation === s ? 'selected' : ''}`}
                onClick={() => onChange({ ...entry, specialisation: s, depth: [], customDepth: '' })}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Depth indicators */}
      {entry.specialisation && depthOptions.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
            Depth Indicators
            <span style={{ fontSize: 10, color: 'var(--grey-400)', fontWeight: 400, marginLeft: 6, textTransform: 'none' }}>(select all that apply)</span>
          </div>
          <div className="tag-cloud">
            {depthOptions.map(d => (
              <button key={d} type="button"
                className={`tag ${(entry.depth || []).includes(d) ? 'selected' : ''}`}
                onClick={() => toggleDepth(d)}>
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Free text */}
      {entry.specialisation && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>+ Add your own</div>
          <input
            className="form-input"
            style={{ fontSize: 13, padding: '9px 12px' }}
            placeholder="Any specific tools, platforms or skills not listed above..."
            value={entry.customDepth || ''}
            onChange={e => onChange({ ...entry, customDepth: e.target.value })}
          />
        </div>
      )}
    </div>
  )
}

// Main skill tree component
export default function SkillTreeSelector({ functionName, value = [], onChange, mode = 'candidate' }) {
  const [showPicker, setShowPicker] = useState(false)

  if (!functionName || !SKILL_TREE[functionName]) {
    return (
      <div style={{ padding: 14, background: 'var(--grey-100)', borderRadius: 8, fontSize: 13, color: 'var(--grey-400)' }}>
        Please select your primary function first to see relevant skills.
      </div>
    )
  }

  const subFunctions = Object.keys(SKILL_TREE[functionName])
  const selectedSubFunctions = value.map(v => v.subFunction)

  const addSubFunction = (sf) => {
    if (selectedSubFunctions.includes(sf)) return
    onChange([...value, { subFunction: sf, proficiency: '', specialisation: '', depth: [], customDepth: '' }])
    setShowPicker(false)
  }

  const removeEntry = (idx) => {
    onChange(value.filter((_, i) => i !== idx))
  }

  const updateEntry = (idx, updated) => {
    const newVal = [...value]
    newVal[idx] = updated
    onChange(newVal)
  }

  return (
    <div>
      {/* 6-month rule reminder */}
      <div style={{ background: '#fff8f0', border: '1px solid #f5c4a3', borderRadius: 8, padding: '10px 13px', marginBottom: 16, fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--orange)' }}>Important:</strong> Only select skills you have actively worked on for <strong>6 months or more</strong>. Exposure or awareness does not qualify — this must be hands-on experience.
      </div>

      {/* Selected entries */}
      {value.map((entry, idx) => (
        <SkillEntry
          key={idx}
          functionName={functionName}
          subFunction={entry.subFunction}
          entry={entry}
          onRemove={() => removeEntry(idx)}
          onChange={(updated) => updateEntry(idx, updated)}
        />
      ))}

      {/* Add sub-function picker */}
      {!showPicker ? (
        <button type="button"
          onClick={() => setShowPicker(true)}
          style={{
            width: '100%', padding: '12px', border: '1.5px dashed var(--grey-300)',
            borderRadius: 8, background: 'white', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, color: 'var(--teal)', fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          Add a skill area
        </button>
      ) : (
        <div style={{ border: '1.5px solid var(--grey-200)', borderRadius: 10, padding: 14, background: 'var(--grey-50)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
            Select a skill area within {functionName}
          </div>
          <div className="tag-cloud" style={{ marginBottom: 12 }}>
            {subFunctions.filter(sf => !selectedSubFunctions.includes(sf)).map(sf => (
              <button key={sf} type="button" className="tag" onClick={() => addSubFunction(sf)}>{sf}</button>
            ))}
          </div>
          <button type="button" className="btn-secondary btn-sm" onClick={() => setShowPicker(false)}>Cancel</button>
        </div>
      )}

      {/* Summary */}
      {value.length > 0 && (
        <div style={{ marginTop: 16, background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Your skill profile</div>
          {value.map((entry, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 4, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--teal)', fontWeight: 700, flexShrink: 0 }}>·</span>
              <span>
                <strong style={{ color: 'var(--grey-800)' }}>{entry.subFunction}</strong>
                {entry.proficiency && <span style={{ color: 'var(--orange)', marginLeft: 6 }}>({PROFICIENCY_LEVELS.find(p => p.value === entry.proficiency)?.label})</span>}
                {entry.specialisation && <span style={{ color: 'var(--grey-400)', marginLeft: 4 }}>— {entry.specialisation}</span>}
                {(entry.depth || []).length > 0 && <span style={{ color: 'var(--grey-400)', marginLeft: 4 }}>· {entry.depth.join(', ')}</span>}
                {entry.customDepth && <span style={{ color: 'var(--grey-400)', marginLeft: 4 }}>· {entry.customDepth}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
