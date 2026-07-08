import { useState, useEffect } from 'react'
import { SKILL_TREE } from '../data/skillTree'

const LEVELS = ['Familiar', 'Proficient', 'Expert']
const LEVEL_COLORS = {
  Familiar: { bg: '#EBF4F8', border: '#B8D8E8', text: '#165D7B' },
  Proficient: { bg: '#FFF4EC', border: '#FFD4A8', text: '#c45f00' },
  Expert: { bg: '#d1fae5', border: '#6ee7b7', text: '#065f46' },
}

function SkillRow({ subFunction, entry, onChange, mode }) {
  const selected = entry?.level || null
  const highlight = entry?.highlight || ''
  const aiSuggested = entry?.aiSuggested || false

  const handleLevel = (level) => {
    if (selected === level) {
      // Deselect
      onChange(null)
    } else {
      onChange({ level, highlight: entry?.highlight || '', aiSuggested: false })
    }
  }

  const handleHighlight = (val) => {
    onChange({ ...entry, highlight: val, aiSuggested: false })
  }

  return (
    <div style={{
      borderBottom: '1px solid var(--grey-100)',
      padding: '10px 0',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: selected === 'Expert' ? 8 : 0 }}>
        {/* Sub-function name */}
        <div style={{ flex: 1, fontSize: 13, color: 'var(--grey-800)', fontWeight: selected ? 600 : 400 }}>
          {subFunction}
          {aiSuggested && (
            <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--teal)', background: 'var(--teal-light)', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>AI</span>
          )}
        </div>

        {/* Level buttons */}
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {LEVELS.map(level => {
            const isSelected = selected === level
            const colors = LEVEL_COLORS[level]
            return (
              <button key={level} type="button"
                onClick={() => handleLevel(level)}
                style={{
                  width: mode === 'corporate' ? 72 : 68,
                  padding: '5px 4px',
                  borderRadius: 6,
                  border: isSelected ? `2px solid ${colors.border}` : '1.5px solid var(--grey-200)',
                  background: isSelected ? colors.bg : 'white',
                  color: isSelected ? colors.text : 'var(--grey-400)',
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}>
                {level}
              </button>
            )
          })}
        </div>
      </div>

      {/* Expert highlight field — mandatory for candidate, shown for corporate as requirement */}
      {selected === 'Expert' && mode !== 'corporate' && (
        <div style={{ marginLeft: 0, marginTop: 4 }}>
          <input
            className="form-input"
            style={{
              fontSize: 12, padding: '8px 12px',
              borderColor: !highlight.trim() ? 'var(--orange)' : 'var(--teal-border)',
              background: '#f9fafb'
            }}
            placeholder="What's the best example of your work here? One line, no company name."
            maxLength={160}
            value={highlight}
            onChange={e => handleHighlight(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
            <span style={{ fontSize: 10, color: !highlight.trim() ? 'var(--orange)' : 'var(--grey-400)' }}>
              {!highlight.trim() ? '⚠ Required for Expert level' : '✓'}
            </span>
            <span style={{ fontSize: 10, color: 'var(--grey-400)' }}>{highlight.length}/160</span>
          </div>
        </div>
      )}

      {/* Corporate mode — show required level label */}
      {selected && mode === 'corporate' && (
        <div style={{ marginTop: 4, fontSize: 11, color: LEVEL_COLORS[selected].text, fontWeight: 600 }}>
          Minimum {selected} required in {subFunction}
        </div>
      )}
    </div>
  )
}

export default function SkillsTable({ functionName, value = {}, onChange, mode = 'candidate', cvData = null }) {
  const [autoFilling, setAutoFilling] = useState(false)
  const [autoFillError, setAutoFillError] = useState('')
  const [autoFillDone, setAutoFillDone] = useState(false)

  // Auto-extract skill levels from the CV already uploaded in Section A — no second upload needed
  // NOTE: this hook must run on every render (Rules of Hooks), so all guards live inside it,
  // not in an early return before it.
  useEffect(() => {
    if (mode !== 'candidate') return
    if (!functionName || !SKILL_TREE[functionName]) return
    if (!cvData?.base64) return
    if (autoFillDone || autoFilling) return
    if (Object.keys(value).length > 0) { setAutoFillDone(true); return } // don't overwrite manual edits

    const subFunctions = Object.keys(SKILL_TREE[functionName])

    const run = async () => {
      setAutoFilling(true); setAutoFillError('')
      try {
        const subFunctionList = subFunctions.join(', ')
        const prompt = `Read this CV carefully. For each sub-function listed, determine proficiency (Familiar/Proficient/Expert). Only include where there is clear evidence. For Expert, extract a one-line achievement with no company names.\n\nSub-functions: ${subFunctionList}\n\nReturn ONLY valid JSON, no markdown:\n{"Talent Acquisition": {"level": "Expert", "highlight": "Led end-to-end hiring for 3 business units"}}\n\nOnly include sub-functions with clear evidence.`
        const messageContent = cvData.isPDF
          ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: cvData.base64 } }, { type: 'text', text: prompt }]
          : [{ type: 'text', text: prompt + '\n\nCV text:\n' + atob(cvData.base64).slice(0, 5000) }]
        const response = await fetch('/api/ai-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cvData.isPDF ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            messages: [{ role: 'user', content: messageContent }]
          })
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error?.message || `AI service error (${response.status})`)
        }
        const text = data.content?.[0]?.text || ''
        const clean = text.replace(/```json|```/g, '').trim()
        if (!clean) throw new Error('AI returned an empty response')
        const parsed = JSON.parse(clean)

        const updated = { ...value }
        Object.entries(parsed).forEach(([sf, entry]) => {
          if (subFunctions.includes(sf) && entry.level) {
            updated[sf] = { ...entry, aiSuggested: true }
          }
        })
        onChange(updated)
      } catch (e) {
        setAutoFillError('Could not map skills from your CV automatically — please select levels manually below.')
      }
      setAutoFilling(false)
      setAutoFillDone(true)
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvData, functionName])

  if (!functionName || !SKILL_TREE[functionName]) {
    return (
      <div style={{ padding: 14, background: 'var(--grey-100)', borderRadius: 8, fontSize: 13, color: 'var(--grey-400)' }}>
        Please select your primary function first.
      </div>
    )
  }

  const subFunctions = Object.keys(SKILL_TREE[functionName])

  const updateEntry = (subFunction, entry) => {
    const updated = { ...value }
    if (entry === null) {
      delete updated[subFunction]
    } else {
      updated[subFunction] = entry
    }
    onChange(updated)
  }

  const selectedCount = Object.keys(value).length
  const expertWithoutHighlight = Object.entries(value).filter(([sf, entry]) =>
    entry?.level === 'Expert' && !entry?.highlight?.trim()
  )

  return (
    <div>
      {/* Auto-fill status — driven by the CV uploaded earlier, no second upload here */}
      {mode === 'candidate' && cvData?.base64 && autoFilling && (
        <div style={{ background: '#f9fafb', border: '1.5px solid var(--grey-200)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: 'var(--grey-600)' }}>
          ⏳ Mapping your skill levels from the CV you already uploaded...
        </div>
      )}
      {mode === 'candidate' && autoFillDone && !autoFillError && Object.keys(value).length > 0 && (
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
          ✓ Skill levels mapped from your CV — review and adjust below
        </div>
      )}
      {mode === 'candidate' && autoFillError && (
        <div className="error-msg" style={{ marginBottom: 14 }}>{autoFillError}</div>
      )}

      {/* Proficiency definitions */}
      {mode === 'candidate' && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 12 }}>
          {[
            { level: 'Familiar', color: LEVEL_COLORS.Familiar, desc: 'Worked in this area, understand it well' },
            { level: 'Proficient', color: LEVEL_COLORS.Proficient, desc: 'Delivered independently, can lead without guidance' },
            { level: 'Expert', color: LEVEL_COLORS.Expert, desc: 'Built or owned this at an organisational level' },
          ].map(({ level, color, desc }) => (
            <div key={level} style={{
              flex: 1, background: color.bg, border: `1px solid ${color.border}`,
              borderRadius: 8, padding: '8px 6px', textAlign: 'center'
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: color.text, marginBottom: 3 }}>{level}</div>
              <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Column headers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8, borderBottom: '2px solid var(--grey-200)', marginBottom: 4 }}>
        <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {mode === 'candidate' ? 'Skill Area' : 'Skill Requirement'}
          {mode === 'candidate' && (
            <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--grey-400)', marginLeft: 6 }}>
              — leave blank if not applicable
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {LEVELS.map(level => (
            <div key={level} style={{ width: mode === 'corporate' ? 72 : 68, textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.3 }}>
              {level}
            </div>
          ))}
        </div>
      </div>

      {/* Skill rows */}
      {subFunctions.map(sf => (
        <SkillRow
          key={sf}
          subFunction={sf}
          entry={value[sf] || null}
          onChange={(entry) => updateEntry(sf, entry)}
          mode={mode}
        />
      ))}

      {/* Summary */}
      {selectedCount > 0 && (
        <div style={{ marginTop: 14, background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
            {selectedCount} skill area{selectedCount > 1 ? 's' : ''} selected
            {expertWithoutHighlight.length > 0 && (
              <span style={{ color: 'var(--orange)', marginLeft: 8 }}>
                · {expertWithoutHighlight.length} Expert highlight{expertWithoutHighlight.length > 1 ? 's' : ''} missing
              </span>
            )}
          </div>
          {Object.entries(value).map(([sf, entry]) => (
            <div key={sf} style={{ fontSize: 12, marginBottom: 3, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: LEVEL_COLORS[entry.level]?.text, fontWeight: 700, flexShrink: 0 }}>{entry.level}</span>
              <span style={{ color: 'var(--grey-800)' }}>{sf}</span>
              {entry.highlight && <span style={{ color: 'var(--grey-400)', fontSize: 11 }}>— {entry.highlight}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
