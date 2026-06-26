import { useState, useRef } from 'react'
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

export default function SkillsTable({ functionName, value = {}, onChange, mode = 'candidate' }) {
  const [uploading, setUploading] = useState(false)
  const [uploadDone, setUploadDone] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

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

  // CV upload and AI pre-fill
  const handleCVUpload = async (file) => {
    if (!file) return
    setUploading(true); setUploadError('')
    try {
      const subFunctionList = subFunctions.join(', ')
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY
      if (!apiKey) throw new Error('API key not configured')
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const prompt = `Read this CV carefully. For each sub-function listed, determine proficiency (Familiar/Proficient/Expert). Only include where there is clear evidence. For Expert, extract a one-line achievement with no company names.\n\nSub-functions: ${subFunctionList}\n\nReturn ONLY valid JSON, no markdown:\n{"Talent Acquisition": {"level": "Expert", "highlight": "Led end-to-end hiring for 3 business units"}}\n\nOnly include sub-functions with clear evidence.`
      const messageContent = isPDF
        ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }, { type: 'text', text: prompt }]
        : [{ type: 'text', text: prompt + '\n\nCV text:\n' + atob(base64).slice(0, 5000) }]
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: isPDF ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: messageContent }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Merge AI suggestions with existing, marking as AI suggested
      const updated = { ...value }
      Object.entries(parsed).forEach(([sf, entry]) => {
        if (subFunctions.includes(sf) && entry.level) {
          updated[sf] = { ...entry, aiSuggested: true }
        }
      })
      onChange(updated)
      setUploadDone(true)
    } catch (e) {
      setUploadError('Could not read CV: ' + (e.message || 'Unknown error') + '. Try a Word doc (.docx) instead.')
    }
    setUploading(false)
  }

  return (
    <div>
      {/* CV upload — candidate only */}
      {mode === 'candidate' && !uploadDone && (
        <div style={{ background: '#f9fafb', border: '1.5px solid var(--grey-200)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 4 }}>
            ⚡ Upload your CV to auto-fill your skills below
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 12, lineHeight: 1.6 }}>
            AI reads your CV and ticks the right proficiency levels for each skill area. Review and change anything. <strong style={{ color: 'var(--teal)' }}>Your CV is never stored or shared.</strong>
          </div>
          {uploadError && <div className="error-msg" style={{ marginBottom: 8 }}>{uploadError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
              onChange={e => handleCVUpload(e.target.files?.[0])} />
            <button type="button" className="btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? 'Reading CV...' : '📎 Upload CV'}
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setUploadDone(true)}>
              Fill manually
            </button>
          </div>
        </div>
      )}

      {uploadDone && mode === 'candidate' && (
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
            ✓ Skill levels pre-filled — review and adjust below
          </div>
          <button type="button" onClick={() => { setUploadDone(false); fileRef.current && (fileRef.current.value = '') }}
            style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Upload again
          </button>
        </div>
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
