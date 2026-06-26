import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function EditProfile({ onNavigate }) {
  const [contact, setContact] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [step, setStep] = useState(0)
  const [candidate, setCandidate] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError('Enter your registered phone or email'); return }
    setLoading(true); setError('')
    const { data } = await supabase.from('candidates').select('*').eq('contact', contact.trim()).single()
    if (!data) { setError('No profile found with this contact. Please register first.'); setLoading(false); return }
    setCandidate(data)
    setTimeout(() => { setLoading(false); setStep(1) }, 600)
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    setTimeout(() => { setLoading(false); setStep(2) }, 500)
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`eotp-${idx + 1}`)?.focus()
  }

  const handleSave = async () => {
    setLoading(true)
    const { error: err } = await supabase.from('candidates').update({
      job_search_status: candidate.job_search_status,
      blocked_companies: candidate.blocked_companies,
      work_preference: candidate.work_preference,
      relocation: candidate.relocation,
      is_active: candidate.is_active
    }).eq('id', candidate.id)
    if (err) { setError(err.message); setLoading(false); return }
    setSaved(true); setLoading(false)
  }

  const set = (k, v) => setCandidate(c => ({ ...c, [k]: v }))

  if (saved) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32"><polyline points="20 6 9 17 4 12" /></svg></div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>Profile Updated</h2>
      <p style={{ color: 'var(--grey-600)', marginBottom: 24 }}>Your changes are live on StealthSideUp.</p>
      <button className="btn-secondary" onClick={() => onNavigate('home')}>Back to Home</button>
    </div>
  )

  if (step === 0) return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 8 }}>Edit My Profile</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 24 }}>Enter the phone or email you registered with. We'll send you an OTP to verify.</p>
      <div className="form-group">
        <label className="form-label">Registered Phone / Email</label>
        <input className="form-input" placeholder="+91 98765 43210 or you@email.com" value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>{loading ? 'Looking up profile...' : 'Send OTP →'}</button>
      <div className="mt-4"><button className="btn-secondary" onClick={() => onNavigate('home')}>← Back</button></div>
    </div>
  )

  if (step === 1) return (
    <div className="page">
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Verify OTP</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>Enter the 6-digit code sent to {contact}</p>
      <div className="otp-container">
        {otp.map((d, i) => (
          <input key={i} id={`eotp-${i}`} className="otp-input" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`eotp-${i-1}`)?.focus() }} />
        ))}
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>{loading ? 'Verifying...' : 'Verify →'}</button>
    </div>
  )

  if (step === 2 && candidate) return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>Your Profile</h2>
      <p className="text-muted" style={{ marginBottom: 20 }}>Update your preferences below</p>

      <div className="card card-teal" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--teal)', marginBottom: 6, textTransform: 'uppercase' }}>Current Profile</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <div><strong>Function:</strong> {candidate.primary_function}</div>
          <div><strong>Experience:</strong> {candidate.years_experience} years</div>
          <div><strong>Industry:</strong> {candidate.current_industry}</div>
          <div><strong>CTC:</strong> {candidate.ctc_total ? `₹${candidate.ctc_total}L` : '—'}</div>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Job Search Status</label>
        <div className="tag-cloud">
          {['Actively looking (want to move within 0–3 months)','Passively open (the right role would make me consider moving)','Just exploring (not in a hurry, happy where I am)'].map(s => (
            <button key={s} type="button" className={`tag ${candidate.job_search_status === s ? 'selected' : ''}`} onClick={() => set('job_search_status', s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Work Preference</label>
        <div className="tag-cloud">
          {['On-site','Hybrid','Remote','Flexible'].map(s => (
            <button key={s} type="button" className={`tag ${candidate.work_preference === s ? 'selected' : ''}`} onClick={() => set('work_preference', s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Companies to Block</label>
        <textarea className="form-textarea" style={{ minHeight: 70 }}
          placeholder="Company names, comma separated"
          value={Array.isArray(candidate.blocked_companies) ? candidate.blocked_companies.join(', ') : candidate.blocked_companies || ''}
          onChange={e => set('blocked_companies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} />
      </div>

      <div className="form-group">
        <label className="form-label">Profile Active?</label>
        <div className="tag-cloud">
          <button type="button" className={`tag ${candidate.is_active ? 'selected' : ''}`} onClick={() => set('is_active', true)}>✓ Active — show my profile</button>
          <button type="button" className={`tag ${!candidate.is_active ? 'selected' : ''}`} onClick={() => set('is_active', false)}>Pause my profile</button>
        </div>
        <div className="form-hint">Pausing hides your profile from all matches until you reactivate</div>
      </div>

      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes →'}</button>
    </div>
  )

  return null
}
