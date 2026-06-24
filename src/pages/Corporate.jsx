import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { FUNCTIONS, INDUSTRIES, SKILLS_BY_FUNCTION, SENIORITY_LEVELS, ORG_TYPES } from '../data/formData'
import SkillTreeSelector from '../components/SkillTreeSelector'
import { CityPicker } from '../components/LocationPicker'

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
    stealth_mode: false, job_function: '', end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [jdText, setJdText] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extracted, setExtracted] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const skillOptions = form.job_function && SKILLS_BY_FUNCTION[form.job_function] ? SKILLS_BY_FUNCTION[form.job_function] : []

  const handleExtractJD = async () => {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setExtractError('Please paste a more detailed JD — at least a few sentences'); return
    }
    setExtracting(true); setExtractError('')
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Extract structured information from this job description. Return ONLY a JSON object with these exact keys, no markdown, no explanation:
{
  "role_title": "exact job title",
  "job_function": "one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Procurement & Sourcing, Design & Creative, Technology & Product, Legal & Compliance, Strategy & Consulting, General Management / P&L, Administration & Facilities, Production & Manufacturing, Engineering (Civil / Mechanical / Electrical), Research & Development, Customer Success & Service, Content & Editorial, Training & Facilitation, Investor Relations & Corporate Finance, Import / Export & International Trade",
  "seniority_level": "one of: Junior (0-5 yrs, individual contributor), Mid (5-12 yrs, may lead small teams), Senior (12-20 yrs, leads functions or large teams), Leadership (20+ yrs, CXO / functional head)",
  "role_type": "Individual Contributor or Team Manager",
  "role_context": "2-3 sentences describing what this person will own and what success looks like — max 300 characters",
  "why_role": "1-2 sentences on why this is an exciting opportunity — max 200 characters",
  "employment_type": "Full-time or Freelance / Contract or Fractional"
}

JD text:
${jdText}`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setForm(f => ({
        ...f,
        role_title: parsed.role_title || f.role_title,
        job_function: parsed.job_function || f.job_function,
        seniority_level: parsed.seniority_level || f.seniority_level,
        role_type: parsed.role_type || f.role_type,
        role_context: parsed.role_context || f.role_context,
        why_role: parsed.why_role || f.why_role,
        employment_type: parsed.employment_type || f.employment_type,
      }))
      setExtracted(true)
    } catch (e) {
      setExtractError('Could not extract details. Please fill the form manually or try again.')
    }
    setExtracting(false)
  }

  const handleSubmit = async () => {
    if (!form.role_title || !form.job_function || !form.seniority_level) {
      setError('Role title, function and seniority level are required'); return
    }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('jds').insert({ ...form, function: form.job_function, corporate_id: corporate.id, is_active: true })
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
          <div style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 10, lineHeight: 1.6 }}>
            Paste your job description below — we will extract the role title, function, seniority, context and more automatically. You can review and edit everything after.
          </div>
          <textarea
            style={{ width: '100%', border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: '10px 12px', fontSize: 13, fontFamily: 'inherit', minHeight: 100, outline: 'none', resize: 'vertical', marginBottom: 10 }}
            placeholder="Paste your JD here..."
            value={jdText}
            onChange={e => setJdText(e.target.value)}
          />
          {extractError && <div className="error-msg" style={{ marginBottom: 8 }}>{extractError}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-primary btn-sm" onClick={handleExtractJD} disabled={extracting}>
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
        <label className="form-label">Role Title <span className="required">*</span></label>
        <input className="form-input" placeholder="e.g. Head of Sales — West India" value={form.role_title} onChange={e => set('role_title', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Function <span className="required">*</span></label>
        <select className="form-select" value={form.job_function} onChange={e => { set('job_function', e.target.value); set('must_have_skills', []); set('good_to_have_skills', []); set('skill_tree_requirement', []) }}>
          <option value="">Select function...</option>
          {FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Industry Hiring For</label>
        <select className="form-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
          <option value="">Select industry...</option>
          {INDUSTRIES.flatMap(g => g.items).map(i => <option key={i} value={i}>{i}</option>)}
        </select>
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

      {/* END DATE */}
      <div className="form-group">
        <label className="form-label">Search Valid Till <span className="required">*</span></label>
        <input className="form-input" type="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.end_date}
          onChange={e => set('end_date', e.target.value)} />
        <div className="form-hint">After this date the search closes automatically and no new candidates are matched. Default is 10 days — adjust as needed for your timeline.</div>
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
    alert('Profile saved to your shortlist.')
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
              <div key={c.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span className="badge badge-teal">SSU-{String(i + 1001).padStart(4, '0')}</span>
                    {c.job_search_status?.includes('Actively') && <span className="badge badge-green" style={{ marginLeft: 6 }}>Active</span>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>{c.ctc_total ? `₹${c.ctc_total}L` : '—'}</span>
                </div>
                <p style={{ fontSize: 14, fontStyle: 'italic', color: 'var(--grey-600)', lineHeight: 1.5, marginBottom: 10 }}>"{c.headline}"</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {c.years_experience && <span className="badge badge-grey">{c.years_experience} yrs</span>}
                  {c.current_industry && <span className="badge badge-grey">{c.current_industry}</span>}
                  {c.role_type && <span className="badge badge-grey">{c.role_type}</span>}
                  {c.team_size && <span className="badge badge-grey">Team: {c.team_size}</span>}
                  {c.work_preference && <span className="badge badge-grey">{c.work_preference}</span>}
                </div>
                {c.skill_keywords?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                    {c.skill_keywords.slice(0, 5).map(s => <span key={s} className="badge badge-teal">{s}</span>)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary btn-sm" onClick={() => handleExpressInterest(activeJd, c)}>Express Interest</button>
                  <button className="btn-secondary btn-sm" onClick={() => handleSave(activeJd, c)}>Save</button>
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
