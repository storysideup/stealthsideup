import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function CandidateProfile({ onNavigate }) {
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ssu_candidate')
      return saved ? 2 : 0
    } catch { return 0 }
  })
  const [contact, setContact] = useState(() => {
    try { return sessionStorage.getItem('ssu_candidate_contact') || '' } catch { return '' }
  })
  const [otp, setOtp] = useState(['','','','','',''])
  const [candidate, setCandidate] = useState(() => {
    try {
      const saved = sessionStorage.getItem('ssu_candidate')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [interests, setInterests] = useState([])
  const [decliningInterest, setDecliningInterest] = useState(null)
  const [declineReasons, setDeclineReasons] = useState([])
  const [declineOther, setDeclineOther] = useState('')
  const [acceptingInterest, setAcceptingInterest] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [candidateNote, setCandidateNote] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError('Enter your registered phone number'); return }
    setLoading(true); setError('')
    const { data } = await supabase.from('candidates').select('*').eq('contact', contact.trim()).single()
    if (!data) { setError('No profile found with this number. Please register first.'); setLoading(false); return }
    setCandidate(data)
    setTimeout(() => { setLoading(false); setStep(1) }, 600)
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true)
    // Load interests for this candidate
    const { data: interestData } = await supabase
      .from('interests')
      .select('*, jds(*), corporates(*)')
      .eq('candidate_id', candidate.id)
      .order('created_at', { ascending: false })
    setInterests(interestData || [])
    // Save session so Edit Profile doesn't ask for OTP again
    try {
      sessionStorage.setItem('ssu_candidate', JSON.stringify(data))
      sessionStorage.setItem('ssu_candidate_contact', contact)
    } catch {}
    setTimeout(() => { setLoading(false); setStep(2) }, 500)
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`potp-${idx + 1}`)?.focus()
  }

  const handleRespond = async (interestId, response) => {
    if (response === 'not_interested') {
      setDecliningInterest(interestId)
      return
    }
    if (response === 'interested') {
      setAcceptingInterest(interestId)
      return
    }
    setLoading(true)
    await supabase.from('interests').update({
      status: response,
      candidate_response_at: new Date().toISOString()
    }).eq('id', interestId)
    const { data } = await supabase.from('interests').select('*, jds(*), corporates(*)').eq('candidate_id', candidate.id).order('created_at', { ascending: false })
    setInterests(data || [])
    setLoading(false)
  }

  const handleDeclineSubmit = async () => {
    setLoading(true)
    const reasons = declineOther ? [...declineReasons, 'Other: ' + declineOther] : declineReasons
    await supabase.from('interests').update({
      status: 'not_interested',
      candidate_response_at: new Date().toISOString(),
      decline_reasons: reasons
    }).eq('id', decliningInterest)
    setDecliningInterest(null)
    setDeclineReasons([])
    setDeclineOther('')
    const { data } = await supabase.from('interests').select('*, jds(*), corporates(*)').eq('candidate_id', candidate.id).order('created_at', { ascending: false })
    setInterests(data || [])
    setLoading(false)
  }

  const toggleDeclineReason = (reason) => {
    setDeclineReasons(prev => prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason])
  }

  const handleSendCV = async () => {
    if (!cvFile) { setSendError('Please upload your CV to proceed'); return }
    setSending(true); setSendError('')
    try {
      const interest = interests.find(i => i.id === acceptingInterest)
      const recruiterEmail = interest?.jds?.recruiter_email

      // Convert CV to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(cvFile)
      })

      // Send via our API
      const response = await fetch('/api/send-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recruiterEmail,
          candidateProfile: {
            id: candidate.id,
            headline: candidate.headline,
            years_experience: candidate.years_experience,
            primary_function: candidate.primary_function,
            current_industry: candidate.current_industry,
            ctc_total: candidate.ctc_total,
            notice_period: candidate.notice_period,
          },
          jd: { title: interest?.jds?.role_title, function: interest?.jds?.function },
          company: interest?.jds?.stealth_mode ? 'Confidential' : interest?.corporates?.company_name,
          note: candidateNote,
          cvBase64: base64,
          cvName: cvFile.name,
          contactShared: candidate.contact
        })
      })

      if (!response.ok) throw new Error('Failed to send')

      // Update interest status
      await supabase.from('interests').update({
        status: 'cv_sent',
        candidate_response_at: new Date().toISOString(),
        candidate_contact_shared: candidate.contact,
        candidate_message: candidateNote
      }).eq('id', acceptingInterest)

      setAcceptingInterest(null)
      setCvFile(null)
      setCandidateNote('')
      const { data } = await supabase.from('interests').select('*, jds(*), corporates(*)').eq('candidate_id', candidate.id).order('created_at', { ascending: false })
      setInterests(data || [])
    } catch (e) {
      setSendError('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  const handleToggleActive = async () => {
    const newStatus = !candidate.is_active
    await supabase.from('candidates').update({ is_active: newStatus }).eq('id', candidate.id)
    setCandidate(c => ({ ...c, is_active: newStatus }))
  }

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('ssu_candidate')
      sessionStorage.removeItem('ssu_candidate_contact')
    } catch {}
    setStep(0); setCandidate(null); setInterests([])
  }

  const statusBadge = (status, interest) => {
    const map = {
      'notified': { label: 'Awaiting your response', cls: 'badge-yellow' },
      'cv_pending': { label: 'CV due — 48hrs', cls: 'badge-yellow' },
      'cv_sent': { label: 'CV Sent ✓', cls: 'badge-green' },
      'interested': { label: 'You said Yes', cls: 'badge-green' },
      'not_interested': { label: 'You declined', cls: 'badge-grey' },
      'saved': { label: 'Saved by company', cls: 'badge-teal' },
      'no_response': { label: 'No response', cls: 'badge-grey' },
    }
    const s = map[status] || { label: status, cls: 'badge-grey' }
    return <span className={`badge ${s.cls}`}>{s.label}</span>
  }

  const getDeadlineHours = (interest) => {
    if (interest.status !== 'cv_pending' || !interest.candidate_response_at) return null
    const yesAt = new Date(interest.candidate_response_at)
    const deadline = new Date(yesAt.getTime() + 48 * 60 * 60 * 1000)
    const hoursLeft = Math.max(0, Math.floor((deadline - new Date()) / (1000 * 60 * 60)))
    return hoursLeft
  }

  // Step 0 — Enter contact
  if (step === 0) return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>My Profile</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
        Enter your registered WhatsApp number to view your profile, see matched roles, and manage your responses.
      </p>
      <div className="form-group">
        <label className="form-label">Registered WhatsApp Number</label>
        <input className="form-input" type="tel" placeholder="+91 98765 43210"
          value={contact} onChange={e => setContact(e.target.value)} />
      </div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleSendOtp} disabled={loading}>
        {loading ? 'Looking up your profile...' : 'Send OTP →'}
      </button>
      <div className="mt-4">
        <button className="btn-secondary" onClick={() => onNavigate('register')}>
          New here? Register →
        </button>
      </div>
    </div>
  )

  // Step 1 — OTP
  if (step === 1) return (
    <div className="page">
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Verify OTP</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>Enter the 6-digit code sent to {contact}</p>
      <div className="otp-container">
        {otp.map((d, i) => (
          <input key={i} id={`potp-${i}`} className="otp-input" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`potp-${i-1}`)?.focus() }} />
        ))}
      </div>
      <div className="form-hint" style={{ textAlign: 'center', marginBottom: 20 }}>(For demo — enter any 6 digits)</div>
      {error && <div className="error-msg">{error}</div>}
      <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>
        {loading ? 'Verifying...' : 'View My Profile →'}
      </button>
    </div>
  )

  // Step 2 — Dashboard
  if (step === 2 && candidate) {
    const activeInterests = interests.filter(i => i.status === 'notified')
    const respondedInterests = interests.filter(i => i.status !== 'notified' && i.status !== 'saved')
    const savedInterests = interests.filter(i => i.status === 'saved')

    const currentInterest = decliningInterest ? interests.find(i => i.id === decliningInterest) : null
    const isStealthDecline = currentInterest?.jds?.stealth_mode

    const DECLINE_REASONS_BASE = [
      'Compensation seems below my expectations',
      'Role seniority does not feel right for where I am',
      'Industry does not match what I am looking for',
      'Location does not work for me',
      'Not ready to make a move right now',
      'Already in conversations elsewhere',
      'Not the right time personally',
      'Need more information before deciding',
    ]
    const DECLINE_REASONS_NON_STEALTH = [
      'Heard mixed things about this company work culture',
      'Not interested in this company',
    ]
    const allDeclineReasons = isStealthDecline ? DECLINE_REASONS_BASE : [...DECLINE_REASONS_BASE, ...DECLINE_REASONS_NON_STEALTH]

    // YES FLOW — CV upload screen
    const acceptingInterestData = acceptingInterest ? interests.find(i => i.id === acceptingInterest) : null
    if (acceptingInterest && acceptingInterestData) return (
      <div className="page">
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Send Your CV</h2>
        <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 12 }}>
          You are expressing interest in a role at <strong style={{ color: 'var(--teal)' }}>
            {acceptingInterestData.jds?.stealth_mode ? 'a confidential company' : (acceptingInterestData.corporates?.company_name || 'this company')}
          </strong>.
        </p>
        <div style={{ background: '#fff8f0', border: '1.5px solid var(--orange-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⏰</span>
          <div style={{ fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--orange)' }}>You have 48 hours</strong> to upload and send your CV. After that this opportunity will expire and the match will be closed.
          </div>
        </div>

        {/* CV Upload */}
        <div className="form-group">
          <label className="form-label">Your CV <span className="required">*</span></label>
          <label style={{
            display: 'block', border: cvFile ? '2px solid var(--teal)' : '2px dashed var(--grey-300)',
            borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer',
            background: cvFile ? 'var(--teal-light)' : 'white'
          }}>
            <input type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
            {cvFile ? (
              <div>
                <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>{cvFile.name}</div>
                <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 4 }}>Tap to change</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>Tap to upload your CV</div>
                <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>PDF or Word · Max 5MB</div>
              </div>
            )}
          </label>
        </div>

        {/* Optional note */}
        <div className="form-group">
          <label className="form-label">A note for the recruiter (optional)</label>
          <textarea className="form-textarea" style={{ minHeight: 70 }} maxLength={150}
            placeholder="Why are you interested in this role? 150 chars max."
            value={candidateNote} onChange={e => setCandidateNote(e.target.value)} />
          <div className="form-hint" style={{ textAlign: 'right' }}>{candidateNote.length}/150</div>
        </div>

        <div className="card" style={{ background: 'var(--orange-light)', borderColor: 'var(--orange-border)', marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.6 }}>
            📧 Your CV and contact details will be sent directly to the recruiter. StorySideUp will also receive a copy to support your introduction.
          </div>
        </div>

        {sendError && <div className="error-msg">{sendError}</div>}

        <button className="btn-primary" onClick={handleSendCV} disabled={sending || !cvFile}>
          {sending ? 'Sending...' : 'Send CV & Express Interest →'}
        </button>
        <div className="mt-4">
          <button className="btn-secondary" onClick={() => { setAcceptingInterest(null); setCvFile(null); setCandidateNote('') }}>← Back</button>
        </div>
      </div>
    )

    if (decliningInterest) return (
      <div className="page">
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Help us understand</h2>
        <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 20 }}>
          Your feedback is completely anonymous and never shared with the company. It helps us improve matches for you and others.
        </p>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Why are you not taking this forward? <span style={{ color: 'var(--grey-400)', fontWeight: 400, textTransform: 'none' }}>(select all that apply)</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {allDeclineReasons.map(reason => (
            <button key={reason} type="button"
              onClick={() => toggleDeclineReason(reason)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                border: declineReasons.includes(reason) ? '2px solid var(--teal)' : '1.5px solid var(--grey-200)',
                borderRadius: 8, background: declineReasons.includes(reason) ? 'var(--teal-light)' : 'white',
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
              }}>
              <div style={{
                width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                border: declineReasons.includes(reason) ? '5px solid var(--teal)' : '2px solid var(--grey-300)',
                background: 'white'
              }} />
              <span style={{ fontSize: 13, color: declineReasons.includes(reason) ? 'var(--teal)' : 'var(--grey-800)', fontWeight: declineReasons.includes(reason) ? 600 : 400 }}>{reason}</span>
            </button>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Other reason</label>
          <input className="form-input" placeholder="Tell us more (optional)..."
            value={declineOther} onChange={e => setDeclineOther(e.target.value)} />
        </div>
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.6, margin: 0 }}>
            💡 Not sure about this role but open to guidance? StorySideUp offers personalised career support — coaching, search assistance, and role advisory. We can help you find what you are actually looking for.
          </p>
        </div>
        <button className="btn-primary" onClick={handleDeclineSubmit} disabled={loading || (declineReasons.length === 0 && !declineOther)}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
        <div className="mt-4">
          <button className="btn-secondary" onClick={() => { setDecliningInterest(null); setDeclineReasons([]) }}>Cancel</button>
        </div>
      </div>
    )

    return (
      <div className="page">
        {/* Profile header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>My Profile</h2>
            <div style={{ fontSize: 13, color: 'var(--grey-400)' }}>SSU-{candidate.id.slice(0,8).toUpperCase()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--grey-400)', marginBottom: 4 }}>Profile status</div>
            <button type="button" onClick={handleToggleActive} style={{
              padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 12, fontWeight: 700,
              background: candidate.is_active ? 'var(--teal-light)' : 'var(--grey-100)',
              color: candidate.is_active ? 'var(--teal)' : 'var(--grey-400)'
            }}>
              {candidate.is_active ? '● Active' : '○ Paused'}
            </button>
          </div>
        </div>

        {/* Profile summary */}
        <div className="card card-teal" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Your Anonymous Profile</div>
          {[
            { label: 'Function', value: candidate.primary_function },
            { label: 'Experience', value: candidate.years_experience ? candidate.years_experience + ' years' : '—' },
            { label: 'Current Industry', value: candidate.current_industry || candidate.freelance_sector || '—' },
            { label: 'Current CTC', value: candidate.ctc_total ? '₹' + candidate.ctc_total + 'L' : '—' },
            { label: 'Job Status', value: candidate.job_search_status || '—' },
            { label: 'Skills', value: candidate.skill_tree?.length ? candidate.skill_tree.length + ' area' + (candidate.skill_tree.length > 1 ? 's' : '') : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--teal-border)', fontSize: 13 }}>
              <span style={{ color: 'var(--grey-600)' }}>{label}</span>
              <span style={{ fontWeight: 600, color: 'var(--grey-800)', maxWidth: '60%', textAlign: 'right' }}>{value}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 13, fontStyle: 'italic', color: 'var(--grey-600)', lineHeight: 1.5 }}>
            "{candidate.headline || 'No headline added'}"
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { label: 'Matched', value: interests.length, color: 'var(--teal)' },
            { label: 'Awaiting', value: activeInterests.length, color: 'var(--orange)' },
            { label: 'Said Yes', value: interests.filter(i => i.status === 'interested').length, color: '#065f46' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, background: 'var(--grey-50)', border: '1px solid var(--grey-200)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Roles awaiting response */}
        {activeInterests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Awaiting Your Response ({activeInterests.length})
            </div>
            {activeInterests.map(interest => (
              <div key={interest.id} className="card" style={{ borderColor: '#f5c4a3', marginBottom: 10 }}>
                <div className="flex-between" style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)' }}>
                    {interest.jds?.stealth_mode ? (
                      <span>A company in <strong>{interest.jds?.industry || interest.corporates?.industry || 'your sector'}</strong></span>
                    ) : (
                      <span>{interest.corporates?.company_name || 'A company'}</span>
                    )}
                  </div>
                  {statusBadge(interest.status)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 4 }}>
                  {interest.jds?.seniority_level} · {interest.jds?.function}
                </div>
                {interest.jds?.location && (
                  <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 4 }}>📍 {interest.jds?.location}</div>
                )}
                {(interest.jds?.ctc_fixed_min || interest.jds?.ctc_fixed_max) && (
                  <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 10 }}>
                    💰 ₹{interest.jds?.ctc_fixed_min}L – ₹{interest.jds?.ctc_fixed_max}L fixed
                    {interest.jds?.ctc_variable ? ' + ' + interest.jds?.ctc_variable : ''}
                  </div>
                )}
                {interest.jds?.role_context && (
                  <div style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.6, marginBottom: 12, padding: '8px 10px', background: 'var(--grey-50)', borderRadius: 6 }}>
                    {interest.jds?.role_context}
                  </div>
                )}
                {interest.jds?.stealth_mode && (
                  <div style={{ fontSize: 12, color: 'var(--grey-600)', background: '#f3f4f6', borderRadius: 6, padding: '8px 10px', marginBottom: 12 }}>
                    🕵️ This company posted in stealth mode. If you say yes, their name will be revealed to you — and only then will you decide whether to share your contact.
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary btn-sm" onClick={async () => {
                    // Mark as cv_pending first
                    await supabase.from('interests').update({
                      status: 'cv_pending',
                      candidate_response_at: new Date().toISOString()
                    }).eq('id', interest.id)
                    handleRespond(interest.id, 'interested')
                  }}>
                    Yes, I'm interested
                  </button>
                  <button className="btn-secondary btn-sm" onClick={() => handleRespond(interest.id, 'not_interested')}>
                    Not for me
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past responses */}
        {respondedInterests.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Past Responses ({respondedInterests.length})
            </div>
            {respondedInterests.map(interest => (
              <div key={interest.id} className="card" style={{ marginBottom: 8 }}>
                <div className="flex-between" style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--grey-800)' }}>
                    {interest.jds?.stealth_mode ? 'Confidential Company' : (interest.corporates?.company_name || 'A company')}
                  </div>
                  {statusBadge(interest.status)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--grey-400)' }}>
                  {interest.jds?.seniority_level} · {interest.jds?.function}
                  {interest.jds?.location ? ' · ' + interest.jds?.location : ''}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No activity yet */}
        {interests.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 700, color: 'var(--grey-800)', marginBottom: 6 }}>No matches yet</div>
            <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.6 }}>
              Your profile is active and being matched against live JDs. When a company expresses interest, it will appear here along with a WhatsApp notification.
            </p>
          </div>
        )}

        {/* Edit profile link */}
        <div className="divider" />
        <button className="btn-secondary" onClick={() => onNavigate('edit-profile')}>
          Edit My Profile
        </button>
      </div>
    )
  }

  return null
}
