import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendMatchNotification, sendLowTokenAlert, sendCorporateWelcome } from '../lib/whatsapp'
import { sendCorporateWelcomeEmail, sendLowTokenAlertEmail, sendPasswordResetEmail } from '../lib/email'

async function hashPasswordServer(password) {
  const res = await fetch('/api/corporate-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'hash', password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not process password')
  return data.hash
}

async function verifyPasswordServer(password, hash) {
  const res = await fetch('/api/corporate-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'verify', password, hash })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Could not verify password')
  return data // { valid, needsRehash, newHash? }
}
import { FUNCTIONS, INDUSTRIES, SKILLS_BY_FUNCTION, SENIORITY_LEVELS, ORG_TYPES, NOTICE_PERIODS, LANGUAGES, NCR_CITIES, MUMBAI_REGION } from '../data/formData'
import mammoth from 'mammoth'
import { lakhsToWordsDisplay } from '../lib/numberToWords'
import { logExtractionFailure } from '../lib/logExtractionFailure'
import SkillsTable from '../components/SkillsTable'
import { CityPicker } from '../components/LocationPicker'
import { CareerHistoryDisplay } from '../components/CareerHistory'
import LegalModal from '../components/LegalModal'

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase()
}

function generateResetToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── CORPORATE LOGIN ──────────────────────────────────────
export function CorporateLogin({ onNavigate, onCorporateLogin }) {
  const inviteCode = new URLSearchParams(window.location.search).get('invite')
  const resetToken = new URLSearchParams(window.location.search).get('reset')
  const [mode, setMode] = useState(inviteCode ? 'join' : resetToken ? 'reset' : 'login') // login | register | join | reset
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [form, setForm] = useState({ company_name: '', industry: '', company_type: '', gstin: '', contact_person: '', designation: '', privacy_consent_agreed: false })
  const [showLegal, setShowLegal] = useState(null) // null | 'privacy' | 'terms'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inviteTeam, setInviteTeam] = useState(null) // the root corporate this invite belongs to
  const [inviteLoading, setInviteLoading] = useState(!!inviteCode)

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)
  const [resetTokenValid, setResetTokenValid] = useState(resetToken ? null : false) // null = checking, false = invalid/none, true = valid
  const [resetCorporateId, setResetCorporateId] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    if (!resetToken) return
    supabase.from('corporates').select('id, reset_token_expiry').eq('reset_token', resetToken).single()
      .then(({ data }) => {
        const valid = !!data && new Date(data.reset_token_expiry) > new Date()
        setResetTokenValid(valid)
        if (valid) setResetCorporateId(data.id)
      })
  }, [resetToken])

  useEffect(() => {
    if (!inviteCode) return
    supabase.from('corporates').select('id, company_name').eq('invite_code', inviteCode).single()
      .then(({ data }) => {
        setInviteTeam(data || false) // false = invalid code, distinct from null (still loading)
        setInviteLoading(false)
      })
  }, [inviteCode])

  const handleRequestReset = async () => {
    if (!forgotEmail.trim()) { setError('Enter your registered email'); return }
    setLoading(true); setError('')
    const { data } = await supabase.from('corporates').select('id').eq('work_email', forgotEmail.trim().toLowerCase()).single()
    if (data) {
      const token = generateResetToken()
      const expiry = new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      await supabase.from('corporates').update({ reset_token: token, reset_token_expiry: expiry }).eq('id', data.id)
      const resetLink = `${window.location.origin}/?reset=${token}`
      sendPasswordResetEmail(forgotEmail.trim(), resetLink).catch(e => console.error('Reset email failed:', e))
    }
    // Same message whether or not the email exists — avoids revealing which emails are registered
    setForgotSent(true)
    setLoading(false)
  }

  const handleSetNewPassword = async () => {
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    let hashedPassword
    try { hashedPassword = await hashPasswordServer(newPassword) }
    catch (e) { setError('Something went wrong processing your password. Please try again.'); setLoading(false); return }
    const { error: err } = await supabase.from('corporates').update({
      password_hash: hashedPassword,
      reset_token: null, reset_token_expiry: null
    }).eq('id', resetCorporateId)
    if (err) { setError('Something went wrong. Please try again.'); setLoading(false); return }
    setLoading(false)
    alert('Password updated! Please login with your new password.')
    window.history.replaceState({}, '', window.location.pathname)
    setMode('login')
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Resolves a logged-in row to the "effective" corporate object the rest of the app should use —
  // team members' tokens, JDs, and matches all live under the root/admin account, not their own row.
  const resolveEffectiveCorporate = async (data) => {
    if (!data.parent_corporate_id) {
      // Root account — ensure it has an invite code (older accounts created before this feature won't)
      if (!data.invite_code) {
        const code = generateInviteCode()
        await supabase.from('corporates').update({ invite_code: code }).eq('id', data.id)
        return { ...data, invite_code: code }
      }
      return data
    }
    const { data: root } = await supabase.from('corporates').select('*').eq('id', data.parent_corporate_id).single()
    if (!root) return data
    // Keep the logged-in person's own identity/contact details, but everything else
    // (tokens, company_name, invite_code) comes from the shared root account
    return { ...root, contact_person: data.contact_person, work_email: data.work_email, mobile: data.mobile, own_id: data.id, user_role: data.user_role }
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase.from('corporates').select('*').eq('work_email', email.trim().toLowerCase()).single()
    if (err || !data) { setError('Account not found. Please register first.'); setLoading(false); return }

    let verifyResult
    try {
      verifyResult = await verifyPasswordServer(password, data.password_hash)
    } catch (e) {
      setError('Something went wrong verifying your password. Please try again.'); setLoading(false); return
    }
    if (!verifyResult.valid) { setError('Incorrect password'); setLoading(false); return }

    // One-time, per-account migration: if this account still has the old hash format,
    // upgrade it to bcrypt now that we've confirmed the password is correct.
    if (verifyResult.needsRehash && verifyResult.newHash) {
      supabase.from('corporates').update({ password_hash: verifyResult.newHash }).eq('id', data.id)
        .then(() => {}, e => console.error('Password migration failed:', e))
    }

    const effective = await resolveEffectiveCorporate(data)
    onCorporateLogin(effective)
    onNavigate('corporate-dashboard')
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !form.company_name || !form.contact_person) {
      setError('Company name, your name, email and password are required'); return
    }
    const freeEmailDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com', 'icloud.com']
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (freeEmailDomains.includes(emailDomain)) {
      setError('Please use your company email address — not Gmail, Yahoo, Hotmail, or similar'); return
    }
    setLoading(true); setError('')
    let hashedPassword
    try { hashedPassword = await hashPasswordServer(password) }
    catch (e) { setError('Something went wrong processing your password. Please try again.'); setLoading(false); return }
    const { error: err } = await supabase.from('corporates').insert({
      ...form, work_email: email.trim().toLowerCase(), password_hash: hashedPassword, subscription_tier: 'free', is_active: true, tokens: 5, mobile: form.mobile || null,
      invite_code: generateInviteCode(), privacy_consent_at: new Date().toISOString()
    })
    if (err) { setError(err.message.includes('duplicate') ? 'This email is already registered.' : err.message); setLoading(false); return }

    if (form.mobile?.trim()) {
      sendCorporateWelcome(form.mobile, form.contact_person, 5).catch(e => console.error('Corporate welcome message failed:', e))
    } else {
      sendCorporateWelcomeEmail(email, form.contact_person, 5).catch(e => console.error('Corporate welcome email failed:', e))
    }

    setMode('login')
    setError('')
    alert('Account created! You have been given 5 free tokens. No card required. Please login.')
    setLoading(false)
  }

  const handleJoinTeam = async () => {
    if (!email || !password || !form.contact_person) {
      setError('Your name, email and password are required'); return
    }
    setLoading(true); setError('')
    let hashedPassword
    try { hashedPassword = await hashPasswordServer(password) }
    catch (e) { setError('Something went wrong processing your password. Please try again.'); setLoading(false); return }
    const { error: err } = await supabase.from('corporates').insert({
      contact_person: form.contact_person, mobile: form.mobile || null,
      work_email: email.trim().toLowerCase(), password_hash: hashedPassword,
      company_name: inviteTeam.company_name, parent_corporate_id: inviteTeam.id,
      user_role: 'recruiter', is_active: true, tokens: 0, privacy_consent_at: new Date().toISOString()
    })
    if (err) { setError(err.message.includes('duplicate') ? 'This email is already registered.' : err.message); setLoading(false); return }
    setMode('login')
    setError('')
    alert(`You've joined ${inviteTeam.company_name}'s team! Please login.`)
    setLoading(false)
  }

  if (inviteLoading) return <div className="page"><p style={{ color: 'var(--grey-400)' }}>Loading invite...</p></div>

  if (mode === 'join' && inviteTeam) {
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Join {inviteTeam.company_name}'s Team</h2>
        <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>You'll share your team's token pool and see all JDs and matches your teammates post.</p>

        <div className="form-group">
          <label className="form-label">Your Name <span className="required">*</span></label>
          <input className="form-input" placeholder="Full name" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Your WhatsApp Number <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span></label>
          <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.mobile || ''} onChange={e => set('mobile', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Work Email <span className="required">*</span></label>
          <input className="form-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Password <span className="required">*</span></label>
          <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.privacy_consent_agreed}
              onChange={e => set('privacy_consent_agreed', e.target.checked)}
              style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, accentColor: '#165D7B' }} />
            <span style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
              I have read and agree to StealthSideUp's{' '}
              <button type="button" onClick={() => setShowLegal('privacy')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                Privacy Policy
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => setShowLegal('terms')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                Terms of Service
              </button>
              , and I consent to data being processed as described.
            </span>
          </label>
        </div>

        <LegalModal doc={showLegal} onClose={() => setShowLegal(null)} />

        {error && (
          <div className="error-msg">
            {error}
            {error === 'This email is already registered.' && (
              <div style={{ marginTop: 10, display: 'flex', gap: 14 }}>
                <button type="button" onClick={() => { setMode('login'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Log in instead
                </button>
                <button type="button" onClick={() => { setForgotEmail(email); setMode('forgot'); setError('') }}
                  style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        )}

        <button className="btn-primary" onClick={handleJoinTeam} disabled={loading || !form.privacy_consent_agreed}>
          {loading ? 'Please wait...' : 'Join Team →'}
        </button>
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button type="button" onClick={() => { setMode('login'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--grey-500)', fontSize: 13, cursor: 'pointer', padding: 0 }}>
            Already have an account? <span style={{ color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline' }}>Log in</span>
          </button>
        </div>
        <div className="mt-4">
          <button className="btn-secondary" onClick={() => onNavigate('home')}>← Back to Home</button>
        </div>
      </div>
    )
  }

  if (mode === 'join' && inviteTeam === false) {
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Invite Link Invalid</h2>
        <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>This invite link is no longer valid. Please ask your team admin for a fresh link, or register your own company below.</p>
        <button className="btn-primary" onClick={() => { setMode('login'); window.history.replaceState({}, '', window.location.pathname) }}>Continue →</button>
      </div>
    )
  }

  if (mode === 'reset') {
    if (resetTokenValid === null) {
      return <div className="page"><p style={{ color: 'var(--grey-400)' }}>Checking your reset link...</p></div>
    }
    if (resetTokenValid === false) {
      return (
        <div className="page">
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Reset Link Invalid or Expired</h2>
          <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>This password reset link has expired or was already used. Request a fresh one below.</p>
          <button className="btn-primary" onClick={() => { setMode('login'); window.history.replaceState({}, '', window.location.pathname) }}>Back to Login</button>
        </div>
      )
    }
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Set a New Password</h2>
        <div className="form-group">
          <label className="form-label">New Password <span className="required">*</span></label>
          <input className="form-input" type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirm Password <span className="required">*</span></label>
          <input className="form-input" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        {error && <div className="error-msg">{error}</div>}
        <button className="btn-primary" onClick={handleSetNewPassword} disabled={loading}>
          {loading ? 'Please wait...' : 'Set New Password →'}
        </button>
      </div>
    )
  }

  if (mode === 'forgot') {
    return (
      <div className="page">
        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Reset Your Password</h2>
        {forgotSent ? (
          <>
            <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>
              If an account exists for that email, a reset link has been sent. Please check your inbox (and spam folder).
            </p>
            <button className="btn-secondary" onClick={() => { setMode('login'); setForgotSent(false) }}>← Back to Login</button>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 20 }}>Enter your registered work email and we'll send you a link to reset your password.</p>
            <div className="form-group">
              <label className="form-label">Work Email <span className="required">*</span></label>
              <input className="form-input" type="email" placeholder="you@company.com" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} />
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn-primary" onClick={handleRequestReset} disabled={loading}>
              {loading ? 'Please wait...' : 'Send Reset Link →'}
            </button>
            <div className="mt-4">
              <button className="btn-secondary" onClick={() => setMode('login')}>← Back to Login</button>
            </div>
          </>
        )}
      </div>
    )
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
        <div className="form-group">
          <label className="form-label">Your WhatsApp Number <span style={{ color: 'var(--grey-400)', fontWeight: 400 }}>(optional)</span></label>
          <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.mobile || ''} onChange={e => set('mobile', e.target.value)} />
          <div className="form-hint">If given, we'll send account updates via WhatsApp. Otherwise we'll use your email.</div>
        </div>
        <div className="form-group">
          <label className="form-label">Your Role <span className="required">*</span></label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { value: 'admin', label: 'Admin / Decision Maker', desc: 'I manage hiring strategy and budgets for my team.' },
              { value: 'recruiter', label: 'Recruiter / TA Professional', desc: 'I work on hiring mandates for my company.' }
            ].map(opt => (
              <button key={opt.value} type="button"
                onClick={() => set('user_role', opt.value)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                  border: form.user_role === opt.value ? '2px solid var(--teal)' : '1.5px solid var(--grey-200)',
                  borderRadius: 10, background: form.user_role === opt.value ? 'var(--teal-light)' : 'white',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
                }}>
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                  border: form.user_role === opt.value ? '5px solid var(--teal)' : '2px solid var(--grey-300)',
                  background: 'white'
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.user_role === opt.value ? 'var(--teal)' : 'var(--grey-800)' }}>{opt.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 2, lineHeight: 1.5 }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Free trial explanation */}
        <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 10, padding: '14px', marginBottom: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 6 }}>🎁 You get 5 free tokens on signup</div>
          <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
            <strong>What is a token?</strong> A token is a credit you use to express interest in a candidate profile. Every time you click "Express Interest" on a matched profile, 1 token is used. Think of it like a message credit — you only spend it when you actively choose to reach out to someone.
            <br /><br />
            Your 5 free tokens don't expire. No card required to start.
          </div>
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
        {mode === 'login' && (
          <button type="button" onClick={() => { setMode('forgot'); setError('') }}
            style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: '6px 0 0', textAlign: 'right', display: 'block', width: '100%' }}>
            Forgot password?
          </button>
        )}
      </div>

      {mode === 'register' && (
        <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px', marginBottom: 16 }}>
          <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.privacy_consent_agreed}
              onChange={e => set('privacy_consent_agreed', e.target.checked)}
              style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, accentColor: '#165D7B' }} />
            <span style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
              I have read and agree to StealthSideUp's{' '}
              <button type="button" onClick={() => setShowLegal('privacy')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                Privacy Policy
              </button>{' '}
              and{' '}
              <button type="button" onClick={() => setShowLegal('terms')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--teal)', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer', fontSize: 12 }}>
                Terms of Service
              </button>
              , and I consent to data being processed as described.
            </span>
          </label>
        </div>
      )}

      <LegalModal doc={showLegal} onClose={() => setShowLegal(null)} />

      {error && <div className="error-msg">{error}</div>}

      <button className="btn-primary" onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading || (mode === 'register' && !form.privacy_consent_agreed)}>
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
    must_have_skills: [], good_to_have_skills: [], skill_tree_requirement: {}, role_context: '', why_role: '',
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
  const [eduPref, setEduPref] = useState({ min_degree: '', institute_pref: '', mode_of_study: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const skillOptions = form.job_function && SKILLS_BY_FUNCTION[form.job_function] ? SKILLS_BY_FUNCTION[form.job_function] : []

  const handleExtractJD = async () => {
    if (!jdText.trim()) {
      setExtractError('Please upload a JD file or paste the text'); return
    }

    // Handle file upload
    let textToExtract = jdText
    let pdfBase64 = null
    if (jdText.startsWith('FILE:')) {
      const b64 = jdText.split(':NAME:')[0].replace('FILE:', '')
      const fileName = (jdText.split(':NAME:')[1] || '').toLowerCase()
      if (fileName.endsWith('.pdf')) {
        pdfBase64 = b64
        textToExtract = '' // not used when sending as a native document
      } else if (fileName.endsWith('.docx')) {
        try {
          const binary = atob(b64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          const result = await mammoth.extractRawText({ arrayBuffer: bytes.buffer })
          textToExtract = result.value.slice(0, 4000)
        } catch (e) {
          setExtractError('Could not read this .docx file. Please try re-saving it or paste the JD text instead.')
          setExtracting(false); return
        }
      } else if (fileName.endsWith('.doc')) {
        setExtractError('Older .doc files aren\'t supported for auto-extraction. Please save it as .docx or PDF, or paste the JD text instead.')
        return
      } else {
        // .txt — safe to decode as plain text
        textToExtract = atob(b64).slice(0, 4000)
      }
    } else if (jdText.trim().length < 50) {
      setExtractError('Please paste a more detailed JD — at least a few sentences'); return
    }

    setExtracting(true); setExtractError('')
    try {
      const promptText = `Extract structured information from this job description. Return ONLY a valid JSON object, no markdown, no backticks:
{"role_title":"exact job title","job_function":"one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Technology & Product, Legal & Compliance, Strategy & Consulting, General Management / P&L","seniority_level":"one of: Junior (0-5 yrs, individual contributor), Mid (5-12 yrs, may lead small teams), Senior (12-20 yrs, leads functions or large teams), Leadership (20+ yrs, CXO / functional head)","role_type":"Individual Contributor or Team Manager","role_context":"2-3 sentences on what this person owns max 280 chars","why_role":"1-2 sentences on why exciting max 180 chars","employment_type":"Full-time","location":"city name only","ctc_fixed_min":"minimum fixed CTC in LAKHS per annum as a plain number, e.g. if the JD says '80 lakhs' or '₹80L' output 80, NOT 8000000. If the JD states CTC in Crores, convert to lakhs (1 Cr = 100L). null if not mentioned.","ctc_fixed_max":"maximum fixed CTC in LAKHS per annum as a plain number, same conversion rules as ctc_fixed_min. null if not mentioned.","skills":[{"subFunction":"specific skill area name relevant to the function","proficiency":"proficient or expert","specialisation":"specific specialisation if clear"}]}
Extract 3-6 most important skills from the JD for the skills array.${pdfBase64 ? '' : '\nJD: ' + textToExtract.slice(0, 3000)}`

      const content = pdfBase64
        ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } }, { type: 'text', text: promptText }]
        : promptText

      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: pdfBase64 ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content }]
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
      console.error('JD extraction failed:', e)
      if (e instanceof SyntaxError) {
        setExtractError('We couldn\'t automatically read this JD — it may be in an unusual format. Please fill the form manually below.')
        logExtractionFailure({ extractionType: 'jd_extraction', errorType: 'syntax_error', errorMessage: e.message, contact: corporate?.work_email })
      } else {
        setExtractError('Could not extract: ' + (e.message || 'Unknown error') + '. Please fill the form manually.')
        logExtractionFailure({ extractionType: 'jd_extraction', errorType: 'other', errorMessage: e.message, contact: corporate?.work_email })
      }
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
    if (parseFloat(form.ctc_fixed_min) > 999 || parseFloat(form.ctc_fixed_max) > 999) {
      setError('Please fix the CTC budget figures — they look like they\'re in rupees instead of lakhs.'); return
    }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('jds').insert({
      ...form,
      function: form.job_function,
      corporate_id: corporate.id,
      is_active: true,
      min_degree_required: eduPref.min_degree,
      institute_preference: eduPref.institute_pref,
      mode_of_study_required: eduPref.mode_of_study,
      ctc_fixed_min: form.ctc_fixed_min ? parseFloat(form.ctc_fixed_min) : null,
      ctc_fixed_max: form.ctc_fixed_max ? parseFloat(form.ctc_fixed_max) : null,
      min_years_in_function: form.min_years_in_function ? parseInt(form.min_years_in_function) : null
    })
    if (err) { setError(err.message); setLoading(false); return }
    setSuccess(true); setLoading(false)
  }

  if (success) return (
    <div className="page" style={{ paddingTop: 32 }}>
      <div className="success-icon"><svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32"><polyline points="20 6 9 17 4 12" /></svg></div>
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

  const aiBg = (field) => aiFields.includes(field) ? { background: '#e8f4f2', borderColor: '#165D7B' } : {}
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
          <input className="form-input" type="number" min="0" max="9999" placeholder="Min e.g. 25"
            value={form.ctc_fixed_min}
            onChange={e => {
              const v = e.target.value
              set('ctc_fixed_min', (v === '' || parseFloat(v) <= 9999) ? v : '9999')
            }} />
          <span style={{ color: 'var(--grey-400)' }}>to</span>
          <input className="form-input" type="number" min="0" max="9999" placeholder="Max e.g. 35"
            value={form.ctc_fixed_max}
            onChange={e => {
              const v = e.target.value
              set('ctc_fixed_max', (v === '' || parseFloat(v) <= 9999) ? v : '9999')
            }} />
        </div>
        {(lakhsToWordsDisplay(form.ctc_fixed_min) || lakhsToWordsDisplay(form.ctc_fixed_max)) && (
          <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 4, lineHeight: 1.6 }}>
            {lakhsToWordsDisplay(form.ctc_fixed_min) && <div>Min {lakhsToWordsDisplay(form.ctc_fixed_min)}</div>}
            {lakhsToWordsDisplay(form.ctc_fixed_max) && <div>Max {lakhsToWordsDisplay(form.ctc_fixed_max)}</div>}
          </div>
        )}
        {(parseFloat(form.ctc_fixed_min) > 999 || parseFloat(form.ctc_fixed_max) > 999) && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>
              These figures look like they're in rupees, not lakhs — this would silently break CTC-based candidate matching for this search. Please re-check before posting.
            </div>
            <button type="button" className="btn-secondary btn-sm" onClick={() => {
              if (parseFloat(form.ctc_fixed_min) > 999) set('ctc_fixed_min', (parseFloat(form.ctc_fixed_min) / 100000).toString())
              if (parseFloat(form.ctc_fixed_max) > 999) set('ctc_fixed_max', (parseFloat(form.ctc_fixed_max) / 100000).toString())
            }}>Fix automatically</button>
          </div>
        )}
        <div className="form-hint">Annual figures only. E.g. 25 means ₹25 Lakhs per annum.</div>
      </div>

      <div className="form-group">
        <label className="form-label">Variable / Other Components</label>
        <input className="form-input" placeholder="e.g. 20% variable + ESOPs" value={form.ctc_variable} onChange={e => set('ctc_variable', e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Skill Requirements</label>
        <div className="form-hint" style={{ marginBottom: 10 }}>Select the minimum proficiency level you need for each skill area</div>
        <SkillsTable
          functionName={form.job_function}
          value={form.skill_tree_requirement}
          onChange={v => set('skill_tree_requirement', v)}
          mode="corporate"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Who Are You Looking For? <span className="required">*</span></label>
        <textarea className="form-textarea" maxLength={300} placeholder="e.g. Looking for someone to head HR for a mid-large Indian organization, managing a scale of 10,000+ employees. Should have led HRBP and TA functions at this scale before."
          value={form.role_context} onChange={e => set('role_context', e.target.value)} />
        <div className="form-hint flex-between">
          <span style={{ color: 'var(--teal)', fontWeight: 600 }}>The more specific you are, the more precisely we match you to the right candidates</span>
          <span>{form.role_context.length}/300</span>
        </div>
        {form.role_context.trim() && form.role_context.trim().length < 60 && (
          <div style={{ fontSize: 11.5, color: 'var(--orange)', marginTop: 4 }}>
            This is quite short — mentioning scale, org type, or specific expectations will get you sharper, better-fit matches.
          </div>
        )}
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

      <div className="form-group">
        <label className="form-label">Mode of Study Required</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {['No preference', 'Full-time only'].map(opt => (
            <button key={opt} type="button"
              className={`tag ${eduPref.mode_of_study === opt ? 'selected' : ''}`}
              onClick={() => setEduPref(e => ({ ...e, mode_of_study: opt }))}>
              {opt}
            </button>
          ))}
        </div>
        <div className="form-hint">Choose "Full-time only" to exclude correspondence/distance degrees from matches.</div>
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
export function CorporateDashboard({ corporate, onNavigate, onCorporateUpdate }) {
  const [jds, setJds] = useState([])
  const [matches, setMatches] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeJd, setActiveJd] = useState(null)
  const [interests, setInterests] = useState([])
  const [processingInterestFor, setProcessingInterestFor] = useState(null)
  const [expandedSkillsFor, setExpandedSkillsFor] = useState({})
  const [viewingIndex, setViewingIndex] = useState(null) // revisit a specific already-reviewed candidate, outside the active sequential review
  const [closedJds, setClosedJds] = useState([])
  const [jdInterestCounts, setJdInterestCounts] = useState({})
  const [extendingJd, setExtendingJd] = useState(null)
  const [confirmingCloseJd, setConfirmingCloseJd] = useState(null)
  const [jdActionError, setJdActionError] = useState('')
  const [reranking, setReranking] = useState(false)

  const handleViewMatches = async (jd) => {
    setActiveJd(jd)
    setViewingIndex(null)
    await loadInterests(jd.id)

    const candidateList = matches[jd.id] || []
    if (candidateList.length === 0) return

    setReranking(true)
    try {
      const response = await fetch('/api/rerank-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd: { role_title: jd.role_title, role_context: jd.role_context, why_role: jd.why_role },
          candidates: candidateList.map(c => ({ id: c.id, headline: c.headline }))
        })
      })
      const { rankings } = await response.json()
      const rankMap = {}
      ;(rankings || []).forEach(r => { rankMap[r.id] = r })

      const annotated = candidateList.map(c => ({
        ...c,
        aiFitScore: rankMap[c.id]?.fitScore ?? 50,
        aiFitNote: rankMap[c.id]?.fitNote || null
      }))
      // Re-rank only within the already structurally-qualified shortlist —
      // this never changes who qualifies, only the order they're reviewed in.
      annotated.sort((a, b) => b.aiFitScore - a.aiFitScore)
      setMatches(m => ({ ...m, [jd.id]: annotated }))
    } catch (e) {
      console.error('Re-ranking failed, showing structured order:', e)
    }
    setReranking(false)
  }

  useEffect(() => {
    if (!corporate) { onNavigate('corporate-login'); return }
    loadJds()
  }, [corporate])

  const loadJds = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    const { data: all } = await supabase.from('jds').select('*').eq('corporate_id', corporate.id).order('created_at', { ascending: false })
    const active = (all || []).filter(jd => jd.is_active && (!jd.end_date || jd.end_date >= today))
    const closed = (all || []).filter(jd => !jd.is_active || (jd.end_date && jd.end_date < today))
    setJds(active)
    setClosedJds(closed)
    if (all?.length) {
      await loadMatches(active)
      const { data: interestRows } = await supabase.from('interests').select('jd_id').in('jd_id', all.map(jd => jd.id))
      const counts = {}
      ;(interestRows || []).forEach(r => { counts[r.jd_id] = (counts[r.jd_id] || 0) + 1 })
      setJdInterestCounts(counts)
    }
    setLoading(false)
  }

  const handleExtendJd = async (jd, days) => {
    setJdActionError('')
    const base = jd.end_date && jd.end_date >= new Date().toISOString().split('T')[0] ? new Date(jd.end_date) : new Date()
    base.setDate(base.getDate() + days)
    const newEndDate = base.toISOString().split('T')[0]
    const { error: err } = await supabase.from('jds').update({ end_date: newEndDate, is_active: true }).eq('id', jd.id)
    if (err) { setJdActionError('Could not extend this search. Please try again.'); return }
    setExtendingJd(null)
    await loadJds()
  }

  const handleCloseJd = async (jd) => {
    setJdActionError('')
    const { error: err } = await supabase.from('jds').update({ is_active: false }).eq('id', jd.id)
    if (err) { setJdActionError('Could not close this search. Please try again.'); return }
    await loadJds()
  }

  const handleReopenJd = async (jd) => {
    setJdActionError('')
    const today = new Date().toISOString().split('T')[0]
    const needsNewDate = !jd.end_date || jd.end_date < today
    const updates = needsNewDate
      ? { is_active: true, end_date: (() => { const d = new Date(); d.setDate(d.getDate() + 10); return d.toISOString().split('T')[0] })() }
      : { is_active: true }
    const { error: err } = await supabase.from('jds').update(updates).eq('id', jd.id)
    if (err) { setJdActionError('Could not reopen this search. Please try again.'); return }
    await loadJds()
  }

  const handleDeleteJd = async (jd) => {
    setJdActionError('')
    if (jdInterestCounts[jd.id] > 0) {
      setJdActionError('This search has candidate interest history and can\'t be deleted — please use Close instead, to keep that history intact.')
      return
    }
    if (!window.confirm(`Permanently delete "${jd.role_title}"? This can't be undone.`)) return
    const { error: err } = await supabase.from('jds').delete().eq('id', jd.id)
    if (err) { setJdActionError('Could not delete this search. Please try again.'); return }
    await loadJds()
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

  const getInterestStatus = (candidateId) => {
    return interests.find(i => i.candidate_id === candidateId)?.status || null
  }

  const interestStatusLabel = (status) => {
    switch (status) {
      case 'notified': return { label: 'Pending with candidate', bg: '#fff4ec', color: '#c45f00' }
      case 'interested': return { label: 'Accepted — CV pending', bg: '#eff6ff', color: '#1d4ed8' }
      case 'cv_pending': return { label: 'Accepted — CV pending', bg: '#eff6ff', color: '#1d4ed8' }
      case 'cv_sent': return { label: 'CV shared with you', bg: '#d1fae5', color: '#065f46' }
      case 'not_interested': return { label: 'Candidate declined', bg: '#fee2e2', color: '#991b1b' }
      default: return { label: status || 'Unknown', bg: '#f3f4f6', color: '#6b7280' }
    }
  }

  const handleExpressInterest = async (jd, candidate) => {
    // Hard guard against rapid double-clicks / duplicate submissions
    if (processingInterestFor === candidate.id) return
    setProcessingInterestFor(candidate.id)

    try {
      const currentTokens = corporate.tokens || 0
      if (currentTokens <= 0) {
        alert('You are out of tokens. Please buy more to express interest in additional profiles.')
        onNavigate('buy-tokens')
        return
      }

      // Re-check against the latest saved status before inserting — closes the race
      // where interests state might be momentarily stale from a prior action
      const { data: existing } = await supabase.from('interests').select('id').eq('jd_id', jd.id).eq('candidate_id', candidate.id).maybeSingle()
      if (existing) {
        await loadInterests(jd.id)
        return
      }

      const { error } = await supabase.from('interests').insert({
        jd_id: jd.id, candidate_id: candidate.id, corporate_id: corporate.id, status: 'notified'
      })
      if (error) return

      // Deduct 1 token and sync it back to shared app state
      const newTokenCount = currentTokens - 1
      const { error: tokenErr } = await supabase.from('corporates').update({ tokens: newTokenCount }).eq('id', corporate.id)
      if (!tokenErr) {
        const updatedCorporate = { ...corporate, tokens: newTokenCount }
        onCorporateUpdate && onCorporateUpdate(updatedCorporate)
        // Low token alert — fired the moment the balance drops to 2
        if (newTokenCount === 2) {
          if (corporate.mobile?.trim()) {
            sendLowTokenAlert(corporate.mobile, corporate.contact_person, newTokenCount).catch(e => console.error('Low token alert failed:', e))
          } else {
            sendLowTokenAlertEmail(corporate.work_email, corporate.contact_person, newTokenCount).catch(e => console.error('Low token alert email failed:', e))
          }
        }
      }

      // Notify the candidate — phone-registered candidates only, matches WhatsApp capability
      if (candidate.contact_type === 'phone') {
        const roleDetails = jd.stealth_mode
          ? `${jd.function} role, ${jd.seniority_level || ''}`.trim()
          : `${jd.role_title} at ${corporate.company_name}`
        sendMatchNotification(candidate.contact, 'there', jd.function, roleDetails).catch(e => console.error('Match notification failed:', e))
      }

      // Refresh interests so the button correctly disappears — this was missing before,
      // which is exactly what let repeated clicks slip through
      await loadInterests(jd.id)

      if (jd.stealth_mode) {
        alert('Interest expressed in Stealth Mode. The candidate will receive a notification showing only your industry, location, role level and CTC range — not your company name. Your identity is revealed only after they say yes and you choose to proceed.')
      } else {
        alert(`Interest expressed. The candidate will receive a notification from ${corporate.company_name} with full role details.`)
      }
    } finally {
      setProcessingInterestFor(null)
    }
  }

  const handleSave = async (jd, candidate) => {
    await supabase.from('interests').insert({
      jd_id: jd.id, candidate_id: candidate.id, corporate_id: corporate.id, status: 'saved'
    })
    await loadInterests(activeJd?.id || jd.id)
  }

  const handleNotFit = async (jdId, candidateId) => {
    await supabase.from('interests').insert({
      jd_id: jdId, candidate_id: candidateId, corporate_id: corporate.id, status: 'not_fit'
    })
    await loadInterests(jdId)
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
        {reranking && (
          <div style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="spinner" style={{ width: 12, height: 12 }} /> Sharpening match order based on what candidates said they're looking for...
          </div>
        )}

        {candidateList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--grey-600)', fontSize: 14 }}>No matching profiles yet. As more candidates register, matches will appear here.</p>
          </div>
        ) : (() => {
          const pendingIndex = candidateList.findIndex(c => !getInterestStatus(c.id))
          const reviewedCount = candidateList.filter(c => getInterestStatus(c.id)).length
          const isViewing = viewingIndex !== null
          const displayIndex = isViewing ? viewingIndex : pendingIndex

          if (!isViewing && pendingIndex === -1) {
            const expressedInterests = candidateList
              .map((c, i) => ({ candidate: c, index: i, status: getInterestStatus(c.id) }))
              .filter(x => x.status && x.status !== 'saved' && x.status !== 'not_fit')

            return (
              <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
                <p style={{ color: 'var(--grey-800)', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>You've reviewed all {candidateList.length} matches</p>
                <p style={{ color: 'var(--grey-600)', fontSize: 13, marginBottom: expressedInterests.length ? 20 : 0 }}>
                  {candidateList.filter(c => getInterestStatus(c.id) === 'notified').length} interest{candidateList.filter(c => getInterestStatus(c.id) === 'notified').length !== 1 ? 's' : ''} expressed ·{' '}
                  {candidateList.filter(c => getInterestStatus(c.id) === 'saved').length} saved for later ·{' '}
                  {candidateList.filter(c => getInterestStatus(c.id) === 'not_fit').length} marked not a fit
                </p>

                {expressedInterests.length > 0 && (
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Your Expressed Interests</div>
                    {expressedInterests.map(({ candidate, index, status }) => {
                      const s = interestStatusLabel(status)
                      return (
                        <div key={candidate.id} onClick={() => setViewingIndex(index)}
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--grey-50, #f9fafb)', borderRadius: 8, marginBottom: 8, cursor: 'pointer' }}>
                          <div>
                            <span className="badge badge-teal" style={{ marginRight: 8 }}>SSU-{String(index + 1001).padStart(4, '0')}</span>
                            <span style={{ fontSize: 12.5, color: 'var(--grey-600)' }}>{candidate.headline?.slice(0, 60)}{candidate.headline?.length > 60 ? '…' : ''}</span>
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 700, padding: '3px 9px', borderRadius: 10, whiteSpace: 'nowrap', background: s.bg, color: s.color }}>{s.label}</span>
                        </div>
                      )
                    })}
                    <div style={{ fontSize: 11.5, color: 'var(--grey-400)', marginTop: 6, lineHeight: 1.5 }}>
                      CVs are emailed to you directly the moment a candidate accepts, this list is just to track where each one stands.
                    </div>
                  </div>
                )}
              </div>
            )
          }

          return (
            <>
              {isViewing ? (
                <button className="btn-secondary btn-sm" style={{ marginBottom: 16 }} onClick={() => setViewingIndex(null)}>← Back to Summary</button>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 16 }}>
                  Reviewing candidate <strong style={{ color: 'var(--teal)' }}>{reviewedCount + 1}</strong> of <strong style={{ color: 'var(--teal)' }}>{candidateList.length}</strong> matches
                  <div style={{ height: 6, background: 'var(--grey-100)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(reviewedCount / candidateList.length) * 100}%`, background: 'var(--teal)', borderRadius: 3, transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}
              {[{ c: candidateList[displayIndex], i: displayIndex }].map(({ c, i }) => (
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
                {c.aiFitNote && (
                  <div style={{ fontSize: 12.5, color: 'var(--teal)', background: 'var(--teal-pale)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, lineHeight: 1.5 }}>
                    ✨ {c.aiFitNote}
                  </div>
                )}

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
                {((c.current_industry?.length > 0) || c.previous_industries?.length > 0) && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Industry Background</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {(Array.isArray(c.current_industry) ? c.current_industry : (c.current_industry ? [c.current_industry] : [])).map(ind => <span key={ind} className="badge badge-teal">{ind} (current)</span>)}
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
                      {(() => {
                        if (!c.preferred_locations.openToNearby) return null
                        const cities = c.preferred_locations.cities
                        const badges = []
                        if (NCR_CITIES.some(city => cities.includes(city))) badges.push('Open to all of NCR')
                        if (MUMBAI_REGION.some(city => cities.includes(city))) badges.push('Open to Mumbai region')
                        return badges.map(b => <span key={b} className="badge badge-teal">{b}</span>)
                      })()}
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

                {/* Skills with highlights — Expert-level skills always shown in full (they carry the
                    differentiating highlight text); Familiar/Proficient are capped with an expand toggle */}
                {c.skill_tree && Object.keys(c.skill_tree).length > 0 && (() => {
                  const allSkills = Object.entries(c.skill_tree)
                  const expertSkills = allSkills.filter(([, entry]) => entry?.level === 'Expert')
                  const otherSkills = allSkills.filter(([, entry]) => entry?.level !== 'Expert')
                  const isExpanded = !!expandedSkillsFor[c.id]
                  const otherCap = Math.max(0, 6 - expertSkills.length)
                  const visibleOther = isExpanded ? otherSkills : otherSkills.slice(0, otherCap)
                  const hiddenCount = otherSkills.length - visibleOther.length
                  const visibleSkills = [...expertSkills, ...visibleOther]
                  return (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 8 }}>Skills</div>
                      {visibleSkills.map(([sf, entry]) => (
                        <div key={sf} style={{ background: 'var(--grey-50)', borderRadius: 7, padding: '8px 10px', marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: entry?.highlight ? 4 : 0 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-800)' }}>{sf}</span>
                            {entry?.level && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                                background: entry.level === 'Expert' ? '#d1fae5' : entry.level === 'Proficient' ? '#FFF4EC' : 'var(--teal-light)',
                                color: entry.level === 'Expert' ? '#065f46' : entry.level === 'Proficient' ? '#c45f00' : 'var(--teal)'
                              }}>{entry.level}</span>
                            )}
                          </div>
                          {entry?.highlight && (
                            <div style={{ fontSize: 11, color: 'var(--orange)', fontStyle: 'italic', lineHeight: 1.5 }}>
                              "{entry.highlight}"
                            </div>
                          )}
                        </div>
                      ))}
                      {hiddenCount > 0 && (
                        <button type="button" onClick={() => setExpandedSkillsFor(prev => ({ ...prev, [c.id]: true }))}
                          style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0' }}>
                          + {hiddenCount} more skill{hiddenCount > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  )
                })()}

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
                {/* Action buttons — greyed out once action taken */}
                {(() => {
                  const actionStatus = getInterestStatus(c.id)
                  if (actionStatus === 'notified') return (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-teal">✓ Interest Expressed</span>
                        <span style={{ fontSize: 12, color: 'var(--grey-400)' }}>Awaiting candidate response</span>
                      </div>
                    </div>
                  )
                  if (actionStatus === 'saved') return (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span className="badge badge-yellow">📌 Saved for Later</span>
                      </div>
                      <button className="btn-primary btn-sm" onClick={() => handleExpressInterest(activeJd, c)} disabled={processingInterestFor === c.id}>
                        {processingInterestFor === c.id ? 'Sending...' : 'Express Interest Now'}
                      </button>
                    </div>
                  )
                  if (actionStatus === 'not_fit') return (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                      <span className="badge badge-grey">✗ Marked Not a Fit</span>
                    </div>
                  )
                  if (actionStatus === 'cv_sent' || actionStatus === 'interested' || actionStatus === 'cv_pending') return (
                    <div style={{ paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge badge-green">✓ Candidate Interested</span>
                        <span style={{ fontSize: 12, color: 'var(--grey-400)' }}>
                          {actionStatus === 'cv_sent' ? 'CV received — check your email' : 'CV upload pending (48hrs)'}
                        </span>
                      </div>
                    </div>
                  )
                  // No action taken yet
                  return (
                    <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid var(--grey-200)' }}>
                      <button className="btn-primary btn-sm" onClick={() => handleExpressInterest(activeJd, c)} disabled={processingInterestFor === c.id}>
                        {processingInterestFor === c.id ? 'Sending...' : 'Express Interest'}
                      </button>
                      <button className="btn-secondary btn-sm" onClick={() => handleSave(activeJd, c)}>Save for Later</button>
                      <button type="button" onClick={() => handleNotFit(activeJd.id, c.id)}
                        style={{ padding: '8px 14px', fontSize: 13, borderRadius: 6, border: '1.5px solid var(--grey-200)', background: 'white', color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Not a fit
                      </button>
                    </div>
                  )
                })()}
              </div>
              ))}
            </>
          )
        })()}
      </div>
    )
  }

  return (
    <div className="page">
      <div className="flex-between" style={{ marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)' }}>{corporate.company_name}</h2>
          <div className="text-muted">{corporate.contact_person}</div>
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

      {/* TOKEN BALANCE */}
      <div style={{
        background: (corporate.tokens || 0) <= 2 ? '#fff4ec' : 'var(--teal-light)',
        border: `1.5px solid ${(corporate.tokens || 0) <= 2 ? 'var(--orange-border)' : 'var(--teal-border)'}`,
        borderRadius: 12, padding: '14px 16px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Token Balance</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: (corporate.tokens || 0) <= 2 ? 'var(--orange)' : 'var(--teal)' }}>
            {corporate.tokens || 0} tokens
          </div>
          <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 2 }}>
            {(corporate.tokens || 0) <= 2
              ? '⚠ Running low — buy more to keep matching'
              : '1 token used per candidate you express interest in'}
          </div>
        </div>
        <button type="button" onClick={() => onNavigate('buy-tokens')}
          style={{
            background: 'var(--orange)', color: 'white', border: 'none', borderRadius: 8,
            padding: '10px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(255,157,82,0.3)'
          }}>
          Buy Tokens
        </button>
      </div>

      {/* INVITE YOUR TEAM — root accounts only, not team members */}
      {!corporate.own_id && corporate.invite_code && (
        <div style={{ background: 'var(--grey-50)', border: '1.5px solid var(--grey-200)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 6 }}>👥 Invite Your Team</div>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 10, lineHeight: 1.6 }}>
            Share this link with recruiters on your team. They'll share your company's token pool and see all JDs and matches.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input readOnly value={`${window.location.origin}/?invite=${corporate.invite_code}`}
              style={{ flex: 1, border: '1.5px solid var(--grey-200)', borderRadius: 7, padding: '8px 10px', fontSize: 12, color: 'var(--grey-600)', fontFamily: 'monospace' }} />
            <button type="button"
              onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/?invite=${corporate.invite_code}`); alert('Invite link copied!') }}
              style={{ background: 'var(--teal)', color: 'white', border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              Copy Link
            </button>
          </div>
        </div>
      )}

      <button className="btn-orange" style={{ marginBottom: 24 }} onClick={() => onNavigate('post-jd')}>+ Post a New Search</button>

      {loading ? <div className="spinner" /> : (
        <>
          {jdActionError && <div className="error-msg" style={{ marginBottom: 12 }}>{jdActionError}</div>}

          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Active Searches</div>
          {jds.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 32, marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <p style={{ color: 'var(--grey-600)', fontSize: 14 }}>No active searches yet. Post your first search to start matching.</p>
            </div>
          ) : jds.map(jd => {
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

                {confirmingCloseJd === jd.id ? (
                  <div style={{ background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 12.5, color: '#9a3412', lineHeight: 1.6, marginBottom: 10 }}>
                      {matched.length > 0
                        ? `This search currently has ${matched.length} matched profile${matched.length > 1 ? 's' : ''}. Closing it stops new matches, but you can still view existing ones from "Closed / Expired Searches" below, and reopen it anytime.`
                        : `Closing stops new matches. You can reopen it anytime from "Closed / Expired Searches" below.`}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-secondary btn-sm" onClick={() => { handleCloseJd(jd); setConfirmingCloseJd(null) }}>Yes, close it</button>
                      <button className="btn-secondary btn-sm" onClick={() => setConfirmingCloseJd(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-primary btn-sm" onClick={() => handleViewMatches(jd)}>View Matches →</button>
                    {extendingJd === jd.id ? (
                      <>
                        <button className="btn-secondary btn-sm" onClick={() => handleExtendJd(jd, 10)}>+10 days</button>
                        <button className="btn-secondary btn-sm" onClick={() => handleExtendJd(jd, 30)}>+30 days</button>
                        <button className="btn-secondary btn-sm" onClick={() => setExtendingJd(null)}>Cancel</button>
                      </>
                    ) : (
                      <button className="btn-secondary btn-sm" onClick={() => setExtendingJd(jd.id)}>Extend</button>
                    )}
                    <button className="btn-secondary btn-sm" onClick={() => setConfirmingCloseJd(jd.id)}>Mark as Closed</button>
                  </div>
                )}
              </div>
            )
          })}

          {closedJds.length > 0 && (
            <>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, margin: '24px 0 12px' }}>Closed / Expired Searches</div>
              {closedJds.map(jd => (
                <div key={jd.id} className="card" style={{ marginBottom: 12, opacity: 0.75 }}>
                  <div className="flex-between" style={{ marginBottom: 6 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 15 }}>{jd.role_title}</h3>
                    <span className="badge" style={{ background: 'var(--grey-200)', color: 'var(--grey-600)' }}>
                      {!jd.is_active ? 'Closed' : 'Expired'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--grey-600)', marginBottom: 6 }}>{jd.function} · {jd.seniority_level}</div>
                  {jdInterestCounts[jd.id] > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--grey-400)', marginBottom: 10 }}>{jdInterestCounts[jd.id]} candidate interest{jdInterestCounts[jd.id] > 1 ? 's' : ''} on record</div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn-primary btn-sm" onClick={() => handleReopenJd(jd)}>Reopen</button>
                    <button className="btn-secondary btn-sm" onClick={() => handleDeleteJd(jd)}>Delete</button>
                  </div>
                </div>
              ))}
            </>
          )}
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

    // Mode of study filter — only excludes candidates when a JD explicitly requires full-time
    if (jd.mode_of_study_required === 'Full-time only' && c.mode_of_study && c.mode_of_study !== 'Full-time') {
      return false
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
      const candidateCities = c.preferred_locations.cities
      const openToNearby = c.preferred_locations.openToNearby
      const isSpecialLocation = ['Pan-India / National Role', 'Remote / Work from Home', 'Flexible / Any Location'].includes(jd.location)
      if (!isSpecialLocation) {
        const candidateWantsAny = candidateCities.includes('Pan-India / National Role') || candidateCities.includes('Flexible / Any Location') || candidateCities.includes('Remote / Work from Home')
        const directMatch = candidateCities.includes(jd.location)
        const ncrMatch = NCR_CITIES.includes(jd.location) && openToNearby && NCR_CITIES.some(city => candidateCities.includes(city))
        const mumbaiMatch = MUMBAI_REGION.includes(jd.location) && openToNearby && MUMBAI_REGION.some(city => candidateCities.includes(city))
        if (!candidateWantsAny && !directMatch && !ncrMatch && !mumbaiMatch) return false
      }
    }

    const score = calcScore(c, jd, corporate)

    // Minimum threshold to show — roughly two solid categories aligning, not just one
    return score >= 50
  }).sort((a, b) => calcScore(b, jd, corporate) - calcScore(a, jd, corporate))
}

function calcScore(c, jd, corporate) {
  let score = 0

  // Function match (high weight)
  if (c.primary_function === jd.function) score += 30

  // Seniority match (high weight)
  if (jd.seniority_level && c.seniority_open_to?.some(s => s.includes(jd.seniority_level?.split(' ')[0]))) score += 25

  // Industry match (current or previous)
  if (jd.industry) {
    const currentInds = Array.isArray(c.current_industry) ? c.current_industry : (c.current_industry ? [c.current_industry] : [])
    if (currentInds.includes(jd.industry)) score += 20
    else if (c.previous_industries?.includes(jd.industry)) score += 10
  }

  // Employment type
  if (jd.employment_type && c.desired_employment_type?.some(d => d.toLowerCase().includes(jd.employment_type.toLowerCase().split('/')[0].trim()))) score += 15

  // Org type
  if (jd.org_type && c.org_type_open_to?.some(o => o.toLowerCase().includes(jd.org_type.toLowerCase().split('—')[0].trim()))) score += 10

  // Skills overlap — bonus on top of the fixed-criteria 100, since JDs vary in how many skills they list
  const skillOverlap = (jd.must_have_skills || []).filter(s => c.skill_keywords?.includes(s)).length
  score += skillOverlap * 8

  return score
}
