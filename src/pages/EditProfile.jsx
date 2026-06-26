import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import SkillsTable from '../components/SkillsTable'
import CareerHistory from '../components/CareerHistory'
import { CandidateLocationPicker } from '../components/LocationPicker'
import {
  FUNCTIONS, INDUSTRIES, NOTICE_PERIODS, LANGUAGES,
  SENIORITY_LEVELS, ORG_TYPES
} from '../data/formData'
import { COMPANIES } from '../data/companies'

const SECTIONS = ['Basic Info', 'Current Role', 'Career History', 'Skills', 'Preferences']

function TagSelect({ options, value = [], onChange, max }) {
  const toggle = (opt) => {
    if (max === 1) {
      onChange(value.includes(opt) ? [] : [opt])
    } else if (value.includes(opt)) {
      onChange(value.filter(v => v !== opt))
    } else if (!max || value.length < max) {
      onChange([...value, opt])
    }
  }
  return (
    <div className="tag-cloud">
      {options.map(opt => (
        <button key={opt} type="button"
          className={`tag ${value.includes(opt) ? 'selected' : ''}`}
          onPointerDown={e => { e.preventDefault(); toggle(opt) }}
          style={{ touchAction: 'manipulation', userSelect: 'none' }}>
          {opt}
        </button>
      ))}
    </div>
  )
}

import React from 'react'

function CompanySearch({ value = [], onChange }) {
  const [query, setQuery] = React.useState('')
  const [showOptions, setShowOptions] = React.useState(false)
  const filtered = query.length > 1
    ? COMPANIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []
  const addCompany = (company) => {
    if (!value.includes(company)) onChange([...value, company])
    setQuery(''); setShowOptions(false)
  }
  const removeCompany = (company) => onChange(value.filter(c => c !== company))
  return (
    <div>
      <div className="form-hint" style={{ marginBottom: 10, lineHeight: 1.6 }}>
        Add your current and previous employers — your profile will never be shown to them.
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {value.map(company => (
            <div key={company} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 20, fontSize: 12, color: '#991b1b', fontWeight: 600 }}>
              {company}
              <button type="button" onClick={() => removeCompany(company)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input className="form-input" placeholder="Start typing company name..." value={query}
          onChange={e => { setQuery(e.target.value); setShowOptions(true) }}
          onFocus={() => setShowOptions(true)} onBlur={() => setTimeout(() => setShowOptions(false), 200)} />
        {showOptions && (filtered.length > 0 || query.length > 1) && (
          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, background: 'white', border: '1.5px solid var(--teal-border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map(company => (
              <button key={company} type="button" onMouseDown={() => addCompany(company)}
                style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', borderBottom: '1px solid var(--grey-100)', background: 'white', textAlign: 'left', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--grey-800)' }}>
                {company}
              </button>
            ))}
            {query.length > 1 && (
              <button type="button" onMouseDown={() => addCompany(query)}
                style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: '#fff4ec', textAlign: 'left', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--orange)', fontWeight: 600 }}>
                + Block "{query}" (not in list)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EditProfile({ onNavigate }) {
  const [step, setStep] = useState(0) // 0=verify, 1=edit
  const [contact, setContact] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [candidate, setCandidate] = useState(null)
  const [form, setForm] = useState(null)
  const [activeSection, setActiveSection] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  // Load from session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ssu_candidate')
      const savedContact = localStorage.getItem('ssu_candidate_contact')
      if (saved) {
        const c = JSON.parse(saved)
        setCandidate(c)
        setContact(savedContact || '')
        initForm(c)
        setStep(1)
      }
    } catch {}
  }, [])

  const initForm = (c) => {
    setForm({
      // Basic
      gender: c.gender || '',
      current_employment_type: c.current_employment_type || '',
      desired_employment_type: c.desired_employment_type || '',
      years_experience: c.years_experience || '',
      primary_function: c.primary_function || '',
      headline: c.headline || '',
      job_search_status: c.job_search_status || '',
      // Current role
      current_industry: c.current_industry || c.freelance_sector || '',
      previous_industries: c.previous_industries || [],
      role_type: c.role_type || '',
      team_size: c.team_size || '',
      work_preference: c.work_preference || '',
      ctc_fixed: c.ctc_fixed || '',
      ctc_variable: c.ctc_variable || '',
      ctc_bonus: c.ctc_bonus || '',
      ctc_total: c.ctc_total || '',
      // Career history
      career_history: c.career_history || [],
      // Skills
      skill_tree: c.skill_tree || {},
      // Preferences
      seniority_open_to: c.seniority_open_to || [],
      org_type_open_to: c.org_type_open_to || [],
      preferred_locations: c.preferred_locations || { cities: [], openToNearby: true },
      notice_period: c.notice_period || '',
      min_expected_ctc: c.min_expected_ctc || '',
      years_in_function: c.years_in_function || '',
      languages: c.languages || [],
      open_to_travel: c.open_to_travel || '',
      has_passport: c.has_passport || '',
      blocked_companies: c.blocked_companies?.join(', ') || '',
    })
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError('Enter your registered phone number'); return }
    setLoading(true); setError('')
    const { data } = await supabase.from('candidates').select('*').eq('contact', contact.trim()).single()
    if (!data) { setError('No profile found. Please register first.'); setLoading(false); return }
    setCandidate(data)
    initForm(data)
    setTimeout(() => { setLoading(false); setStep(0.5) }, 500)
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(1) }, 400)
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`eotp-${idx+1}`)?.focus()
  }

  const handleSave = async () => {
    setSaving(true); setError('')
    const { error: err } = await supabase.from('candidates').update({
      gender: form.gender,
      current_employment_type: form.current_employment_type,
      desired_employment_type: form.desired_employment_type,
      years_experience: form.years_experience,
      primary_function: form.primary_function,
      headline: form.headline,
      job_search_status: form.job_search_status,
      current_industry: form.current_industry,
      freelance_sector: form.current_industry,
      previous_industries: form.previous_industries,
      role_type: form.role_type,
      team_size: form.team_size,
      work_preference: form.work_preference,
      ctc_fixed: parseFloat(form.ctc_fixed) || null,
      ctc_variable: parseFloat(form.ctc_variable) || null,
      ctc_bonus: parseFloat(form.ctc_bonus) || null,
      ctc_total: parseFloat(form.ctc_total) || null,
      career_history: form.career_history,
      skill_tree: form.skill_tree,
      seniority_open_to: form.seniority_open_to,
      org_type_open_to: form.org_type_open_to,
      preferred_locations: form.preferred_locations,
      notice_period: form.notice_period,
      min_expected_ctc: parseFloat(form.min_expected_ctc) || null,
      years_in_function: parseInt(form.years_in_function) || null,
      languages: form.languages,
      open_to_travel: form.open_to_travel,
      has_passport: form.has_passport,
      blocked_companies: Array.isArray(form.blocked_companies) ? form.blocked_companies : (form.blocked_companies ? form.blocked_companies.split(',').map(s => s.trim()).filter(Boolean) : []),
    }).eq('id', candidate.id)

    if (err) { setError(err.message); setSaving(false); return }

    // Update session
    try {
      const updated = { ...candidate, ...form }
      localStorage.setItem('ssu_candidate', JSON.stringify(updated))
    } catch {}

    setSaved(true); setSaving(false)
  }

  // Success
  if (saved) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>Profile Updated</h2>
      <p style={{ color: 'var(--grey-600)', marginBottom: 24 }}>Your changes are live.</p>
      <button className="btn-primary" onClick={() => onNavigate('candidate-profile')}>Back to My Dashboard</button>
    </div>
  )

  // OTP entry
  if (step === 0) return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>Edit My Profile</h2>
      <p style={{ fontSize: 14, color: 'var(--grey-600)', marginBottom: 24 }}>Enter your registered number to continue.</p>
      <div className="form-group">
        <label className="form-label">Registered Phone Number</label>
        <input className="form-input" type="tel" placeholder="+91 98765 43210" value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>{loading ? 'Looking up...' : 'Send OTP →'}</button>
    </div>
  )

  if (step === 0.5) return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>Verify OTP</h2>
      <p style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 20 }}>Enter the 6-digit code sent to {contact}</p>
      <div className="otp-container">
        {otp.map((d, i) => (
          <input key={i} id={`eotp-${i}`} className="otp-input" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`eotp-${i-1}`)?.focus() }} />
        ))}
      </div>
      <div className="form-hint" style={{ textAlign: 'center', marginBottom: 20 }}>(Demo — any 6 digits)</div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>{loading ? 'Verifying...' : 'Edit My Profile →'}</button>
    </div>
  )

  if (!form) return <div className="page"><div className="spinner" /></div>

  // Full edit form
  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>Edit My Profile</h2>
      <p style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 16 }}>All changes save immediately when you tap Save.</p>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
        {SECTIONS.map((s, i) => (
          <button key={s} type="button" onClick={() => setActiveSection(i)} style={{
            padding: '7px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
            background: activeSection === i ? 'var(--teal)' : 'var(--grey-100)',
            color: activeSection === i ? 'white' : 'var(--grey-600)',
            flexShrink: 0
          }}>{s}</button>
        ))}
      </div>

      {/* SECTION 0 — Basic Info */}
      {activeSection === 0 && <>
        <div className="form-group">
          <label className="form-label">Professional Headline</label>
          <textarea className="form-textarea" maxLength={150} value={form.headline} onChange={e => set('headline', e.target.value)}
            placeholder="Your story in one line — no name, no employer, no title" />
          <div className="form-hint" style={{ textAlign: 'right' }}>{form.headline.length}/150</div>
        </div>
        <div className="form-group">
          <label className="form-label">Job Search Status</label>
          <TagSelect options={['Actively looking (want to move within 0–3 months)', 'Passively open (the right role would make me consider moving)', 'Just exploring (not in a hurry, happy where I am)']}
            value={form.job_search_status ? [form.job_search_status] : []} onChange={v => set('job_search_status', v[v.length-1] || '')} max={1} />
        </div>
        <div className="form-group">
          <label className="form-label">Primary Function</label>
          <select className="form-select" value={form.primary_function} onChange={e => set('primary_function', e.target.value)}>
            <option value="">Select function...</option>
            {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Total Years of Experience</label>
          <select className="form-select" value={form.years_experience} onChange={e => set('years_experience', e.target.value)}>
            <option value="">Select...</option>
            {['0-2','3-5','6-8','9-12','13-16','17-20','20+'].map(y => <option key={y} value={y}>{y} years</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Current Employment Type</label>
          <TagSelect options={['Full-time Employee','Freelance / Independent Consultant','Fractional / Part-time','Between Roles']}
            value={form.current_employment_type ? [form.current_employment_type] : []} onChange={v => set('current_employment_type', v[v.length-1] || '')} max={1} />
        </div>
      </>}

      {/* SECTION 1 — Current Role */}
      {activeSection === 1 && <>
        <div className="form-group">
          <label className="form-label">Current Industry</label>
          <select className="form-select" value={form.current_industry} onChange={e => set('current_industry', e.target.value)}>
            <option value="">Select industry...</option>
            {INDUSTRIES.flatMap(g => g.items).map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Current CTC — Fixed (₹L per annum)</label>
          <input className="form-input" type="number" placeholder="e.g. 25" value={form.ctc_fixed} onChange={e => set('ctc_fixed', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Variable / Bonus (₹L)</label>
          <input className="form-input" type="number" placeholder="e.g. 5" value={form.ctc_variable} onChange={e => set('ctc_variable', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Work Preference</label>
          <TagSelect options={['Full-time in office','Hybrid','Remote / Work from home','Open to any']}
            value={form.work_preference ? [form.work_preference] : []} onChange={v => set('work_preference', v[v.length-1] || '')} max={1} />
        </div>
      </>}

      {/* SECTION 2 — Career History */}
      {activeSection === 2 && <>
        <div className="form-group">
          <label className="form-label">Last 3 Roles</label>
          <CareerHistory value={form.career_history} onChange={v => set('career_history', v)} />
        </div>
        <div className="form-group">
          <label className="form-label">Years Specifically in {form.primary_function || 'Your Primary Function'}</label>
          <div className="form-hint" style={{ marginBottom: 8 }}>Of your total experience, how many years have been in this function?</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input className="form-input" type="number" min="0" max="50" placeholder="e.g. 8" style={{ maxWidth: 100 }}
              value={form.years_in_function} onChange={e => set('years_in_function', e.target.value)} />
            <span style={{ fontSize: 13, color: 'var(--grey-400)' }}>years</span>
          </div>
        </div>
      </>}

      {/* SECTION 3 — Skills */}
      {activeSection === 3 && <>
        <div className="form-group">
          <label className="form-label">Your Skills — {form.primary_function || 'select function first'}</label>
          <SkillsTable functionName={form.primary_function} value={form.skill_tree} onChange={v => set('skill_tree', v)} mode="candidate" />
        </div>
      </>}

      {/* SECTION 4 — Preferences */}
      {activeSection === 4 && <>
        <div className="form-group">
          <label className="form-label">Notice Period</label>
          <TagSelect options={NOTICE_PERIODS} value={form.notice_period ? [form.notice_period] : []} onChange={v => set('notice_period', v[v.length-1] || '')} max={1} />
        </div>
        <div className="form-group">
          <label className="form-label">Minimum Expected CTC (₹L per annum)</label>
          <input className="form-input" type="number" placeholder="e.g. 35" value={form.min_expected_ctc} onChange={e => set('min_expected_ctc', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Preferred Locations</label>
          <CandidateLocationPicker value={form.preferred_locations} onChange={v => set('preferred_locations', v)} />
        </div>
        <div className="form-group">
          <label className="form-label">Languages Known</label>
          <TagSelect options={LANGUAGES} value={form.languages} onChange={v => set('languages', v)} />
        </div>
        <div className="form-group">
          <label className="form-label">Companies to Block</label>
          <CompanySearch value={Array.isArray(form.blocked_companies) ? form.blocked_companies : (form.blocked_companies ? form.blocked_companies.split(',').map(s => s.trim()).filter(Boolean) : [])} onChange={v => set('blocked_companies', v)} />
        </div>
      </>}

      {error && <div className="error-msg">{error}</div>}

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : '✓ Save Changes'}
      </button>
      <div className="mt-4">
        <button className="btn-secondary" onClick={() => onNavigate('candidate-profile')}>← Back to Dashboard</button>
      </div>
    </div>
  )
}
