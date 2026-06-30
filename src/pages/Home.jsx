import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function CollapsibleSection({ title, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ marginBottom: 24 }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '0 0 10px'
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{title}</div>
        <span style={{ fontSize: 18, color: '#9ca3af', fontWeight: 700 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ background: '#EBF4F8', border: '1px solid #B8D8E8', borderRadius: 12, padding: '16px' }}>
          {children}
        </div>
      )}
    </div>
  )
}

const LOGO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAIAAABEtEjdAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFsWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTA2LTI1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkRhdGE+eyZxdW90O2RvYyZxdW90OzomcXVvdDtEQUhObDhZRDFlbyZxdW90OywmcXVvdDt1c2VyJnF1b3Q7OiZxdW90O1VBQlFYcUVoRHB3JnF1b3Q7LCZxdW90O2JyYW5kJnF1b3Q7OiZxdW90O0JBQlFYcHI3OVdrJnF1b3Q7LCZxdW90O3RlbXBsYXRlJnF1b3Q7OiZxdW90O0JsdWUgTW9kZXJuIENvbnN1bHRpbmcgTG9nbyZxdW90O308L0F0dHJpYjpEYXRhPgogICAgIDxBdHRyaWI6RXh0SWQ+ODM5MjMzYjctYjc5NC00N2FhLTlhNGItYjcxYTcxMzZiM2NlPC9BdHRyaWI6RXh0SWQ+CiAgICAgPEF0dHJpYjpGYklkPjUyNTI2NTkxNDE3OTU4MDwvQXR0cmliOkZiSWQ+CiAgICAgPEF0dHJpYjpUb3VjaFR5cGU+MjwvQXR0cmliOlRvdWNoVHlwZT4KICAgIDwvcmRmOmxpPgogICA8L3JkZjpTZXE+CiAgPC9BdHRyaWI6QWRzPgogPC9yZGY6RGVzY3JpcHRpb24+CgogPHJkZjpEZXNjcmlw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444Ev9uwvd3Q9ZNb3XCHL+ma2jvXvr5uxH6WEoYHhDuAjQfzzlTUvvTAmozEWLlqKKlp+NFfN+4dMddPDp3CyrqNB/P+tiOXZ+r6+vPne0+UVv3u3lWJUWEylnGg8Pzjb28oqWmQsQZyC88IdwCFlXXX/eq1O7IyHlkxP3Vs5HB2faG+8d1th97Yst8jLjlRDovVajSZ9UZTQ0t7bXNraU1DXlnVrlPFxTW8UYlj+wpKFv3klYeunXfvstnS75zsqhPnq/78+d5/55wc5n5piKgi7v6p3DW4bH5qwspZk7MmJyREjnbp+2icZ7VaKxqa9hWUfnX0zJdHC5z/Xici6dQq1YqM1OUZE+enxseOHiXx5pFXYbZYzlXX784v/vTgqUNFZUPUC8nCI8P9slH+vunxY8ZHhkaHBAX5+frotJrBfp+YyWIxGE1tnYbaptby+sajxRUcNCAlCA8OyEiMjQsLiRwVGODr7a3Tagd7QGMFzGZLZ5expUNf3dhSWttwrKSC5zxE5dnhTkREDil9KiQREQ0Cw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiATHciYgExHAnIhIQw52ISEAMdyIiAf0/uVSQ6N1R2nYAAAAASUVORK5CYII="

export default function Home({ onNavigate }) {
  const [howTab, setHowTab] = useState('candidate')
  const [livePostings, setLivePostings] = useState([])

  useEffect(() => {
    const loadPostings = async () => {
      try {
        const { data } = await supabase
          .from('jds')
          .select('role_title, function, location, ctc_fixed_min, ctc_fixed_max, industry, seniority_level, stealth_mode')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(4)
        setLivePostings(data || [])
      } catch (e) { console.error(e) }
    }
    loadPostings()
  }, [])

  const candidateSteps = [
    { num: '1', icon: '👤', label: 'Register', desc: 'Create an anonymous profile — no name, no employer, no photo' },
    { num: '2', icon: '🔍', label: 'Get Matched', desc: 'We match your skills and experience to live roles in the background' },
    { num: '3', icon: '👁️', label: 'See Who It Is', desc: 'Get a WhatsApp with full company details — before they know anything about you' },
    { num: '4', icon: '📧', label: 'Connect', desc: 'Say yes, upload your CV — it goes directly to the recruiter. You take it from there.' },
  ]

  const employerSteps = [
    { num: '1', icon: '📋', label: 'Post a Search', desc: 'Upload your JD — our AI fills the form. Standard or stealth mode.' },
    { num: '2', icon: '👥', label: 'See Matched Profiles', desc: 'Anonymous profiles matched to your criteria — skills, experience, location, CTC' },
    { num: '3', icon: '💬', label: 'Express Interest', desc: 'Select profiles you like. We notify the candidate on your behalf.' },
    { num: '4', icon: '📧', label: 'CV in Your Inbox', desc: 'Candidate says yes — they upload their CV and it lands directly in your inbox.' },
  ]

  const steps = howTab === 'candidate' ? candidateSteps : employerSteps

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh', fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(160deg, #165D7B 0%, #165D7B 100%)', padding: '32px 20px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>by StorySideUp</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.5px' }}>
          India's first anonymous talent platform.
        </h1>
        <p style={{ fontSize: 15, color: '#E8621A', fontWeight: 600, lineHeight: 1.5, margin: 0 }}>
          For those who are curious, not desperate.
        </p>
      </div>

      {/* TWO PATH CARDS — float over hero */}
      <div style={{ padding: '0 16px', marginTop: -24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

          {/* CANDIDATE */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 14px', boxShadow: '0 4px 24px rgba(22,93,123,0.12)', border: '1px solid rgba(22,93,123,0.06)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>👤</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#165D7B', marginBottom: 4, lineHeight: 1.2 }}>Candidate</div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>Explore opportunities without anyone knowing</div>
            <button onClick={() => onNavigate('register')} style={{
              width: '100%', background: '#165D7B', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 8px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, boxShadow: '0 2px 8px rgba(22,93,123,0.2)'
            }}>Register Anonymously</button>
            <button onClick={() => onNavigate('candidate-profile')} style={{
              width: '100%', background: 'transparent', color: '#165D7B',
              border: '1.5px solid #165D7B', borderRadius: 8, padding: '9px 8px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>View My Profile</button>
          </div>

          {/* EMPLOYER */}
          <div style={{ background: 'white', borderRadius: 16, padding: '20px 14px', boxShadow: '0 4px 24px rgba(255,157,82,0.12)', border: '1px solid rgba(255,157,82,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>🏢</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#165D7B', marginBottom: 4, lineHeight: 1.2 }}>Employer</div>
            <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>Find talent matched to your skills requirement</div>
            <button onClick={() => onNavigate('corporate-login')} style={{
              width: '100%', background: '#FF9D52', color: 'white', border: 'none',
              borderRadius: 8, padding: '10px 8px', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: 8, boxShadow: '0 2px 8px rgba(255,157,82,0.25)'
            }}>Post a Search</button>
            <button onClick={() => onNavigate('corporate-login')} style={{
              width: '100%', background: 'transparent', color: '#FF9D52',
              border: '1.5px solid #FF9D52', borderRadius: 8, padding: '9px 8px',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
            }}>Employer Login</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 20px 0' }}>

        {/* LIVE POSTINGS TEASER */}
        {livePostings.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
              Live on the platform right now
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {livePostings.map((jd, i) => (
                <div key={i} style={{
                  background: 'white', borderRadius: 12, padding: '14px 16px',
                  boxShadow: '0 2px 8px rgba(22,93,123,0.06)', border: '1px solid rgba(22,93,123,0.06)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#165D7B', marginBottom: 4 }}>
                      {jd.stealth_mode ? jd.function : (jd.role_title || jd.function)}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>
                      {jd.industry || 'Industry confidential'} · {jd.location || 'Location flexible'}
                      {jd.ctc_fixed_min && jd.ctc_fixed_max && ` · ₹${jd.ctc_fixed_min}–${jd.ctc_fixed_max}L`}
                    </div>
                  </div>
                  <span style={{
                    background: '#EBF4F8', color: '#165D7B', fontSize: 10, fontWeight: 700,
                    padding: '4px 9px', borderRadius: 10, flexShrink: 0, textTransform: 'uppercase', letterSpacing: 0.3
                  }}>Live</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
              Register to see if you match — and to discover roles not shown here.
            </div>
          </div>
        )}

        {/* HOW IT WORKS */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>How it works</div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {['candidate', 'employer'].map(tab => (
              <button key={tab} type="button" onClick={() => setHowTab(tab)} style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                background: howTab === tab ? 'white' : 'transparent',
                color: howTab === tab ? '#165D7B' : '#9ca3af',
                boxShadow: howTab === tab ? '0 1px 6px rgba(0,0,0,0.08)' : 'none'
              }}>
                {tab === 'candidate' ? '👤 For Candidates' : '🏢 For Employers'}
              </button>
            ))}
          </div>

          {/* Steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, alignItems: 'flex-start',
                background: 'white', borderRadius: 12, padding: '14px 14px',
                boxShadow: '0 2px 8px rgba(22,93,123,0.06)',
                border: '1px solid rgba(22,93,123,0.06)'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i === 0 ? '#165D7B' : i === steps.length - 1 ? '#FF9D52' : '#EBF4F8',
                  border: i === 0 ? 'none' : i === steps.length - 1 ? 'none' : '1.5px solid #B8D8E8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: i === 0 || i === steps.length - 1 ? 13 : 15
                }}>
                  {i === 0 || i === steps.length - 1 ? (
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 12 }}>{step.num}</span>
                  ) : step.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#165D7B', marginBottom: 3 }}>{step.label}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 1, background: '#e5e7eb', marginBottom: 32 }} />

        {/* ABOUT US */}
        <CollapsibleSection title="About Us — Who We Are & Why We Built This">
          <div style={{ fontSize: 13, fontWeight: 700, color: '#165D7B', marginBottom: 8 }}>StorySideUp</div>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: '0 0 12px' }}>
            StorySideUp is a boutique HR practice based in Delhi NCR. We work with candidates and organisations on hiring, coaching, assessments and HR consulting across multiple industries.
          </p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: '0 0 12px' }}>
            As a hiring professional for over 20 years, I have sat across both sides of this problem. Companies spend weeks sifting through hundreds of CVs to find the three people they actually wanted to speak to. And those three people had no idea they were being looked for — because they were busy doing their jobs, not updating their profiles on job boards.
          </p>
          <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.75, margin: 0 }}>
            Your CV is not the problem — it is what is happening to it. It is getting rejected before it reaches the right person, filtered by algorithms, buried in inboxes, or simply never seen. StealthSideUp removes the CV from the equation entirely. Your experience, your skills and your preferences speak directly to the right role — no gatekeeping, no guesswork.
          </p>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #B8D8E8' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#165D7B' }}>Dora Harsh Suri</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Founder, StorySideUp · ICF ACC Coach · Hogan Advanced Assessor · 20+ years in Executive Search</div>
          </div>
        </CollapsibleSection>

        <div style={{ height: 1, background: '#e5e7eb', marginBottom: 32 }} />

        {/* CONTACT */}
        <div style={{ marginBottom: 100 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Get in Touch</div>
          <div style={{ background: 'white', borderRadius: 14, padding: '16px', boxShadow: '0 2px 12px rgba(22,93,123,0.06)', border: '1px solid rgba(22,93,123,0.06)' }}>
            {[
              { icon: '✉️', label: 'Email', value: 'dorasuri@storysideup.com', href: 'mailto:dorasuri@storysideup.com' },
              { icon: '💼', label: 'LinkedIn', value: 'StorySideUp', href: 'https://www.linkedin.com/company/story-side-up/' },
              { icon: '🌐', label: 'Website', value: 'storysideup.netlify.app', href: 'https://storysideup.netlify.app' },
            ].map(({ icon, label, value, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                borderBottom: '1px solid #f3f4f6', textDecoration: 'none'
              }}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 1 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#165D7B' }}>{value}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 16 }}>→</span>
              </a>
            ))}
          </div>
        </div>

        {/* TRUST / SOCIAL PROOF */}
        <div style={{ marginBottom: 100 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>
            Built by someone who has done this for 20 years
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #165D7B 0%, #0F4A61 100%)', borderRadius: 16,
            padding: '24px 20px', boxShadow: '0 4px 20px rgba(22,93,123,0.18)'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {[
                { value: '20+', label: 'Years in Executive Search & Talent Strategy' },
                { value: '1000+', label: 'Candidates Interviewed Across Levels & Functions' },
                { value: 'MBA — HR', label: 'Specialised Postgraduate Qualification' },
                { value: '12+', label: 'Industries — BFSI, Retail, Fashion, Manufacturing, Events & More' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 2 }}>{value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 16 }} />
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 }}>
              HR & talent work done in organisations like
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Eicher Motors', 'Airtel', 'Reliance Retail', 'Gaurav Gupta Studio', 'Wizard Events', 'Cognitio Analytics', 'Duke Pumps'].map(name => (
                <span key={name} style={{
                  fontSize: 11, color: 'white', background: 'rgba(255,255,255,0.12)',
                  padding: '5px 11px', borderRadius: 20, fontWeight: 600
                }}>{name}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
      {/* Footer */}
      <div style={{ padding: '24px 20px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 8 }}>
          <button onClick={() => onNavigate('privacy')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Privacy Policy</button>
          <button onClick={() => onNavigate('terms')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Terms of Service</button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>© 2026 StorySideUp · stealthsideup.com</div>
      </div>
    </div>
  )
}
