import React from 'react'
import { useState, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import SkillTreeSelector from '../components/SkillTreeSelector'
import { CandidateLocationPicker } from '../components/LocationPicker'
import {
  FUNCTIONS, SKILLS_BY_FUNCTION, INDUSTRIES, INSTITUTES,
  CURRENT_EMPLOYMENT_TYPES, DESIRED_EMPLOYMENT_TYPES, DEGREES,
  TENURES, AVG_TENURES, TEAM_SIZES, GEOGRAPHIES,
  SENIORITY_LEVELS, ORG_TYPES, JOB_SEARCH_STATUSES, FREELANCE_ENGAGEMENT_SIZES
} from '../data/formData'

const TOTAL_STEPS = 7 // Verify + 6 sections

function TagSelect({ options, value = [], onChange, max }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt))
    else if (!max || value.length < max) onChange([...value, opt])
  }
  return (
    <div className="tag-cloud">
      {options.map(opt => (
        <button key={opt} type="button" className={`tag ${value.includes(opt) ? 'selected' : ''}`} onClick={() => toggle(opt)}>{opt}</button>
      ))}
    </div>
  )
}

function SingleSelect({ options, value, onChange, placeholder }) {
  return (
    <select className="form-select" value={value || ''} onChange={e => onChange(e.target.value)}>
      <option value="">{placeholder || 'Select...'}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  )
}

function IndustrySelect({ value = [], onChange, single = false }) {
  const toggle = (item) => {
    if (single) { onChange(item); return; }
    if (value.includes(item)) onChange(value.filter(v => v !== item))
    else onChange([...value, item])
  }
  return (
    <div>
      {INDUSTRIES.map(group => (
        <div key={group.sector} className="industry-group">
          <div className="industry-group-label">{group.sector}</div>
          <div className="tag-cloud">
            {group.items.map(item => (
              <button key={item} type="button"
                className={`tag ${(single ? value === item : value.includes(item)) ? 'selected' : ''}`}
                onClick={() => toggle(item)}>{item}</button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrustBlock() {
  const [open, setOpen] = React.useState(false)
  return (
    <div style={{ marginBottom: 20 }}>
      {/* WHY WE NEED THIS — collapsible */}
      <div style={{
        border: '1.5px solid var(--teal-border)',
        borderRadius: 10,
        background: 'var(--teal-light)',
        overflow: 'hidden',
        marginBottom: 10
      }}>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          style={{
            width: '100%', background: 'none', border: 'none',
            padding: '12px 14px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>Why do we ask for your contact?</span>
          </div>
          <span style={{ fontSize: 16, color: 'var(--teal)', fontWeight: 700 }}>{open ? '−' : '+'}</span>
        </button>
        {open && (
          <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--teal-border)' }}>
            <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, marginTop: 12 }}>
              We need one way to reach you when a company&apos;s JD matches your profile. That&apos;s the only reason we ask. Your contact is stored securely and never shown to anyone — not to recruiters, not to companies, not even to us in readable form. It only gets shared when you explicitly say yes to a specific opportunity — and only with that company, for that role.
            </p>
          </div>
        )}
      </div>

      {/* WHAT WE WILL NEVER DO */}
      <div style={{
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        background: '#f9fafb',
        padding: '11px 14px',
        display: 'flex', gap: 10, alignItems: 'flex-start'
      }}>
        <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🚫</span>
        <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7, margin: 0 }}>
          <strong style={{ color: '#1f2937' }}>What we will never do:</strong> We will never make your contact visible against your profile. We will never reach out to you for anything other than a matched opportunity. No spam, no cold calls, no third parties — ever.
        </p>
      </div>
    </div>
  )
}

export default function Register({ onNavigate }) {
  const [step, setStep] = useState(0) // 0=contact, 1=verify, 2-7=form sections
  const [contact, setContact] = useState('')
  const [contactType, setContactType] = useState('phone')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    gender: '', current_employment_type: '', desired_employment_type: [],
    years_experience: '', primary_function: '',
    highest_degree: '', institute: '', institute_other: '', year_of_passing: '',
    certifications: '',
    current_industry: '', current_tenure: '', company_type_b2b_b2c: '',
    role_type: '', team_size: '', geography_managed: [],
    ctc_fixed: '', ctc_variable: '', ctc_joining_bonus: '', ctc_esops: '', ctc_allowances: '',
    freelance_sector: '', freelance_engagement_size: '', freelance_years: '',
    previous_industries: [], average_tenure: '', career_b2b_b2c: '',
    skill_keywords: [], skill_tree: [], headline: '', declaration_agreed: false,
    job_search_status: '', seniority_open_to: [], org_type_open_to: [],
    preferred_locations: { cities: [], openToNearby: true },
    work_preference: '', relocation: '', relocation_cities: '', blocked_companies: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const ctcTotal = useMemo(() => {
    const vals = ['ctc_fixed', 'ctc_variable', 'ctc_joining_bonus', 'ctc_esops', 'ctc_allowances']
    return vals.reduce((sum, k) => sum + (parseFloat(form[k]) || 0), 0)
  }, [form.ctc_fixed, form.ctc_variable, form.ctc_joining_bonus, form.ctc_esops, form.ctc_allowances])

  const isFreelance = ['Freelance / Independent Consultant', 'Entrepreneur / Founder', 'Between roles (available immediately)', 'Sabbatical'].includes(form.current_employment_type)

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError('Please enter your phone number or email'); return }
    setLoading(true); setError('')
    // Simulate OTP for now — in production use Supabase Auth or Twilio
    setTimeout(() => { setLoading(false); setStep(1) }, 800)
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return }
    // For demo, accept any 6 digits
    setLoading(true); setError('')
    setTimeout(() => { setLoading(false); setStep(2) }, 600)
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const handleSubmit = async () => {
    if (!form.headline.trim()) { setError('Please add a professional headline'); return }
    setLoading(true); setError('')
    try {
      const payload = {
        contact: contact.trim(),
        contact_type: contactType,
        gender: form.gender,
        current_employment_type: form.current_employment_type,
        desired_employment_type: form.desired_employment_type,
        years_experience: parseInt(form.years_experience) || null,
        primary_function: form.primary_function,
        highest_degree: form.highest_degree,
        institute: form.institute === 'Other (please specify)' ? form.institute_other : form.institute,
        year_of_passing: parseInt(form.year_of_passing) || null,
        certifications: form.certifications,
        current_industry: form.current_industry,
        current_tenure: form.current_tenure,
        company_type_b2b_b2c: form.company_type_b2b_b2c,
        role_type: form.role_type,
        team_size: form.team_size,
        geography_managed: form.geography_managed,
        ctc_fixed: parseFloat(form.ctc_fixed) || null,
        ctc_variable: parseFloat(form.ctc_variable) || null,
        ctc_joining_bonus: parseFloat(form.ctc_joining_bonus) || null,
        ctc_esops: parseFloat(form.ctc_esops) || null,
        ctc_allowances: parseFloat(form.ctc_allowances) || null,
        ctc_total: ctcTotal || null,
        freelance_sector: form.freelance_sector,
        freelance_engagement_size: form.freelance_engagement_size,
        freelance_years: parseInt(form.freelance_years) || null,
        previous_industries: form.previous_industries,
        average_tenure: form.average_tenure,
        career_b2b_b2c: form.career_b2b_b2c,
        skill_keywords: form.skill_keywords,
        skill_tree: form.skill_tree,
        declaration_agreed: form.declaration_agreed,
        headline: form.headline,
        job_search_status: form.job_search_status,
        seniority_open_to: form.seniority_open_to,
        org_type_open_to: form.org_type_open_to,
        work_preference: form.work_preference,
        relocation: form.relocation,
        relocation_cities: form.relocation_cities,
        blocked_companies: form.blocked_companies ? form.blocked_companies.split(',').map(s => s.trim()).filter(Boolean) : [],
        preferred_locations: form.preferred_locations,
        is_active: true
      }
      const { error: dbErr } = await supabase.from('candidates').upsert(payload, { onConflict: 'contact' })
      if (dbErr) throw dbErr
      setSuccess(true)
    } catch (e) {
      setError(e.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const stepLabels = ['Contact', 'Verify', 'About You', 'Education', 'Your Role', 'Past & Skills', 'Open To']

  if (success) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#0F4F47" strokeWidth="2.5" width="32" height="32">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>You're in.</h2>
      <p style={{ color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 28 }}>
        Your anonymous profile is live on StealthSideUp. When a role matches your profile, you will receive a WhatsApp message on your registered number — and only you decide what happens next.
      </p>
      <div className="card card-teal" style={{ textAlign: 'left', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 6 }}>WHAT HAPPENS NEXT</div>
        <div style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.7 }}>
          ✓ Your profile is anonymous — no one can identify you<br />
          ✓ We match JDs against your profile in the background<br />
          ✓ You get a WhatsApp notification on your registered number<br />
          ✓ Standard roles show full company details. Stealth roles show only industry and role level<br />
          ✓ In stealth mode, you reveal yourself first — then see the company name before deciding<br />
          ✓ App push notifications coming soon on the StealthSideUp mobile app<br />
          ✓ You say yes or no — your choice, always
        </div>
      </div>
      <button className="btn-secondary" onClick={() => onNavigate('home')}>Back to Home</button>
    </div>
  )

  // Step 0 — Contact entry
  if (step === 0) return (
    <div className="page">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Join StealthSideUp</h2>
        <p style={{ color: 'var(--grey-600)', fontSize: 14, lineHeight: 1.6 }}>Register anonymously. No name, no employer, no photo — just your professional story.</p>
      </div>

      <TrustBlock />

      <div className="form-group">
        <label className="form-label">How should we reach you? <span className="required">*</span></label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <button type="button" className={`tag ${contactType === 'phone' ? 'selected' : ''}`} onClick={() => setContactType('phone')}>📱 Phone / WhatsApp</button>
          <button type="button" className={`tag ${contactType === 'email' ? 'selected' : ''}`} onClick={() => setContactType('email')}>✉️ Email</button>
        </div>
        <input className="form-input" type={contactType === 'email' ? 'email' : 'tel'}
          placeholder={contactType === 'phone' ? '+91 98765 43210' : 'your@email.com'}
          value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <div className="mt-6">
        <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP →'}
        </button>
      </div>
    </div>
  )

  // Step 1 — OTP verify
  if (step === 1) return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Verify OTP</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 4 }}>Enter the 6-digit code sent to</p>
      <p style={{ fontWeight: 600, marginBottom: 20 }}>{contact}</p>
      <div className="otp-container">
        {otp.map((d, i) => (
          <input key={i} id={`otp-${i}`} className="otp-input" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus() }} />
        ))}
      </div>
      <div className="form-hint" style={{ textAlign: 'center', marginBottom: 20 }}>
        (For demo purposes, enter any 6 digits)
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify & Continue →'}
      </button>
      <div className="mt-4" style={{ textAlign: 'center' }}>
        <button className="btn-secondary btn-sm" style={{ width: 'auto', margin: '0 auto' }} onClick={() => setStep(0)}>← Change contact</button>
      </div>
    </div>
  )

  // Steps 2–7: Form sections
  const formStep = step - 2 // 0–5

  return (
    <div>
      <div style={{ padding: '12px 20px 0', background: 'white', position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--grey-200)' }}>
        <div className="flex-between" style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--grey-400)', fontWeight: 600 }}>SECTION {formStep + 1} OF 6</span>
          <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600 }}>{stepLabels[step]}</span>
        </div>
        <div className="step-bar">
          {[0,1,2,3,4,5].map(i => <div key={i} className={`step-dot ${i < formStep ? 'done' : i === formStep ? 'active' : ''}`} />)}
        </div>
      </div>

      <div className="page">

        {/* SECTION A — About You */}
        {formStep === 0 && <>
          <div className="section-header">A — About You</div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <TagSelect options={['Male','Female','Non-binary','Prefer not to say']} value={form.gender ? [form.gender] : []} onChange={v => set('gender', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Current Employment Type <span className="required">*</span></label>
            <TagSelect options={CURRENT_EMPLOYMENT_TYPES} value={form.current_employment_type ? [form.current_employment_type] : []} onChange={v => set('current_employment_type', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Desired Employment Type <span className="required">*</span></label>
            <div className="form-hint" style={{ marginBottom: 8 }}>Select all that apply</div>
            <TagSelect options={DESIRED_EMPLOYMENT_TYPES} value={form.desired_employment_type} onChange={v => set('desired_employment_type', v)} />
          </div>

          <div className="form-group">
            <label className="form-label">Total Years of Experience <span className="required">*</span></label>
            <input className="form-input" type="number" min="0" max="50" placeholder="e.g. 12"
              value={form.years_experience} onChange={e => set('years_experience', e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Function <span className="required">*</span></label>
            <SingleSelect options={FUNCTIONS} value={form.primary_function} onChange={v => { set('primary_function', v); set('skill_keywords', []) }} placeholder="Select your function..." />
          </div>
        </>}

        {/* SECTION B — Education */}
        {formStep === 1 && <>
          <div className="section-header">B — Education</div>

          <div className="form-group">
            <label className="form-label">Highest Degree</label>
            <SingleSelect options={DEGREES} value={form.highest_degree} onChange={v => set('highest_degree', v)} placeholder="Select degree..." />
          </div>

          <div className="form-group">
            <label className="form-label">Institute</label>
            <SingleSelect options={INSTITUTES} value={form.institute} onChange={v => set('institute', v)} placeholder="Select institute..." />
            {form.institute === 'Other (please specify)' && (
              <input className="form-input" style={{ marginTop: 8 }} placeholder="Enter institute name"
                value={form.institute_other} onChange={e => set('institute_other', e.target.value)} />
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Year of Passing</label>
            <SingleSelect
              options={Array.from({ length: 2026 - 1980 + 1 }, (_, i) => String(2026 - i))}
              value={form.year_of_passing} onChange={v => set('year_of_passing', v)} placeholder="Select year..." />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Certifications</label>
            <input className="form-input" placeholder="e.g. CFA, ICF ACC, Hogan Certified, PMP..."
              value={form.certifications} onChange={e => set('certifications', e.target.value)} />
            <div className="form-hint">Optional — only add if they meaningfully define your work</div>
          </div>
        </>}

        {/* SECTION C — Current Role */}
        {formStep === 2 && <>
          <div className="section-header">C — Your Current Role</div>

          {!isFreelance ? <>
            <div className="form-group">
              <label className="form-label">Current Industry <span className="required">*</span></label>
              <IndustrySelect value={form.current_industry} onChange={v => set('current_industry', v)} single={true} />
            </div>

            <div className="form-group">
              <label className="form-label">Tenure in Current Company</label>
              <TagSelect options={TENURES} value={form.current_tenure ? [form.current_tenure] : []} onChange={v => set('current_tenure', v[v.length-1] || '')} max={1} />
            </div>

            <div className="form-group">
              <label className="form-label">Company Type</label>
              <TagSelect options={['B2B','B2C','Both']} value={form.company_type_b2b_b2c ? [form.company_type_b2b_b2c] : []} onChange={v => set('company_type_b2b_b2c', v[v.length-1] || '')} max={1} />
            </div>

            <div className="form-group">
              <label className="form-label">Your Role Type</label>
              <TagSelect options={['Individual Contributor','Team Manager']} value={form.role_type ? [form.role_type] : []} onChange={v => set('role_type', v[v.length-1] || '')} max={1} />
            </div>

            {form.role_type === 'Team Manager' && (
              <div className="form-group">
                <label className="form-label">Team Size You Manage</label>
                <TagSelect options={TEAM_SIZES} value={form.team_size ? [form.team_size] : []} onChange={v => set('team_size', v[v.length-1] || '')} max={1} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Geography You Manage</label>
              <TagSelect options={GEOGRAPHIES} value={form.geography_managed} onChange={v => set('geography_managed', v)} />
            </div>

            <div className="form-group">
              <label className="form-label">Current CTC Breakup <span className="required">*</span></label>
              <div className="form-hint" style={{ marginBottom: 10 }}>All figures in Lakhs <strong>per annum</strong> (₹L). E.g. 25 means ₹25 Lakhs per year.</div>
              {[
                { key: 'ctc_fixed', label: 'Fixed / Base Salary' },
                { key: 'ctc_variable', label: 'Variable / Bonus' },
                { key: 'ctc_joining_bonus', label: 'Joining Bonus' },
                { key: 'ctc_esops', label: 'ESOPs / RSUs' },
                { key: 'ctc_allowances', label: 'Allowances (total)' },
              ].map(({ key, label }) => (
                <div key={key} className="ctc-row">
                  <div className="ctc-label">{label}</div>
                  <input className="ctc-input" type="number" min="0" placeholder="0"
                    value={form[key]} onChange={e => set(key, e.target.value)} />
                  <div style={{ fontSize: 12, color: 'var(--grey-400)', width: 16 }}>L</div>
                </div>
              ))}
              <div className="ctc-total">
                <span className="ctc-total-label">Total CTC</span>
                <span className="ctc-total-value">₹{ctcTotal.toFixed(2)}L</span>
              </div>
            </div>
          </> : <>
            <div className="form-group">
              <label className="form-label">Current Industry <span className="required">*</span></label>
              <div className="form-hint" style={{ marginBottom: 10 }}>The primary industry you are currently working in</div>
              <IndustrySelect value={form.freelance_sector} onChange={v => set('freelance_sector', v)} single={true} />
            </div>
            <div className="form-group">
              <label className="form-label">Typical Engagement Size</label>
              <TagSelect options={FREELANCE_ENGAGEMENT_SIZES} value={form.freelance_engagement_size ? [form.freelance_engagement_size] : []} onChange={v => set('freelance_engagement_size', v[v.length-1] || '')} max={1} />
            </div>
            <div className="form-group">
              <label className="form-label">Years in This Mode</label>
              <input className="form-input" type="number" placeholder="e.g. 4"
                value={form.freelance_years} onChange={e => set('freelance_years', e.target.value)} />
            </div>
          </>}
        </>}

        {/* SECTION D — Past Experience + Skills */}
        {formStep === 3 && <>
          <div className="section-header">D — Past Experience</div>

          <div className="form-group">
            <label className="form-label">Previous Industries</label>
            <div className="form-hint" style={{ marginBottom: 10 }}>
              Industries you have worked in before your current role — select up to 3
              {form.previous_industries.length >= 3 && <span style={{ color: 'var(--orange)', marginLeft: 6 }}>Maximum 3 selected</span>}
            </div>
            <IndustrySelect value={form.previous_industries} onChange={v => v.length <= 3 ? set('previous_industries', v) : null} />
          </div>

          <div className="form-group">
            <label className="form-label">Average Tenure Across Companies</label>
            <TagSelect options={AVG_TENURES} value={form.average_tenure ? [form.average_tenure] : []} onChange={v => set('average_tenure', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">B2B / B2C Exposure Across Career</label>
            <TagSelect options={['Primarily B2B','Primarily B2C','Both in equal measure']} value={form.career_b2b_b2c ? [form.career_b2b_b2c] : []} onChange={v => set('career_b2b_b2c', v[v.length-1] || '')} max={1} />
          </div>

          <div className="divider" />
          <div className="section-header">E — Skills & Identity</div>

          <div className="form-group">
            <label className="form-label">Your Skills <span className="required">*</span></label>
            <SkillTreeSelector
              functionName={form.primary_function}
              value={form.skill_tree}
              onChange={v => set('skill_tree', v)}
              mode="candidate"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Your Professional Headline <span className="required">*</span></label>
            <textarea className="form-textarea" maxLength={150}
              placeholder="e.g. 15 years in FMCG sales, built teams across North and West India, currently managing a national P&L of ₹300Cr"
              value={form.headline} onChange={e => set('headline', e.target.value)} />
            <div className="form-hint flex-between">
              <span>No name, no employer, no title — just your story in one line</span>
              <span style={{ color: form.headline.length > 130 ? 'var(--orange)' : 'var(--grey-400)' }}>{form.headline.length}/150</span>
            </div>
          </div>
        </>}

        {/* SECTION F — Open To */}
        {formStep === 4 && <>
          <div className="section-header">F — What You Are Open To</div>

          <div className="form-group">
            <label className="form-label">Job Search Status <span className="required">*</span></label>
            <TagSelect options={JOB_SEARCH_STATUSES} value={form.job_search_status ? [form.job_search_status] : []} onChange={v => set('job_search_status', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Seniority of Role Open To</label>
            <TagSelect options={SENIORITY_LEVELS} value={form.seniority_open_to} onChange={v => set('seniority_open_to', v)} />
          </div>

          <div className="form-group">
            <label className="form-label">Organisation Type Open To</label>
            <TagSelect options={ORG_TYPES} value={form.org_type_open_to} onChange={v => set('org_type_open_to', v)} />
          </div>

          <div className="form-group">
            <label className="form-label">Work Preference</label>
            <TagSelect options={['On-site','Hybrid','Remote','Flexible']} value={form.work_preference ? [form.work_preference] : []} onChange={v => set('work_preference', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Preferred Work Locations</label>
            <div className="form-hint" style={{ marginBottom: 10 }}>Select all cities or zones you are open to working in</div>
            <CandidateLocationPicker
              value={form.preferred_locations}
              onChange={v => set('preferred_locations', v)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Companies to Block</label>
            <textarea className="form-textarea" style={{ minHeight: 70 }}
              placeholder="e.g. Hindustan Unilever, HUL, Unilever India (comma separated)"
              value={form.blocked_companies} onChange={e => set('blocked_companies', e.target.value)} />
            <div className="form-hint">Optional. These companies will never see your profile. You can add more later.</div>
          </div>
        </>}

        {/* REVIEW */}
        {formStep === 5 && <>
          <div className="section-header">Review & Submit</div>

          {/* COMPLETION CHECK */}
          {(() => {
            const missing = []
            if (!form.headline.trim()) missing.push('headline')
            if (!form.job_search_status) missing.push('jobstatus')
            if (!form.primary_function) missing.push('function')
            if (!form.years_experience) missing.push('experience')
            if (form.skill_tree.length === 0) missing.push('skills')
            return missing.length > 0 ? (
              <div style={{ background: '#fff8f0', border: '1.5px solid #f5c4a3', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  {missing.length} field{missing.length > 1 ? 's' : ''} still need attention
                </div>
                <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>Please fill in the highlighted fields below before submitting.</div>
              </div>
            ) : (
              <div style={{ background: 'var(--teal-light)', border: '1.5px solid var(--teal-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ fontSize: 18 }}>✓</span>
                <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>Profile complete — ready to submit</div>
              </div>
            )
          })()}

          {/* PROFILE SUMMARY */}
          <div className="card card-teal" style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.4 }}>Profile Summary</div>
            {[
              { label: 'Function', value: form.primary_function },
              { label: 'Experience', value: form.years_experience ? form.years_experience + ' years' : '' },
              { label: 'Current Employment', value: form.current_employment_type },
              { label: 'Current Industry', value: form.current_industry || form.freelance_sector },
              { label: 'Total CTC', value: ctcTotal ? '\u20b9' + ctcTotal.toFixed(1) + 'L' : '' },
              { label: 'Skill Areas', value: form.skill_tree.length ? form.skill_tree.length + ' added' : '' },
              { label: 'Job Status', value: form.job_search_status },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--teal-border)', fontSize: 13 }}>
                <span style={{ color: 'var(--grey-600)' }}>{label}</span>
                <span style={{ fontWeight: 600, maxWidth: '60%', textAlign: 'right', color: value ? 'var(--grey-800)' : '#f5a623' }}>{value || 'Not filled'}</span>
              </div>
            ))}
          </div>

          {/* HEADLINE — always editable on review */}
          <div className="form-group">
            <label className="form-label" style={{ color: !form.headline.trim() ? 'var(--orange)' : 'var(--grey-600)' }}>
              Professional Headline <span className="required">*</span>
              {!form.headline.trim() && <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: 'var(--orange)', textTransform: 'none' }}>Fill this before submitting</span>}
            </label>
            <textarea className="form-textarea" maxLength={150}
              style={{ borderColor: !form.headline.trim() ? 'var(--orange)' : undefined }}
              placeholder="e.g. 15 years in FMCG sales, built teams across North and West India, currently managing a national P&L"
              value={form.headline} onChange={e => set('headline', e.target.value)} />
            <div className="form-hint flex-between">
              <span>No name, no employer, no title — your story in one line</span>
              <span style={{ color: form.headline.length > 130 ? 'var(--orange)' : 'var(--grey-400)' }}>{form.headline.length}/150</span>
            </div>
          </div>

          {/* JOB SEARCH STATUS — editable inline if missing */}
          {!form.job_search_status && (
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--orange)' }}>
                Job Search Status <span className="required">*</span>
                <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: 'var(--orange)', textTransform: 'none' }}>Fill this before submitting</span>
              </label>
              <div className="tag-cloud">
                {['Actively looking (want to move within 0\u20133 months)', 'Passively open (the right role would make me consider moving)', 'Just exploring (not in a hurry, happy where I am)'].map(s => (
                  <button key={s} type="button" className={'tag' + (form.job_search_status === s ? ' selected' : '')} onClick={() => set('job_search_status', s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS MISSING WARNING */}
          {form.skill_tree.length === 0 && (
            <div style={{ background: '#fff8f0', border: '1.5px solid #f5c4a3', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--orange)' }}>No skills added yet.</strong> Go back to Section E — Past Experience to add your skill areas. This is what companies match against your profile.
              </div>
            </div>
          )}

          {/* PRIVACY */}
          <div className="card" style={{ background: '#fff8f0', borderColor: 'var(--orange)', marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6 }}>
              🔒 <strong>Your identity is safe.</strong> No name, no employer, no photo is stored. Your contact detail is encrypted and never shown to anyone. You will only be contacted if you say yes to an opportunity.
            </div>
          </div>

          {/* DECLARATION */}
          <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.declaration_agreed}
                onChange={e => set('declaration_agreed', e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, accentColor: '#0f4f47' }} />
              <span style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                I confirm that all information provided is accurate to the best of my knowledge. StealthSideUp reserves the right to suspend or permanently restrict access to the platform if any declared information is found to be materially inaccurate during or after the recruitment process.
              </span>
            </label>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.headline.trim() || !form.job_search_status || !form.declaration_agreed}>
            {loading ? 'Saving your profile...' : '\u2713 Submit My Profile'}
          </button>
        </>}

        {/* NAV BUTTONS */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setStep(s => s - 1)}>
            ← Back
          </button>
          {formStep < 5 && (
            <button className="btn-primary" style={{ flex: 2 }} onClick={() => setStep(s => s + 1)}>
              Continue →
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
