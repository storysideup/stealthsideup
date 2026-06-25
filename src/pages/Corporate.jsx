import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FUNCTIONS, INDUSTRIES, SKILLS_BY_FUNCTION, SENIORITY_LEVELS, ORG_TYPES, NOTICE_PERIODS, LANGUAGES } from '../data/formData'
import SkillTreeSelector from '../components/SkillTreeSelector'
import { CityPicker } from '../components/LocationPicker'
import { CareerHistoryDisplay } from '../components/CareerHistory'

// ── CORPORATE LOGIN ──────────────────────────────────────
export function CorporateLogin({ onNavigate, onCorporateLogin }) {
  const [mode, setMode] = useState('login') // login | register
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({ company_name: '', industry: '', company_type: '', gstin: '', contact_person: '', designation: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('corporates').select('*').eq('work_email', email).single()
    if (err || !data) { setError('Account not found. Please register first.'); setLoading(false); return }
    // Simple password check (in production use proper auth)
    if (data.password_hash !== btoa(password)) { setError('Incorrect password'); setLoading(false); return }
    onCorporateLogin(data)
    onNavigate('corporate-dashboard')
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !form.company_name || !form.contact_person) {
      setError('Company name, your name, email and password are required'); return
    }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('corporates').insert({
      ...form, work_email: email, password_hash: btoa(password), subscription_tier: 'free', is_active: true, tokens: 3
    })
    if (err) { setError(err.message.includes('duplicate') ? 'This email is already registered.' : err.message); setLoading(false); return }
    setMode('login')
    setError('')
    alert('Account created! You have been given 3 free tokens to start. Please login.')
    setLoading(false)
  }

  return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Corporate Access</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>Post JDs and reach senior passive talent who are invisible on every other platform.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button className={`tag ${mode === 'login' ? 'selected' : ''}`} onClick={() => setMode('login')}>Login</button>
        <button className={`tag ${mode === 'register' ? 'selected' : ''}`} onClick={() => setMode('register')}>Register Company</button>
      </div>

      {mode === 'register' && <>
        <div className="form-group">
          <label className="form-label">Company Name <span className="required">*</span></label>
          <input className="form-input" placeholder="Acme Technologies Pvt Ltd" value={form.company_name} onChange={e => set('company_name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Your Name <span className="required">*</span></label>
          <input className="form-input" placeholder="Full name" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
        </div>
      </>}

      <div className="form-group">
        <label className="form-label">Work Email <span className="required">*</span></label>
        <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="form-hint">Must be a company email — no Gmail, Yahoo, or Hotmail</div>
      </div>
      <div className="form-group">
        <label className="form-label">Password <span className="required">*</span></label>
        <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
      </div>

      {error && <div className="error-msg">{error}</div>}

      <button className="btn-primary" onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading}>
        {loading ? 'Please wait...' : mode === 'login' ? 'Login →' : 'Create Account →'}
      </button>
      <div className="mt-4">
        <button className="btn-secondary" onClick={() => onNavigate('home')}>← Back to Home</button>
      </div>
    </div>
  )
}

// ── POST JD ──────────────────────────────────────────────
export function PostJD({ corporate, onNavigate }) {
  const [form, setForm] = useState({
    role_title: '', function: '', industry: '', seniority_level: '', role_type: '',
    team_size_expected: '', geography: '', employment_type: '', org_type: '',
    work_mode: '', location: '', relocation_support: '',
    ctc_fixed_min: '', ctc_fixed_max: '', ctc_variable: '', ctc_other: '',
    must_have_skills: [], good_to_have_skills: [], skill_tree_requirement: [], role_context: '', why_role: '',
    stealth_mode: false, job_function: '', end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], gender_preference: 'No preference — open to all',
    max_notice_period: '', min_years_in_function: '', languages_required: [], travel_required: '',
    recruiter_email: '', recruiter_whatsapp: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [jdText, setJdText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extracted, setExtracted] = useState(false)
  const [aiFields, setAiFields] = useState([])
  const [eduPref, setEduPref] = useState({ min_degree: '', institute_pref: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const skillOptions = form.job_function && SKILLS_BY_FUNCTION[form.job_function] ? SKILLS_BY_FUNCTION[form.job_function] : []

  const handleExtractJD = async () => {
    if (!jdText.trim()) {
      setExtractError('Please upload a JD file or paste the text'); return
    }

    // Handle file upload
    let textToExtract = jdText
    if (jdText.startsWith('FILE:')) {
      const b64 = jdText.split(':NAME:')[0].replace('FILE:', '')
      textToExtract = atob(b64).slice(0, 4000)
    } else if (jdText.trim().length < 50) {
      setExtractError('Please paste a more detailed JD — at least a few sentences'); return
    }

    setExtracting(true); setExtractError('')
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_KEY
      if (!apiKey) throw new Error('API key not configured')
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Extract structured information from this job description. Return ONLY a valid JSON object, no markdown, no backticks:
{"role_title":"exact job title","job_function":"one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Technology & Product, Legal & Compliance, Strategy & Consulting, General Management / P&L","seniority_level":"one of: Junior (0-5 yrs, individual contributor), Mid (5-12 yrs, may lead small teams), Senior (12-20 yrs, leads functions or large teams), Leadership (20+ yrs, CXO / functional head)","role_type":"Individual Contributor or Team Manager","role_context":"2-3 sentences on what this person owns max 280 chars","why_role":"1-2 sentences on why exciting max 180 chars","employment_type":"Full-time","location":"city name only","ctc_fixed_min":null,"ctc_fixed_max":null,"skills":[{"subFunction":"specific skill area name relevant to the function","proficiency":"proficient or expert","specialisation":"specific specialisation if clear"}]}
Extract 3-6 most important skills from the JD for the skills array.
JD: ${textToExtract.slice(0, 3000)}`
          }]
        })
      })
      if (!response.ok) throw new Error('API error ' + response.status)
      const data = await response.json()
      const rawText = data.content?.[0]?.text || ''
      const clean = rawText.replace(/\`\`\`json|\`\`\`/g, '').trim()
      const parsed = JSON.parse(clean)
      const filled = []
      const updates = {}
      if (parsed.role_title) { updates.role_title = parsed.role_title; filled.push('role_title') }
      if (parsed.job_function) { updates.job_function = parsed.job_function; filled.push('job_function') }
      if (parsed.seniority_level) { updates.seniority_level = parsed.seniority_level; filled.push('seniority_level') }
      if (parsed.role_type) { updates.role_type = parsed.role_type; filled.push('role_type') }
      if (parsed.role_context) { updates.role_context = parsed.role_context; filled.push('role_context') }
      if (parsed.why_role) { updates.why_role = parsed.why_role; filled.push('why_role') }
      if (parsed.employment_type) { updates.employment_type = parsed.employment_type; filled.push('employment_type') }
      if (parsed.location) { updates.location = parsed.location; filled.push('location') }
      if (parsed.ctc_fixed_min) { updates.ctc_fixed_min = String(parsed.ctc_fixed_min); filled.push('ctc_fixed_min') }
      if (parsed.ctc_fixed_max) { updates.ctc_fixed_max = String(parsed.ctc_fixed_max); filled.push('ctc_fixed_max') }
      if (parsed.skills?.length > 0) {
        updates.skill_tree_requirement = parsed.skills.map(s => ({
          subFunction: s.subFunction || '', proficiency: s.proficiency || 'proficient',
          specialisation: s.specialisation || '', depth: [], customDepth: ''
        }))
        filled.push('skills')
      }
      setAiFields(filled)
      setForm(f => ({ ...f, ...updates }))
      setExtracted(true)
    } catch (e) {
      setExtractError('Could not extract: ' + (e.message || 'Unknown error') + '. Please fill the form manually.')
    }
    setExtracting(false)
  }

  const handleSubmit = async () => {
    if (!form.role_title || !form.job_function || !form.seniority_level) {
      setError('Role title, function and seniority level are required'); return
    }
    if (!form.recruiter_email || !form.recruiter_email.includes('@')) {
      setError('Please enter a valid email address to receive candidate CVs'); return
    }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('jds').insert({ ...form, function: form.job_function, corporate_id: corporate.id, is_active: true, min_degree_required: eduPref.min_degree, institute_preference: eduPref.institute_pref })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div className="page" style={{ paddingTop: 32 }}>
      <div className="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#0F4F47" strokeWidth="2.5" width="32" height="32"><polyline points="20 6 9 17 4 12" /></svg></div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6, textAlign: 'center' }}>Your Search is Live</h2>
      <p style={{ color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 24, textAlign: 'center', fontSize: 14 }}>
        We are now matching anonymous profiles against your criteria in the background.
      </p>

      <div className="card card-teal" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>What happens next</div>
        {[
          { step: '1', text: 'StealthSideUp matches your search criteria against anonymous candidate profiles — function, seniority, industry, skills, location and CTC.' },
          { step: '2', text: 'You see matched profiles on your dashboard — anonymised. No names, no employers, no contact details.' },
          { step: '3', text: 'You express interest in a profile. The candidate receives a WhatsApp notification from StorySideUp.' },
          { step: '4', text: 'If the candidate says yes, StorySideUp facilitates the introduction and shares their contact details with you.' },
          { step: '5', text: 'If the candidate declines, their identity is never revealed. You simply see "Not interested".' },
        ].map(({ step, text }) => (
          <div key={step} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{step}</div>
            <div style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6 }}>{text}</div>
          </div>
        ))}
      </div>

      <div style={{ background: '#fff8f0', border: '1px solid #f5c4a3', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--orange)' }}>Important:</strong> All candidate contact is facilitated by StorySideUp. You will never contact a candidate directly without their consent. This is what makes the platform trusted by senior professionals.
        </div>
      </div>

      <button className="btn-primary" onClick={() => onNavigate('corporate-dashboard')}>View My Dashboard →</button>
    </div>
  )

  const aiBg = (field) => aiFields.includes(field) ? { background: '#e8f4f2', borderColor: '#0f4f47' } : {}
  const AiBadge = ({ field }) => aiFields.includes(field) ? (
    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--teal)', background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 4, padding: '2px 6px', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.3 }}>AI filled</span>
  ) : <span style={{ fontSize: 10, color: 'var(--orange)', marginLeft: 8, fontWeight: 600 }}>⚠ Fill this</span>

  return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>Post a New Search</h2>

      {/* Company name confirmation */}
      <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>🏢</span>
        <div>
          <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 1 }}>Posting on behalf of</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{corporate.company_name}</div>
        </div>
      </div>

      {/* JD EXTRACTION */}
      {!extracted ? (
        <div style={{ background: '#f9fafb', border: '1.5px solid var(--grey-200)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 4 }}>
            ⚡ Have an existing JD? Let AI fill the form for you
          </div>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 12, lineHeight: 1.6 }}>
            Upload your JD file or paste the text — we extract everything automatically.
          </div>

          {/* File upload option */}
          <label style={{
            display: 'block', border: jdText.startsWith('FILE:') ? '2px solid var(--teal)' : '1.5px dashed var(--grey-300)',
            borderRadius: 8, padding: '14px', textAlign: 'center', cursor: 'pointer',
            background: jdText.startsWith('FILE:') ? 'var(--teal-light)' : 'white', marginBottom: 10
          }}>
            <input type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => {
                const b64 = reader.result.split(',')[1]
                setJdText('FILE:' + b64 + ':NAME:' + file.name)
              }
              reader.readAsDataURL(file)
            }} />
            {jdText.startsWith('FILE:') ? (
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)' }}>
                ✓ {jdText.split(':NAME:')[1]} — ready to extract
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 20, marginBottom: 4 }}>📎</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 2 }}>Upload JD file</div>
                <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>PDF, Word or text file</div>
              </div>
            )}
          </label>

          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--grey-400)', marginBottom: 10 }}>— or paste text below —</div>

          <textarea
            style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', minHeight: 80, outline: 'none', resize: 'vertical', marginBottom: 10 }}
            placeholder="Paste your JD here..."
            value={jdText.startsWith('FILE:') ? '' : jdText}
            onChange={e => setJdText(e.target.value)}
          />
          {extractError && <div className="error-msg" style={{ marginBottom: 8 }}>{extractError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary btn-sm" onClick={handleExtractJD} disabled={extracting || (!jdText.trim())}>
              {extracting ? 'Extracting...' : '⚡ Extract & Fill Form'}
            </button>
            <button type="button" className="btn-secondary btn-sm" onClick={() => setExtracted(true)}>
              Fill manually
            </button>
          </div>
        </div>
      ) : (
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
            {jdText ? '✓ Form pre-filled from your JD — review and edit below' : '✓ Filling form manually'}
          </div>
          <button type="button" onClick={() => { setExtracted(false); setJdText('') }} style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit' }}>
            Start over
          </button>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Role Title <span className="required">*</span>{extracted && <AiBadge field="role_title" />}</label>
        <input className="form-input" style={aiBg('role_title')} placeholder="e.g. Head of Sales — West India" value={form.role_title} onChange={e => set('role_title', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Function <span className="required">*</span>{extracted && <AiBadge field="job_function" />}</label>
        <select className="form-select" style={aiBg('job_function')} value={form.job_function} onChange={e => { set('job_function', e.target.value); set('must_have_skills', []); set('good_to_have_skills', []); set('skill_tree_requirement', []) }}>
          <option value="">Select function...</option>
          {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Industry Hiring For</label>
        <select className="form-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
          <option value="">Select industry...</option>
          {INDUSTRIES.map(g => (
            <optgroup key={g.sector} label={g.sector}>
              {g.items.map(i => <option key={i} value={i}>{i}</option>)}
            </optgroup>
          ))}
          <option value="Other">Other</option>
        </select>
        {form.industry === 'Other' && (
          <input className="form-input" style={{ marginTop: 8 }} placeholder="Please specify industry..."
            value={form.industry_other || ''} onChange={e => set('industry_other', e.target.value)} />
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Seniority Level <span className="required">*</span></label>
        <div className="tag-cloud">
          {SENIORITY_LEVELS.map(s => <button key={s} type="button" className={`tag ${form.seniority_level === s ? 'selected' : ''}`} onClick={() => set('seniority_level', s)}>{s}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Role Type</label>
        <div className="tag-cloud">
          {['Individual Contributor','Team Manager'].map(t => <button key={t} type="button" className={`tag ${form.role_type === t ? 'selected' : ''}`} onClick={() => set('role_type', t)}>{t}</button>)}
        </div>
      </div>

      {form.role_type === 'Team Manager' && (
        <div className="form-group">
          <label className="form-label">Expected Team Size</label>
          <div className="tag-cloud">
            {['1 to 5','5 to 15','15 to 50','50 to 200','200 plus'].map(s => <button key={s} type="button" className={`tag ${form.team_size_expected === s ? 'selected' : ''}`} onClick={() => set('team_size_expected', s)}>{s}</button>)}
          </div>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Geography of Role</label>
        <div className="tag-cloud">
          {['Zonal','National','International'].map(g => <button key={g} type="button" className={`tag ${form.geography === g ? 'selected' : ''}`} onClick={() => set('geography', g)}>{g}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Employment Type Offered</label>
        <div className="tag-cloud">
          {['Full-time','Freelance / Contract','Fractional'].map(t => <button key={t} type="button" className={`tag ${form.employment_type === t ? 'selected' : ''}`} onClick={() => set('employment_type', t)}>{t}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Organisation Type</label>
        <div className="tag-cloud">
          {['Large Indian Conglomerate','Mid-size Indian','Startup — Early Stage','Startup — Growth Stage','MNC'].map(t => <button key={t} type="button" className={`tag ${form.org_type === t ? 'selected' : ''}`} onClick={() => set('org_type', t)}>{t}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Work Mode</label>
        <div className="tag-cloud">
          {['On-site','Hybrid','Remote','Flexible'].map(m => <button key={m} type="button" className={`tag ${form.work_mode === m ? 'selected' : ''}`} onClick={() => set('work_mode', m)}>{m}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Role Location</label>
        <CityPicker value={form.location} onChange={v => set('location', v)} />
      </div>

      <div className="form-group">
        <label className="form-label">Relocation Support</label>
        <div className="tag-cloud">
          {['Yes','No','Partial'].map(r => <button key={r} type="button" className={`tag ${form.relocation_support === r ? 'selected' : ''}`} onClick={() => set('relocation_support', r)}>{r}</button>)}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Fixed CTC Budget — ₹ Lakhs per annum</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input className="form-input" type="number" placeholder="Min e.g. 25" value={form.ctc_fixed_min} onChange={e => set('ctc_fixed_min', e.target.value)} />
          <span style={{ color: 'var(--grey-400)' }}>to</span>
          <input className="form-input" type="number" placeholder="Max e.g. 35" value={form.ctc_fixed_max} onChange={e => set('ctc_fixed_max', e.target.value)} />
        </div>
        <div className="form-hint">Annual figures only. E.g. 25 means ₹25 Lakhs per annum.</div>
      </div>

      <div className="form-group">
        <label className="form-label">Variable / Other Components</label>
        <input className="form-input" placeholder="e.g. 20% variable + ESOPs" value={form.ctc_variable} onChange={e => set('ctc_variable', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Skill Requirements</label>
        <div className="form-hint" style={{ marginBottom: 10 }}>Specify the skills you need — this is matched against candidate profiles</div>
        <SkillTreeSelector
          functionName={form.job_function}
          value={form.skill_tree_requirement}
          onChange={v => set('skill_tree_requirement', v)}
          mode="corporate"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Role Context <span className="required">*</span></label>
        <textarea className="form-textarea" maxLength={300} placeholder="What is this role expected to achieve in year one? What does success look like? Max 300 words."
          value={form.role_context} onChange={e => set('role_context', e.target.value)} />
        <div className="form-hint flex-between"><span>What will this person own in their first year? What does success look like in this role?</span><span>{form.role_context.length}/300</span></div>
      </div>

      <div className="form-group">
        <label className="form-label">Why This Role / Why This Company</label>
        <textarea className="form-textarea" maxLength={200} placeholder="What makes this opportunity worth a senior professional's time?"
          value={form.why_role} onChange={e => set('why_role', e.target.value)} />
        <div className="form-hint">Optional but highly recommended — senior candidates read this first</div>
      </div>

      {/* NOTICE PERIOD */}
      <div className="form-group">
        <label className="form-label">Maximum Notice Period Acceptable</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['Immediate', 'Up to 30 days', '30 to 60 days', '60 to 90 days', 'More than 90 days', 'No restriction'].map(opt => (
            <button key={opt} type="button"
              className={`tag ${form.max_notice_period === opt ? 'selected' : ''}`}
              onClick={() => set('max_notice_period', opt)}>{opt}</button>
          ))}
        </div>
        <div className="form-hint">Candidates with longer notice periods will not appear in your matches.</div>
      </div>

      {/* MIN YEARS IN FUNCTION */}
      <div className="form-group">
        <label className="form-label">Minimum Years in This Function</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input className="form-input" type="number" min="0" max="40" placeholder="e.g. 8" style={{ maxWidth: 100 }}
            value={form.min_years_in_function} onChange={e => set('min_years_in_function', e.target.value)} />
          <span style={{ fontSize: 13, color: 'var(--grey-400)' }}>years minimum</span>
        </div>
        <div className="form-hint">Total years specifically in {form.job_function || 'the required function'} — not total career experience.</div>
      </div>

      {/* LANGUAGES REQUIRED */}
      <div className="form-group">
        <label className="form-label">Languages Required</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati', 'Punjabi'].map(lang => (
            <button key={lang} type="button"
              className={`tag ${form.languages_required.includes(lang) ? 'selected' : ''}`}
              onClick={() => {
                const arr = form.languages_required
                set('languages_required', arr.includes(lang) ? arr.filter(l => l !== lang) : [...arr, lang])
              }}>{lang}</button>
          ))}
        </div>
        <div className="form-hint">Only candidates who know all selected languages will appear in matches.</div>
      </div>

      {/* TRAVEL REQUIRED */}
      <div className="form-group">
        <label className="form-label">International Travel Required?</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['Yes, frequently', 'Occasionally', 'No'].map(opt => (
            <button key={opt} type="button"
              className={`tag ${form.travel_required === opt ? 'selected' : ''}`}
              onClick={() => set('travel_required', opt)}>{opt}</button>
          ))}
        </div>
      </div>

      {/* EDUCATION PREFERENCE */}
      <div className="form-group">
        <label className="form-label">Minimum Education Required</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['No preference', 'Graduation / Degree', 'Post Graduation', 'MBA / PGDM', 'PhD / Doctorate'].map(opt => (
            <button key={opt} type="button"
              className={`tag ${eduPref.min_degree === opt ? 'selected' : ''}`}
              onClick={() => setEduPref(e => ({ ...e, min_degree: opt }))}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Institute Preference</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['No preference', 'Premier institutes only (IIM / IIT / XLRI / ISB etc.)', 'Any recognised institute'].map(opt => (
            <button key={opt} type="button"
              className={`tag ${eduPref.institute_pref === opt ? 'selected' : ''}`}
              onClick={() => setEduPref(e => ({ ...e, institute_pref: opt }))}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* GENDER PREFERENCE */}
      <div className="form-group">
        <label className="form-label">Gender Preference</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {['No preference — open to all', 'Preference for women candidates', 'Preference for men candidates', 'Role specifically requires women', 'Role specifically requires men'].map(opt => (
            <button key={opt} type="button"
              onClick={() => set('gender_preference', opt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 13px',
                border: form.gender_preference === opt ? '2px solid var(--teal)' : '1.5px solid var(--grey-200)',
                borderRadius: 8, background: form.gender_preference === opt ? 'var(--teal-light)' : 'white',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
              }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
                border: form.gender_preference === opt ? '4px solid var(--teal)' : '2px solid var(--grey-300)',
                background: 'white'
              }} />
              <span style={{ fontSize: 13, color: form.gender_preference === opt ? 'var(--teal)' : 'var(--grey-800)', fontWeight: form.gender_preference === opt ? 600 : 400 }}>{opt}</span>
            </button>
          ))}
        </div>
        <div className="form-hint" style={{ marginTop: 8 }}>Used only as a matching filter — never shown to candidates on their profile.</div>
      </div>

      {/* END DATE */}
      <div className="form-group">
        <label className="form-label">Search Valid Till <span className="required">*</span></label>
        <input className="form-input" type="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.end_date}
          onChange={e => set('end_date', e.target.value)} />
        <div className="form-hint">After this date the search closes automatically and no new candidates are matched. Default is 10 days — adjust as needed for your timeline.</div>
      </div>

      {/* RECRUITER CONTACT — where to receive CVs */}
      <div className="form-group">
        <label className="form-label">Where should we send candidate CVs? <span className="required">*</span></label>
        <div className="form-hint" style={{ marginBottom: 10 }}>When a candidate says yes, their CV and contact details will be sent here.</div>
        <input className="form-input" type="email" placeholder="recruiter@company.com"
          value={form.recruiter_email} onChange={e => set('recruiter_email', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">WhatsApp for quick notifications (optional)</label>
        <div className="form-hint" style={{ marginBottom: 10 }}>Get an instant WhatsApp when a candidate says yes.</div>
        <input className="form-input" type="tel" placeholder="+91 98765 43210"
          value={form.recruiter_whatsapp} onChange={e => set('recruiter_whatsapp', e.target.value)} />
      </div>

      {/* STEALTH MODE TOGGLE — after all basics filled */}
      <div className="form-group">
        <label className="form-label">How do you want to post this search?</label>
        <div style={{ border: '1.5px solid var(--grey-200)', borderRadius: 10, overflow: 'hidden' }}>
          <button type="button"
            onClick={() => set('stealth_mode', false)}
            style={{
              width: '50%', padding: '12px 10px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: !form.stealth_mode ? 'var(--teal)' : 'white',
              color: !form.stealth_mode ? 'white' : 'var(--grey-600)',
              borderRight: '1px solid var(--grey-200)'
            }}>
            🌐 Standard
          </button>
          <button type="button"
            onClick={() => set('stealth_mode', true)}
            style={{
              width: '50%', padding: '12px 10px', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: form.stealth_mode ? '#1f2937' : 'white',
              color: form.stealth_mode ? 'white' : 'var(--grey-600)'
            }}>
            🕵️ Stealth
          </button>
        </div>
        {!form.stealth_mode ? (
          <div className="form-hint" style={{ marginTop: 8 }}>
            <strong>{corporate.company_name}</strong> will be visible to candidates in their notification.
          </div>
        ) : (
          <div style={{ background: '#1f2937', borderRadius: 8, padding: '12px 14px', marginTop: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Stealth Mode Active</div>
            <p style={{ fontSize: 12, color: '#d1d5db', lineHeight: 1.65 }}>
              <strong style={{ color: 'white' }}>{corporate.company_name}</strong> will not be visible to candidates. They will only see industry, location, role level and CTC range. StorySideUp facilitates all introductions.
            </p>
          </div>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Posting search...' : 'Post This Search →'}
      </button>
    </div>
  )
}

// ── CORPORATE DASHBOARD ──────────────────────────────────
export function CorporateDashboard({ corporate, onNavigate }) {
  const [jds, setJds] = useState([])
  const [matches, setMatches] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeJd, setActiveJd] = useState(null)
  const [interests, setInterests] = useState([])

  useEffect(() => {
    if (!corporate) { onNavigate('corporate-login'); return }
    loadJds()
  }, [corporate])

  const loadJds = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('jds').select('*').eq('corporate_id', corporate.id).eq('is_active', true).or(`end_date.is.null,end_date.gte.${today}`).order('created_at', { ascending: false })
    setJds(data || [])
    if (data?.length) await loadMatches(data)
    setLoading(false)
  }

  const loadMatches = async (jdList) => {
    const matchMap = {}
    for (const jd of jdList) {
      const candidates = await matchCandidates(jd, corporate)
      matchMap[jd.id] = candidates
    }
    setMatches(matchMap)
  }

  const loadInterests = async (jdId) => {
    const { data } = await supabase.from('interests').select('*, candidates(*)').eq('jd_id', jdId).eq('corporate_id', corporate.id)
    setInterests(data || [])
  }

  const handleExpressInterest = async (jd, candidate) => {
    const { error } = await supabase.from('interests').insert({
      jd_id: jd.id, candidate_id: candidate.id, corporate_id: corporate.id, status: 'notified'
    })
    if (!error) {
      if (jd.stealth_mode) {
        alert('Interest expressed in Stealth Mode. The candidate will receive a notification showing only your industry, location, role level and CTC range — not your company name. Your identity is revealed only after they say yes and you choose to proceed.')
      } else {
        alert(`Interest expressed. The candidate will receive a notification from ${corporate.company_name} with full role details.`)
      }
    }
  }

  const handleSave = async (jd, candidate) => {
    await supabase.from('interests').insert({
      jd_id: jd.id, candidate_id: candidate.id, corporate_id: corporate.id, status: 'saved'
    })
    alert('Profile shortlisted. You can express interest when ready.')
  }

  const handleNotFit = async (jdId, candidateId) => {
    await supabase.from('interests').insert({
      jd_id: jdId, candidate_id: candidateId, corporate_id: corporate.id, status: 'not_fit'
    })
    // Refresh matches to remove this candidate from view
    const updated = await matchCandidates(activeJd, corporate)
    setMatches(m => ({ ...m, [jdId]: updated.filter(c => c.id !== candidateId) }))
  }

  if (!corporate) return null

  if (activeJd) {
    const candidateList = matches[activeJd.id] || []
    return (
      <div className="page">
        <button className="btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={() => setActiveJd(null)}>← Back</button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
          <h3 style={{ fontWeight: 800, color: 'var(--teal)' }}>{activeJd.role_title}</h3>
          {activeJd.stealth_mode && (
            <span style={{ background: '#1f2937', color: 'white', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5, letterSpacing: 0.3 }}>🕵️ STEALTH</span>
          )}
        </div>
        <p style={{ color: 'var(--grey-400)', fontSize: 13, marginBottom: 20 }}>{activeJd.function} · {activeJd.seniority_level}</p>

        {candidateList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--grey-600)', fontSize: 14 }}>No matching profiles yet. As more candidates register, matches will appear here.</p>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 16 }}>
              <strong style={{ color: 'var(--teal)' }}>{candidateList.length}</strong> anonymous profiles match this role
            </div>
            {candidateList.map((c, i) => (
              <div key={c.id} className="card" style={{ marginBottom: 16 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="badge badge-teal">SSU-{String(i + 1001).padStart(4, '0')}</span>
                    {c.job_search_status?.includes('Actively') && <span className="badge badge-green">Active</span>}
                    {c.current_employment_type && <span className="badge badge-grey">{c.current_employment_type}</span>}
                  </div>
                </div>

                {/* Headline */}
                <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--grey-600)', lineHeight: 1.5, marginBottom: 12, borderLeft: '3px solid var(--orange)', paddingLeft: 10 }}>"{c.headline}"</p>

                {/* Key stats grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {[
                    { label: 'Experience', value: c.years_experience ? c.years_experience + ' years' : null },
                    { label: 'In Function', value: c.years_in_function ? c.years_in_function + ' yrs in role' : null },
                    { label: 'Current CTC', value: c.ctc_total ? '₹' + c.ctc_total + 'L' : null },
                    { label: 'Min Expected', value: c.min_expected_ctc ? '₹' + c.min_expected_ctc + 'L' : null },
                    { label: 'Notice Period', value: c.notice_period || null },
                    { label: 'Work Pref', value: c.work_preference || null },
                    { label: 'B2B / B2C', value: c.career_b2b_b2c || null },
                    { label: 'Travel', value: c.open_to_travel || null },
                  ].filter(item => item.value).map(({ label, value }) => (
                    <div key={label} style={{ background: 'var(--grey-50)', borderRadius: 7, padding: '7px 10px' }}>
                      <div style={{ fontSize: 10, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--grey-800)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Industries */}
                {(c.current_industry || c.previous_industries?.length > 0) && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Industry Background</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {c.current_industry && <span className="badge badge-teal">{c.current_industry} (current)</span>}
                      {c.previous_industries?.slice(0, 3).map(ind => <span key={ind} className="badge badge-grey">{ind}</span>)}
                    </div>
                  </div>
                )}

                {/* Location preferences */}
                {c.preferred_locations?.cities?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Open to Locations</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {c.preferred_locations.cities.map(city => <span key={city} className="badge badge-grey">{city}</span>)}
                      {c.preferred_locations.openToNearby && <span className="badge badge-teal">Open to nearby</span>}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {c.languages?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Languages</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {c.languages.map(l => <span key={l} className="badge badge-grey">{l}</span>)}
                    </div>
                  </div>
                )}

                {/* Skills with proof points */}
                {c.skill_tree?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Skills & Proof Points</div>
                    {c.skill_tree.slice(0, 4).map((skill, si) => (
                      <div key={si} style={{ background: 'var(--grey-50)', borderRadius: 7, padding: '8px 10px', marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: skill.proofPoint ? 4 : 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-800)' }}>{skill.subFunction}</span>
                          {skill.proficiency && <span className="badge badge-teal" style={{ fontSize: 10 }}>{skill.proficiency}</span>}
                        </div>
                        {skill.specialisation && <div style={{ fontSize: 11, color: 'var(--grey-600)', marginBottom: skill.proofPoint ? 3 : 0 }}>{skill.specialisation}</div>}
                        {skill.proofPoint && <div style={{ fontSize: 11, color: 'var(--orange)', fontStyle: 'italic' }}>"{skill.proofPoint}"</div>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Career arc */}
                {c.career_history?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Career Arc</div>
                    <CareerHistoryDisplay careerHistory={c.career_history} />
                  </div>
                )}

                {/* Org type open to */}
                {c.org_type_open_to?.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Open to Org Types</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {c.org_type_open_to.map(o => <span key={o} className="badge badge-grey" style={{ fontSize: 10 }}>{o}</span>)}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                  <button className="btn-primary btn-sm" onClick={() => handleExpressInterest(activeJd, c)}>Express Interest</button>
                  <button className="btn-secondary btn-sm" onClick={() => handleSave(activeJd, c)}>Shortlist</button>
                  <button type="button" onClick={() => handleNotFit(activeJd.id, c.id)}
                    style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '1.5px solid var(--grey-200)', background: 'white', color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Not a fit
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>{corporate.company_name}</h2>
          <div className="text-muted">{corporate.contact_person} · <span className="badge badge-teal">{corporate.subscription_tier?.toUpperCase()}</span></div>
        </div>
        <button type="button" onClick={() => {
          localStorage.removeItem('ssu_corporate')
          onNavigate('corporate-login')
        }} style={{
          background: 'none', border: '1.5px solid var(--grey-200)', borderRadius: 7,
          padding: '6px 12px', fontSize: 12, fontWeight: 600, color: 'var(--grey-400)',
          cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Log out
        </button>
      </div>

      <button className="btn-orange" style={{ marginBottom: 24 }} onClick={() => onNavigate('post-jd')}>+ Post a New Search</button>

      {loading ? <div className="spinner" /> : jds.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
          <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 16 }}>No active searches yet. Post your first search to start matching.</p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Active Searches</div>
          {jds.map(jd => {
            const matched = matches[jd.id] || []
            return (
              <div key={jd.id} className="card" style={{ marginBottom: 12 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15 }}>{jd.role_title}</h3>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {jd.stealth_mode && <span style={{ background: '#1f2937', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>🕵️ STEALTH</span>}
                    <span className="badge badge-green">Active</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 6 }}>{jd.function} · {jd.seniority_level}</div>
                {jd.end_date && <div style={{ fontSize: 11, color: 'var(--grey-400)', marginBottom: 10 }}>Valid till {new Date(jd.end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ background: 'var(--teal-pale)', borderRadius: 8, padding: '8px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{matched.length}</div>
                    <div style={{ fontSize: 11, color: 'var(--grey-600)' }}>Matched profiles</div>
                  </div>
                </div>
                <button className="btn-primary btn-sm" onClick={() => { setActiveJd(jd); loadInterests(jd.id) }}>View Matches →</button>
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}

// ── MATCHING LOGIC ───────────────────────────────────────
async function matchCandidates(jd, corporate) {
  const { data: candidates } = await supabase.from('candidates').select('*').eq('is_active', true)
  if (!candidates) return []

  return candidates.filter(c => {
    // Block check — don't show if corporate is in blocked list
    if (c.blocked_companies?.some(b => b.toLowerCase().includes(corporate.company_name.toLowerCase()))) return false

    // Gender preference filter
    if (jd.gender_preference && jd.gender_preference !== 'No preference — open to all') {
      const needsWomen = jd.gender_preference.toLowerCase().includes('women')
      const needsMen = jd.gender_preference.toLowerCase().includes('men')
      if (needsWomen && c.gender !== 'Female') return false
      if (needsMen && c.gender !== 'Male') return false
    }

    // Notice period filter
    if (jd.max_notice_period && jd.max_notice_period !== 'No restriction' && c.notice_period) {
      const noticeOrder = ['Immediate', 'Up to 30 days', '30 to 60 days', '60 to 90 days', 'More than 90 days']
      const maxIdx = noticeOrder.indexOf(jd.max_notice_period)
      const candidateIdx = noticeOrder.indexOf(c.notice_period)
      if (maxIdx >= 0 && candidateIdx > maxIdx) return false
    }

    // Minimum years in function filter
    if (jd.min_years_in_function && c.years_in_function) {
      if (c.years_in_function < parseInt(jd.min_years_in_function)) return false
    }

    // Languages filter — candidate must know all required languages
    if (jd.languages_required?.length > 0 && c.languages?.length > 0) {
      const hasAll = jd.languages_required.every(lang => c.languages.includes(lang))
      if (!hasAll) return false
    }

    // CTC filter — candidate min expected must be within corporate budget
    if (jd.ctc_fixed_max && c.min_expected_ctc) {
      if (c.min_expected_ctc > parseFloat(jd.ctc_fixed_max) * 1.2) return false
    }

    // Location filter
    if (jd.location && c.preferred_locations?.cities?.length > 0) {
      const NCR = ['Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad']
      const candidateCities = c.preferred_locations.cities
      const openToNearby = c.preferred_locations.openToNearby
      const isSpecialLocation = ['Pan-India / National Role', 'Remote / Work from Home', 'Flexible / Any Location'].includes(jd.location)
      if (!isSpecialLocation) {
        const candidateWantsAny = candidateCities.includes('Pan-India / National Role') || candidateCities.includes('Flexible / Any Location') || candidateCities.includes('Remote / Work from Home')
        const directMatch = candidateCities.includes(jd.location)
        const ncrMatch = NCR.includes(jd.location) && openToNearby && NCR.some(city => candidateCities.includes(city))
        if (!candidateWantsAny && !directMatch && !ncrMatch) return false
      }
    }

    let score = 0

    // Function match (high weight)
    if (c.primary_function === jd.function) score += 30

    // Seniority match (high weight)
    if (jd.seniority_level && c.seniority_open_to?.some(s => s.includes(jd.seniority_level?.split(' ')[0]))) score += 25

    // Industry match (current or previous)
    if (jd.industry) {
      if (c.current_industry === jd.industry) score += 20
      else if (c.previous_industries?.includes(jd.industry)) score += 10
    }

    // Employment type
    if (jd.employment_type && c.desired_employment_type?.some(d => d.toLowerCase().includes(jd.employment_type.toLowerCase().split('/')[0].trim()))) score += 15

    // Org type
    if (jd.org_type && c.org_type_open_to?.some(o => o.toLowerCase().includes(jd.org_type.toLowerCase().split('—')[0].trim()))) score += 10

    // Skills overlap
    const mustHave = jd.must_have_skills || []
    const skillOverlap = mustHave.filter(s => c.skill_keywords?.includes(s)).length
    score += skillOverlap * 8

    // Minimum threshold to show
    return score >= 25
  }).sort((a, b) => {
    // Sort by match quality
    const scoreA = calcScore(a, jd, corporate)
    const scoreB = calcScore(b, jd, corporate)
    return scoreB - scoreA
  })
}

function calcScore(c, jd, corporate) {
  let score = 0
  if (c.primary_function === jd.function) score += 30
  if (jd.seniority_level && c.seniority_open_to?.some(s => s.includes(jd.seniority_level?.split(' ')[0]))) score += 25
  if (jd.industry && (c.current_industry === jd.industry || c.previous_industries?.includes(jd.industry))) score += 15
  const skillOverlap = (jd.must_have_skills || []).filter(s => c.skill_keywords?.includes(s)).length
  score += skillOverlap * 8
  return score
}
