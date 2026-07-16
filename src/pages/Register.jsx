import React, { useState, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sendCandidateWelcome } from '../lib/whatsapp'
import SkillsTable from '../components/SkillsTable'
import IndustrySelect from '../components/IndustrySelect'
import LegalModal from '../components/LegalModal'
import { lakhsToWordsDisplay } from '../lib/numberToWords'
import { COMPANIES } from '../data/companies'

function InstituteSearch({ value, onChange }) {
  const [query, setQuery] = React.useState(value || '')
  const [showOptions, setShowOptions] = React.useState(false)
  const filtered = query.length > 1
    ? INSTITUTES.filter(i => i.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : []

  return (
    <div style={{ position: 'relative' }}>
      <input className="form-input"
        placeholder="Start typing your institute name..."
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(''); setShowOptions(true) }}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 200)}
      />
      {value && <div style={{ fontSize: 12, color: 'var(--teal)', marginTop: 4, fontWeight: 600 }}>✓ {value}</div>}
      {showOptions && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
          background: 'white', border: '1.5px solid var(--teal-border)',
          borderRadius: 8, boxShadow: 'var(--shadow-md)', maxHeight: 200, overflowY: 'auto'
        }}>
          {filtered.map(inst => (
            <button key={inst} type="button"
              onMouseDown={() => { onChange(inst); setQuery(inst); setShowOptions(false) }}
              style={{
                display: 'block', width: '100%', padding: '10px 14px', border: 'none',
                borderBottom: '1px solid var(--grey-100)', background: 'white',
                textAlign: 'left', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--grey-800)'
              }}
              onMouseEnter={e => e.target.style.background = 'var(--teal-light)'}
              onMouseLeave={e => e.target.style.background = 'white'}>
              {inst}
            </button>
          ))}
          {query.length > 1 && (
            <button type="button"
              onMouseDown={() => { onChange(query); setShowOptions(false) }}
              style={{
                display: 'block', width: '100%', padding: '10px 14px', border: 'none',
                background: 'var(--orange-light)', textAlign: 'left', fontSize: 12,
                cursor: 'pointer', fontFamily: 'inherit', color: 'var(--orange)', fontWeight: 600
              }}>
              + Add "{query}" (not in list)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
import { CandidateLocationPicker } from '../components/LocationPicker'
import CareerHistory from '../components/CareerHistory'
import CVUploadSection from '../components/CVUpload'
import {
  FUNCTIONS, SKILLS_BY_FUNCTION, INDUSTRIES, INSTITUTES,
  NOTICE_PERIODS, LANGUAGES, AGE_RANGES,
  CURRENT_EMPLOYMENT_TYPES, DESIRED_EMPLOYMENT_TYPES, DEGREES,
  TENURES, AVG_TENURES, TEAM_SIZES, GEOGRAPHIES,
  SENIORITY_LEVELS, ORG_TYPES, JOB_SEARCH_STATUSES, FREELANCE_ENGAGEMENT_SIZES
} from '../data/formData'

const TOTAL_STEPS = 7 // Verify + 6 sections

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
        <button
          key={opt}
          type="button"
          className={`tag ${value.includes(opt) ? 'selected' : ''}`}
          onPointerDown={e => { e.preventDefault(); toggle(opt) }}
          style={{ touchAction: 'manipulation', userSelect: 'none' }}>
          {opt}
        </button>
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

// IndustrySelect now lives in src/components/IndustrySelect.jsx (shared with EditProfile)

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
        Add your current and previous employers so they never see your profile. Type the common name — e.g. "Airtel" not "Bharti Airtel Limited".
      </div>
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {value.map(company => (
            <div key={company} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 20,
              fontSize: 12, color: '#991b1b', fontWeight: 600
            }}>
              {company}
              <button type="button" onClick={() => removeCompany(company)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <input className="form-input"
          placeholder="Start typing company name..."
          value={query}
          onChange={e => { setQuery(e.target.value); setShowOptions(true) }}
          onFocus={() => setShowOptions(true)}
          onBlur={() => setTimeout(() => setShowOptions(false), 200)}
        />
        {showOptions && (filtered.length > 0 || query.length > 1) && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: 'white', border: '1.5px solid var(--teal-border)',
            borderRadius: 8, boxShadow: 'var(--shadow-md)', maxHeight: 220, overflowY: 'auto'
          }}>
            {filtered.map(company => (
              <button key={company} type="button"
                onMouseDown={() => addCompany(company)}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', border: 'none',
                  borderBottom: '1px solid var(--grey-100)', background: 'white',
                  textAlign: 'left', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  color: 'var(--grey-800)'
                }}
                onMouseEnter={e => e.target.style.background = 'var(--teal-light)'}
                onMouseLeave={e => e.target.style.background = 'white'}>
                {company}
              </button>
            ))}
            {query.length > 1 && (
              <button type="button"
                onMouseDown={() => addCompany(query)}
                style={{
                  display: 'block', width: '100%', padding: '10px 14px', border: 'none',
                  background: '#fff4ec', textAlign: 'left', fontSize: 12,
                  cursor: 'pointer', fontFamily: 'inherit', color: 'var(--orange)', fontWeight: 600
                }}>
                + Block "{query}" (not in list)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CTCInput({ label, value, onChange }) {
  const num = parseFloat(value) || 0
  const isHigh = num > 500
  const isSuspect = num > 1000

  return (
    <div className="ctc-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4, marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-600)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--grey-600)' }}>₹</span>
        <input className="ctc-input" type="number" placeholder="e.g. 25" min="0" max="9999"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ flex: 1, borderColor: isSuspect ? '#ef4444' : isHigh ? 'var(--orange)' : undefined }}
        />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--grey-600)', whiteSpace: 'nowrap' }}>Lakhs pa</span>
      </div>
      {num > 0 && !isSuspect && (
        <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>
          = ₹{num >= 100 ? `${(num/100).toFixed(2)} Crores` : `${num} Lakhs`} per annum
        </div>
      )}
      {isHigh && !isSuspect && (
        <div style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 600 }}>
          ⚠ Double-check — this is ₹{(num/100).toFixed(1)} Crores. If correct, ignore this.
        </div>
      )}
      {isSuspect && (
        <div style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>
          ⚠ This looks like you may have entered the full amount in Rupees. Please enter in Lakhs — e.g. ₹23 Lakhs = 23, not 2300000.
        </div>
      )}
    </div>
  )
}

export function CVPreFill({ form, set, onSkip, onUploaded }) {
  const [uploading, setUploading] = React.useState(false)
  const [done, setDone] = React.useState(false)
  const [error, setError] = React.useState('')
  const [extracted, setExtracted] = React.useState(null)
  const fileRef = React.useRef()

  const handleUpload = async (file) => {
    if (!file) return
    setUploading(true); setError('')
    try {
      const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const prompt = `Read this CV carefully and extract the following information. Return ONLY valid JSON, no markdown or explanation.

{
  "years_experience": "total years as a number e.g. 15",
  "primary_function": "one of: HR / People & Culture, Sales & Business Development, Marketing & Communications, Finance & Accounts, Operations & Supply Chain, Technology & Product, Design & Creative, Legal & Compliance, General Management / P&L, Training & Facilitation, Events & Experiential, Procurement & Sourcing, Research & Development",
  "current_industry": "array of one or more from: Banking — PSU, Banking — Private / Co-operative, Fintech / Payments / Lending Tech, Insurance — Life / General / Health, Wealth / Asset Management / Broking, NBFC / Microfinance, FMCG / Food & Beverage, Retail — Organised / E-commerce, Luxury / Premium Fashion & Lifestyle, Consumer Durables / Electronics, D2C Brands, Agri / Food Processing / Agritech, IT Services / ITES / BPO, SaaS / Product Companies, E-commerce / Marketplace, Emerging Tech (AI / Deeptech / Healthtech), Telecom, Telco Infrastructure (Towers / Fibre / Passive Infra), Automotive / Auto Ancillary, Chemicals / Pharma / Life Sciences, Infrastructure / Real Estate / Construction, Energy / Oil & Gas / Renewables, Industrial Manufacturing, Logistics / Supply Chain / 3PL, Packaging / Paper / Textiles, Defence / Aerospace, Consulting / Professional Services, Events / Entertainment / Sports, Hospitality / Travel & Tourism, Education / EdTech, Healthcare / Hospitals / Diagnostics, Media / Advertising / PR, Legal / Law Firms, Staffing / Recruitment / HR Services, NGO / Development Sector, Government / PSU — include multiple if the person's role clearly spans several industries (e.g. consulting)",
  "previous_industries": ["up to 2 previous industries from same list"],
  "role_type": "Individual Contributor or Team Manager",
  "current_employment_type": "one of: Full-time Employee, Freelance / Independent Consultant, Fractional / Part-time, Not currently employed",
  "headline": "a one-line professional summary under 100 chars — no name, no company, no title — just what they do and their impact",
  "career_history": [
    {
      "roleLabel": "Current Role",
      "industry": "industry name",
      "orgType": "one of: Large Indian conglomerate, Mid-size Indian company, MNC / International company, Indian Startup, Consulting / Agency, Family Business, Government / PSU, NGO",
      "roleType": "Individual Contributor or Team Manager",
      "teamSize": "number or range",
      "tenureYears": "years in this role as number",
      "salaryHikePercent": "",
      "reasonForLeaving": ""
    },
    {
      "roleLabel": "Previous Role",
      "industry": "industry",
      "orgType": "org type",
      "roleType": "IC or TM",
      "teamSize": "",
      "tenureYears": "",
      "salaryHikePercent": "% hike when joining this role",
      "reasonForLeaving": "brief reason"
    },
    {
      "roleLabel": "Role Before That",
      "industry": "industry",
      "orgType": "org type",
      "roleType": "IC or TM",
      "teamSize": "",
      "tenureYears": "",
      "salaryHikePercent": "",
      "reasonForLeaving": "brief reason"
    }
  ]
}

Only extract what is clearly stated. Leave fields empty string if not found.`

      const messageContent = isPDF
        ? [{ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }, { type: 'text', text: prompt }]
        : [{ type: 'text', text: prompt + '\n\nCV:\n' + atob(base64).slice(0, 6000) }]

      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: isPDF ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
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
      setExtracted(parsed)

      // Pass raw CV bytes up so the Skills section can reuse them without a second upload
      onUploaded && onUploaded({ base64, isPDF })

      // Pre-fill the form
      if (parsed.years_experience) set('years_experience', parsed.years_experience)
      if (parsed.primary_function) set('primary_function', parsed.primary_function)
      if (parsed.current_industry) {
        const industries = Array.isArray(parsed.current_industry) ? parsed.current_industry : [parsed.current_industry]
        set('current_industry', industries)
      }
      if (parsed.previous_industries) {
        const prevIndustries = Array.isArray(parsed.previous_industries) ? parsed.previous_industries : []
        if (prevIndustries.length) set('previous_industries', prevIndustries)
      }
      if (parsed.role_type) set('role_type', parsed.role_type)
      if (parsed.current_employment_type) set('current_employment_type', parsed.current_employment_type)
      if (parsed.headline) set('headline', parsed.headline)
      if (parsed.career_history) {
        const history = Array.isArray(parsed.career_history) ? parsed.career_history : []
        if (history.length) set('career_history', history)
      }

      setDone(true)
    } catch(e) {
      console.error('CV extraction failed:', e)
      if (e instanceof SyntaxError) {
        // The AI's response wasn't valid JSON (rare — usually a scanned/image-based PDF
        // with poor extractable text, or an unusually long CV). Never show the raw
        // "Unexpected token..." error to the candidate — it reads like gibberish.
        setError('We couldn\'t automatically read details from this CV — it may be a scanned image or an unusual format. Please fill in the form manually below.')
      } else {
        setError('Could not read CV: ' + (e.message || 'Unknown error') + '. Please fill manually.')
      }
    }
    setUploading(false)
  }

  if (done && extracted) return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 10, padding: '14px 16px', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>✓ CV read — here is what we picked up</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { label: 'Function', value: extracted.primary_function },
            { label: 'Industry', value: Array.isArray(extracted.current_industry) ? extracted.current_industry.join(', ') : extracted.current_industry },
            { label: 'Experience', value: extracted.years_experience ? extracted.years_experience + ' years' : null },
            { label: 'Role type', value: extracted.role_type },
            { label: 'Career history', value: extracted.career_history?.length ? extracted.career_history.length + ' roles extracted' : null },
            { label: 'Headline', value: extracted.headline },
          ].filter(f => f.value).map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', gap: 8, fontSize: 12 }}>
              <span style={{ color: 'var(--grey-400)', width: 90, flexShrink: 0 }}>{label}</span>
              <span style={{ color: 'var(--grey-800)', fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 10 }}>Review and change anything in the form below. AI suggestions are a starting point — not final.</div>
      </div>
      <button type="button" onClick={() => { setDone(false); setExtracted(null); fileRef.current && (fileRef.current.value = '') }}
        style={{ background: 'none', border: 'none', color: 'var(--grey-400)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
        Upload a different CV
      </button>
    </div>
  )

  return (
    <div style={{ background: '#f9fafb', border: '1.5px solid var(--grey-200)', borderRadius: 12, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 4 }}>⚡ Start with your CV — save time</div>
      <div style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.7, marginBottom: 12 }}>
        Upload your CV and AI will pre-fill your function, industry, experience, career history and headline. You review and change anything. <strong style={{ color: 'var(--teal)' }}>Your CV is never stored or shared.</strong>
      </div>
      {error && <div className="error-msg" style={{ marginBottom: 10 }}>{error}</div>}
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }}
        onChange={e => handleUpload(e.target.files?.[0])} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn-primary btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Reading CV...' : '📎 Upload CV'}
        </button>
        {onSkip && (
          <button type="button" className="btn-secondary btn-sm" onClick={onSkip}>
            Fill manually
          </button>
        )}
      </div>
    </div>
  )
}

// Captures utm_source / utm_medium / utm_campaign / utm_term / utm_content / utm_id from the
// landing URL and persists them in sessionStorage so they survive across the multi-step form
// (OTP verification, page refreshes) even though the querystring itself isn't preserved.
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id']
const STORAGE_KEY = 'ssu_utm_params'

function captureUtmParams() {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = {}
    let hasAny = false
    UTM_KEYS.forEach(key => {
      const val = params.get(key)
      if (val) { fromUrl[key] = val; hasAny = true }
    })
    if (hasAny) {
      // Fresh UTM params in the URL always take precedence and overwrite any earlier stored ones,
      // since a new campaign link means this is the most recent, most relevant source.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl))
      return fromUrl
    }
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (e) {
    // sessionStorage can throw in some privacy modes — never block registration over this
    console.error('UTM capture failed:', e)
    return {}
  }
}

export default function Register({ onNavigate }) {
  const [step, setStep] = useState(0) // 0=contact, 1=verify, 2-7=form sections
  const [existingProfileFound, setExistingProfileFound] = useState(false)
  const [showLegal, setShowLegal] = useState(null) // null | 'privacy' | 'terms'
  const [contact, setContact] = useState('')
  const [contactType, setContactType] = useState('phone')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [cvData, setCvData] = useState(null) // { base64, isPDF } — reused by Skills section, no second upload
  const [cvSkipped, setCvSkipped] = useState(false)
  const [utmParams, setUtmParams] = useState({})

  // Capture UTM params once when the registration page first loads, before any step navigation
  useEffect(() => {
    setUtmParams(captureUtmParams())
  }, [])

  const [form, setForm] = useState({
    gender: '', age_range: '', current_employment_type: '', desired_employment_type: [],
    years_experience: '', primary_function: '',
    highest_degree: '', institute: '', institute_other: '', year_of_passing: '', mode_of_study: '',
    certifications: '',
    current_industry: [], current_industry_other: '', current_tenure: '', company_type_b2b_b2c: '',
    role_type: '', team_size: '', geography_managed: [],
    ctc_fixed: '', ctc_variable: '', ctc_joining_bonus: '', ctc_esops: '', ctc_allowances: '',
    freelance_sector: [], freelance_sector_other: '', freelance_engagement_size: '', freelance_years: '',
    previous_industries: [], previous_industries_other: '', average_tenure: '', career_b2b_b2c: '',
    skill_keywords: [], skill_tree: {}, career_history: [], headline: '', declaration_agreed: false, privacy_consent_agreed: false,
    job_search_status: '', seniority_open_to: [], org_type_open_to: [],
    preferred_locations: { cities: [], openToNearby: true },
    notice_period: '', min_expected_ctc: '', years_in_function: '',
    languages: [], open_to_travel: '', has_passport: '',
    work_preference: '', relocation: '', relocation_cities: '', blocked_companies: ''
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const ctcTotal = useMemo(() => {
    const vals = ['ctc_fixed', 'ctc_variable', 'ctc_joining_bonus', 'ctc_esops', 'ctc_allowances']
    return vals.reduce((sum, k) => sum + (parseFloat(form[k]) || 0), 0)
  }, [form.ctc_fixed, form.ctc_variable, form.ctc_joining_bonus, form.ctc_esops, form.ctc_allowances])

  // A total above ~999L (₹10 Cr) is implausible for the vast majority of candidates and almost
  // always means someone typed their figures in raw rupees instead of lakhs (e.g. "1400000"
  // instead of "14"). Flag it clearly rather than silently accepting a broken number.
  const ctcLikelyWrongUnit = ctcTotal > 999
  const minCtcLikelyWrongUnit = parseFloat(form.min_expected_ctc) > 999

  const handleFixCtcUnits = () => {
    ;['ctc_fixed', 'ctc_variable', 'ctc_joining_bonus', 'ctc_esops', 'ctc_allowances'].forEach(k => {
      const raw = parseFloat(form[k])
      if (raw > 999) set(k, (raw / 100000).toString())
    })
  }

  const isFreelance = ['Freelance / Independent Consultant', 'Entrepreneur / Founder', 'Between roles (available immediately)', 'Sabbatical'].includes(form.current_employment_type)
  const seekingFreelance = form.desired_employment_type?.includes('Freelance / Consulting engagements')

  const handleSendOtp = async () => {
    if (!contact.trim()) { setError('Please enter your phone number or email'); return }
    setLoading(true); setError('')

    if (contactType === 'phone') {
      try {
        const response = await fetch('/api/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: contact.trim() })
        })
        const data = await response.json()
        if (!response.ok) { setError(data.error || 'Could not send OTP'); setLoading(false); return }
        setLoading(false); setStep(1)
      } catch (e) {
        setError('Could not send OTP. Please check your connection and try again.')
        setLoading(false)
      }
    } else {
      // Email OTP not yet built — demo mode for now
      setTimeout(() => { setLoading(false); setStep(1) }, 800)
    }
  }

  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) { setError('Enter the 6-digit OTP'); return }
    setLoading(true); setError('')

    if (contactType === 'phone') {
      try {
        const response = await fetch('/api/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contact: contact.trim(), otp: code })
        })
        const data = await response.json()
        if (!response.ok) { setError(data.error || 'Incorrect or expired OTP'); setLoading(false); return }

        const { data: existing } = await supabase.from('candidates').select('id').eq('contact', contact.trim()).maybeSingle()
        if (existing) { setExistingProfileFound(true); setLoading(false); return }

        setLoading(false); setStep(2)
      } catch (e) {
        setError('Could not verify OTP. Please check your connection and try again.')
        setLoading(false)
      }
    } else {
      // Email OTP not yet built — demo mode for now
      setTimeout(() => { setLoading(false); setStep(2) }, 600)
    }
  }

  const handleOtpChange = (idx, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus()
  }

  const handleSubmit = async () => {
    if (!form.headline.trim()) { setError('Please add a professional headline'); return }
    if (ctcLikelyWrongUnit) { setError('Please fix your CTC figures — they look like they\'re in rupees instead of lakhs.'); return }
    if (minCtcLikelyWrongUnit) { setError('Please fix your Minimum Expected CTC — it looks like it\'s in rupees instead of lakhs.'); return }
    setLoading(true); setError('')
    // Defense-in-depth: guarantee every array-column field is genuinely an array before it
    // ever reaches Supabase, regardless of how a bad value got into form state (AI extraction
    // returning a stray string like "None" instead of an empty array, or any other path).
    // Postgres rejects a plain string for an array column with a cryptic "malformed array
    // literal" error, so this is the last line of defense against that class of bug.
    const asArray = v => Array.isArray(v) ? v : []
    try {
      const payload = {
        contact: contact.trim(),
        contact_type: contactType,
        gender: form.gender,
        age_range: form.age_range,
        current_employment_type: form.current_employment_type,
        desired_employment_type: asArray(form.desired_employment_type),
        years_experience: parseInt(form.years_experience) || null,
        primary_function: form.primary_function,
        highest_degree: form.highest_degree,
        mode_of_study: form.mode_of_study,
        institute: form.institute === 'Other (please specify)' ? form.institute_other : form.institute,
        year_of_passing: parseInt(form.year_of_passing) || null,
        certifications: form.certifications,
        current_industry: asArray(form.current_industry),
        current_industry_other: form.current_industry_other,
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
        freelance_sector: asArray(form.freelance_sector),
        freelance_sector_other: form.freelance_sector_other,
        freelance_engagement_size: form.freelance_engagement_size,
        freelance_years: parseInt(form.freelance_years) || null,
        previous_industries: asArray(form.previous_industries),
        previous_industries_other: form.previous_industries_other,
        average_tenure: form.average_tenure,
        career_b2b_b2c: form.career_b2b_b2c,
        skill_keywords: asArray(form.skill_keywords),
        skill_tree: form.skill_tree,
        declaration_agreed: form.declaration_agreed,
        privacy_consent_agreed: form.privacy_consent_agreed,
        privacy_consent_at: form.privacy_consent_agreed ? new Date().toISOString() : null,
        headline: form.headline,
        job_search_status: form.job_search_status,
        seniority_open_to: asArray(form.seniority_open_to),
        org_type_open_to: asArray(form.org_type_open_to),
        work_preference: form.work_preference,
        relocation: form.relocation,
        relocation_cities: asArray(form.relocation_cities),
        blocked_companies: asArray(form.blocked_companies),
        preferred_locations: asArray(form.preferred_locations),
        career_history: asArray(form.career_history),
        notice_period: form.notice_period,
        min_expected_ctc: parseFloat(form.min_expected_ctc) || null,
        years_in_function: parseInt(form.years_in_function) || null,
        languages: asArray(form.languages),
        open_to_travel: form.open_to_travel,
        has_passport: form.has_passport,
        is_active: true,
        // Only attach UTM fields when we actually captured one — this way, if an existing
        // candidate comes back later to edit their profile via a plain (untagged) link, we
        // don't null out their original first-touch attribution on upsert.
        ...(Object.keys(utmParams).length > 0 ? {
          utm_source: utmParams.utm_source || null,
          utm_medium: utmParams.utm_medium || null,
          utm_campaign: utmParams.utm_campaign || null,
          utm_term: utmParams.utm_term || null,
          utm_content: utmParams.utm_content || null,
          utm_id: utmParams.utm_id || null
        } : {})
      }
      const { error: dbErr } = await supabase.from('candidates').upsert(payload, { onConflict: 'contact' })
      if (dbErr) throw dbErr

      // Fire WhatsApp welcome message — phone registrants only, never blocks success on failure
      if (contactType === 'phone') {
        sendCandidateWelcome(contact.trim(), 'there').catch(e => console.error('Welcome message failed:', e))
      }

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
        <svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32">
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
          ✓ You will get a WhatsApp on your registered number when a company wants to reach out<br />
          ✓ Some companies share their name upfront. Others prefer to stay anonymous — in that case you will see their industry and role level first, and their name only after you say yes<br />
          ✓ You decide whether to share your CV and contact. Nobody gets your details without your consent<br />
          ✓ You can say no at any point — your identity is never revealed if you decline<br />
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

  // Existing profile found for this contact — offer Dashboard instead of re-registering
  if (existingProfileFound) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>You're already registered</h2>
      <p style={{ color: 'var(--grey-600)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        We found an existing profile for this number. Head to your Dashboard to view or update it, no need to register again.
      </p>
      <button className="btn-primary" onClick={() => onNavigate('candidate-profile')}>Go to Dashboard →</button>
      <div className="mt-4">
        <button className="btn-secondary btn-sm" style={{ width: 'auto', margin: '0 auto' }}
          onClick={() => { setExistingProfileFound(false); setStep(2) }}>
          Continue registering anyway
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
          <input key={i} id={`otp-${i}`} className="otp-input" type="tel" inputMode="numeric" pattern="[0-9]*" autoComplete="one-time-code" maxLength={1} value={d}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => { if (e.key === 'Backspace' && !d && i > 0) document.getElementById(`otp-${i - 1}`)?.focus() }} />
        ))}
      </div>
      <div className="form-hint" style={{ textAlign: 'center', marginBottom: 20 }}>
        {contactType === 'email' && '(Email OTP is in demo mode for now — enter any 6 digits)'}
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

        {/* CV PRE-FILL — before Section A */}
        {formStep === 0 && !cvSkipped && (
          <CVPreFill form={form} set={set} onSkip={() => setCvSkipped(true)} onUploaded={setCvData} />
        )}

        {/* SECTION A — About You */}
        {formStep === 0 && <>
          <div className="section-header">A — About You</div>

          <div className="form-group">
            <label className="form-label">Gender</label>
            <TagSelect options={['Male','Female','Non-binary','Prefer not to say']} value={form.gender ? [form.gender] : []} onChange={v => set('gender', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Age Range</label>
            <TagSelect options={AGE_RANGES} value={form.age_range ? [form.age_range] : []} onChange={v => set('age_range', v[v.length-1] || '')} max={1} />
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
            <label className="form-label">Mode of Study</label>
            <div className="tag-group">
              {['Full-time', 'Part-time', 'Correspondence / Distance'].map(opt => (
                <button key={opt} type="button" className={`tag ${form.mode_of_study === opt ? 'selected' : ''}`}
                  onClick={() => set('mode_of_study', opt)}>{opt}</button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Institute</label>
            <InstituteSearch value={form.institute} onChange={v => set('institute', v)} />
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
              <label className="form-label">Current Industry / Industries <span className="required">*</span></label>
              <div className="form-hint" style={{ marginBottom: 10 }}>Select more than one if your role spans multiple industries (e.g. consulting, professional services)</div>
              <IndustrySelect value={form.current_industry} onChange={v => set('current_industry', v)} single={false}
                otherValue={form.current_industry_other} onOtherChange={v => set('current_industry_other', v)} />
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
              <div className="form-hint" style={{ marginBottom: 10 }}>Figures in Lakhs per annum. E.g. 25 = ₹25L. For Crores use decimals — e.g. 1.5 Cr = 150, 2 Cr = 200.</div>
              {[
                { key: 'ctc_fixed', label: 'Fixed / Base Salary' },
                { key: 'ctc_variable', label: 'Variable / Bonus' },
                { key: 'ctc_joining_bonus', label: 'Joining Bonus' },
                { key: 'ctc_esops', label: 'ESOPs / RSUs' },
                { key: 'ctc_allowances', label: 'Allowances (total)' },
              ].map(({ key, label }) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  <div className="ctc-row">
                    <div className="ctc-label">{label}</div>
                    <input className="ctc-input" type="number" min="0" max="9999" placeholder="0"
                      value={form[key]}
                      onChange={e => {
                        const v = e.target.value
                        set(key, (v === '' || parseFloat(v) <= 9999) ? v : '9999')
                      }} />
                    <div style={{ fontSize: 12, color: 'var(--grey-400)', width: 16 }}>L</div>
                  </div>
                  {lakhsToWordsDisplay(form[key]) && (
                    <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 2, marginLeft: 2 }}>
                      {lakhsToWordsDisplay(form[key])}
                    </div>
                  )}
                </div>
              ))}
              <div className="ctc-total">
                <span className="ctc-total-label">Total CTC</span>
                <span className="ctc-total-value">₹{ctcTotal.toFixed(2)}L</span>
              </div>
              {ctcLikelyWrongUnit && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8, padding: 12, marginTop: 10 }}>
                  <div style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>
                    ₹{ctcTotal.toFixed(0)}L seems very high — this usually means the figures were entered in rupees instead of lakhs. Did you mean <strong>₹{(ctcTotal / 100000).toFixed(2)}L</strong>?
                  </div>
                  <button type="button" className="btn-secondary btn-sm" onClick={handleFixCtcUnits}>Fix automatically</button>
                </div>
              )}
            </div>
          </> : <>
            <div className="form-group">
              <label className="form-label">Current Industry / Industries <span className="required">*</span></label>
              <div className="form-hint" style={{ marginBottom: 10 }}>Select all industries you currently work across</div>
              <IndustrySelect value={form.freelance_sector} onChange={v => set('freelance_sector', v)} single={false}
                otherValue={form.freelance_sector_other} onOtherChange={v => set('freelance_sector_other', v)} />
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
            <IndustrySelect value={form.previous_industries} onChange={v => v.length <= 3 ? set('previous_industries', v) : null}
              otherValue={form.previous_industries_other} onOtherChange={v => set('previous_industries_other', v)} />
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
            <div className="form-hint" style={{ marginBottom: 12 }}>
              Select your proficiency level for each area. For Expert — share a highlight from your work.
            </div>
            <SkillsTable
              functionName={form.primary_function}
              value={form.skill_tree}
              onChange={v => set('skill_tree', v)}
              mode="candidate"
              cvData={cvData}
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
            <label className="form-label">Notice Period <span className="required">*</span></label>
            <TagSelect options={NOTICE_PERIODS} value={form.notice_period ? [form.notice_period] : []} onChange={v => set('notice_period', v[v.length-1] || '')} max={1} />
          </div>

          {!seekingFreelance && (
            <div className="form-group">
              <label className="form-label">Minimum Expected CTC (₹L per annum)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input className="form-input" type="number" min="0" max="9999" placeholder="e.g. 35" style={{ maxWidth: 140 }}
                  value={form.min_expected_ctc}
                  onChange={e => {
                    const v = e.target.value
                    set('min_expected_ctc', (v === '' || parseFloat(v) <= 9999) ? v : '9999')
                  }} />
                <span style={{ fontSize: 13, color: 'var(--grey-400)' }}>Lakhs per annum</span>
              </div>
              {lakhsToWordsDisplay(form.min_expected_ctc) && (
                <div style={{ fontSize: 11, color: 'var(--grey-400)', marginTop: 4 }}>
                  {lakhsToWordsDisplay(form.min_expected_ctc)}
                </div>
              )}
              {minCtcLikelyWrongUnit && (
                <div style={{ background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8, padding: 12, marginTop: 8 }}>
                  <div style={{ fontSize: 12.5, color: '#991b1b', lineHeight: 1.6, marginBottom: 10 }}>
                    That looks like it's in rupees, not lakhs. Did you mean <strong>₹{(parseFloat(form.min_expected_ctc) / 100000).toFixed(2)}L</strong>?
                  </div>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => set('min_expected_ctc', (parseFloat(form.min_expected_ctc) / 100000).toString())}>Fix automatically</button>
                </div>
              )}
              <div className="form-hint">The minimum you would consider moving for. Helps us filter out roles that don't meet your expectations.</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Languages Known</label>
            <TagSelect options={LANGUAGES} value={form.languages} onChange={v => set('languages', v)} />
          </div>

          <div className="form-group">
            <label className="form-label">Open to International Travel?</label>
            <TagSelect options={['Yes, frequently', 'Occasionally', 'No']} value={form.open_to_travel ? [form.open_to_travel] : []} onChange={v => set('open_to_travel', v[v.length-1] || '')} max={1} />
          </div>

          <div className="form-group">
            <label className="form-label">Valid Passport?</label>
            <TagSelect options={['Yes', 'No']} value={form.has_passport ? [form.has_passport] : []} onChange={v => set('has_passport', v[v.length-1] || '')} max={1} />
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
            if (Object.keys(form.skill_tree).length === 0) missing.push('skills')
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
              { label: 'Current Industry', value: (form.current_industry?.length ? form.current_industry : form.freelance_sector)?.join(', ') || '' },
              { label: 'Total CTC', value: ctcTotal ? '\u20b9' + ctcTotal.toFixed(1) + 'L' : '' },
              { label: 'Skill Areas', value: Object.keys(form.skill_tree).length ? Object.keys(form.skill_tree).length + ' added' : '' },
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
              What Are You Looking For? <span className="required">*</span>
              {!form.headline.trim() && <span style={{ fontSize: 10, fontWeight: 400, marginLeft: 6, color: 'var(--orange)', textTransform: 'none' }}>Fill this before submitting</span>}
            </label>
            <textarea className="form-textarea" maxLength={150}
              style={{ borderColor: !form.headline.trim() ? 'var(--orange)' : undefined }}
              placeholder="e.g. I'm looking for CHRO roles in mid-large Indian organizations. I'd also be open to HR Head roles in high-growth startups."
              value={form.headline} onChange={e => set('headline', e.target.value)} />
            <div className="form-hint flex-between">
              <span>No name, no employer</span>
              <span style={{ color: form.headline.length > 130 ? 'var(--orange)' : 'var(--grey-400)' }}>{form.headline.length}/150</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 600, marginTop: 4 }}>
              The more specific you are, the sharper we can match you — this isn't just a bio, it's what we compare recruiters' searches against
            </div>
            {form.headline.trim() && form.headline.trim().length < 40 && (
              <div style={{ fontSize: 11.5, color: 'var(--orange)', marginTop: 4 }}>
                This is quite short — a bit more detail on the roles, company type, or scale you want will get you noticed by the right recruiters more often.
              </div>
            )}
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
          {Object.keys(form.skill_tree).length === 0 && (
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
          <div style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '14px', marginBottom: 12 }}>
            <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.declaration_agreed}
                onChange={e => set('declaration_agreed', e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, accentColor: '#165D7B' }} />
              <span style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
                I confirm that all information provided is accurate to the best of my knowledge. StealthSideUp reserves the right to suspend or permanently restrict access to the platform if any declared information is found to be materially inaccurate during or after the recruitment process.
              </span>
            </label>
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
                , and I consent to my data being processed as described.
              </span>
            </label>
          </div>

          <LegalModal doc={showLegal} onClose={() => setShowLegal(null)} />

          {error && <div className="error-msg">{error}</div>}

          <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.headline.trim() || !form.job_search_status || !form.declaration_agreed || !form.privacy_consent_agreed}>
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
