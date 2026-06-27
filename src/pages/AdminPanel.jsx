import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const ADMIN_PASSWORD = 'SSU@Admin2026'

const TABS = ['Overview', 'Corporates', 'Candidates', 'Tokens', 'Declines']

export default function AdminPanel() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [loading, setLoading] = useState(false)

  // Data
  const [stats, setStats] = useState(null)
  const [corporates, setCorporates] = useState([])
  const [candidates, setCandidates] = useState([])
  const [interests, setInterests] = useState([])
  const [tokenModal, setTokenModal] = useState(null)
  const [tokenAmount, setTokenAmount] = useState('')
  const [addingTokens, setAddingTokens] = useState(false)
  const [searchCorp, setSearchCorp] = useState('')
  const [searchCand, setSearchCand] = useState('')

  useEffect(() => {
    if (authed) loadAll()
  }, [authed])

  const loadAll = async () => {
    setLoading(true)
    const [
      { data: cands },
      { data: corps },
      { data: ints },
      { data: jds }
    ] = await Promise.all([
      supabase.from('candidates').select('*').order('created_at', { ascending: false }),
      supabase.from('corporates').select('*').order('created_at', { ascending: false }),
      supabase.from('interests').select('*').order('created_at', { ascending: false }),
      supabase.from('jds').select('*').order('created_at', { ascending: false })
    ])

    setCandidates(cands || [])
    setCorporates(corps || [])
    setInterests(ints || [])

    const cvSent = (ints || []).filter(i => i.status === 'cv_sent').length
    const totalTokensUsed = (ints || []).filter(i => i.status !== 'saved').length

    setStats({
      candidates: (cands || []).length,
      corporates: (corps || []).length,
      mandates: (jds || []).length,
      interests: (ints || []).length,
      cvSent,
      totalTokensUsed,
      activeCandidates: (cands || []).filter(c => c.is_active).length,
    })
    setLoading(false)
  }

  const handleAddTokens = async () => {
    if (!tokenAmount || isNaN(tokenAmount)) return
    setAddingTokens(true)
    const newTokens = (tokenModal.tokens || 0) + parseInt(tokenAmount)
    await supabase.from('corporates').update({
      tokens: newTokens,
      token_expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    }).eq('id', tokenModal.id)

    setCorporates(prev => prev.map(c => c.id === tokenModal.id ? { ...c, tokens: newTokens } : c))
    setTokenModal(null)
    setTokenAmount('')
    setAddingTokens(false)
  }

  const handleToggleCorpActive = async (corp) => {
    await supabase.from('corporates').update({ is_active: !corp.is_active }).eq('id', corp.id)
    setCorporates(prev => prev.map(c => c.id === corp.id ? { ...c, is_active: !corp.is_active } : c))
  }

  const handleToggleCandActive = async (cand) => {
    await supabase.from('candidates').update({ is_active: !cand.is_active }).eq('id', cand.id)
    setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, is_active: !cand.is_active } : c))
  }

  // Login screen
  if (!authed) return (
    <div style={{ minHeight: '100vh', background: '#0A3D35', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔐</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#0A3D35' }}>Admin Panel</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>StealthSideUp by StorySideUp</div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</label>
          <input
            type="password"
            style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (password === ADMIN_PASSWORD ? setAuthed(true) : setError('Wrong password'))}
            placeholder="Enter admin password"
          />
        </div>
        {error && <div style={{ color: '#991b1b', fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={() => password === ADMIN_PASSWORD ? setAuthed(true) : setError('Wrong password')}
          style={{ width: '100%', background: '#0A3D35', color: 'white', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          Login
        </button>
      </div>
    </div>
  )

  const filteredCorps = corporates.filter(c =>
    c.company_name?.toLowerCase().includes(searchCorp.toLowerCase()) ||
    c.work_email?.toLowerCase().includes(searchCorp.toLowerCase())
  )

  const filteredCands = candidates.filter(c =>
    c.primary_function?.toLowerCase().includes(searchCand.toLowerCase()) ||
    c.current_industry?.toLowerCase().includes(searchCand.toLowerCase()) ||
    c.headline?.toLowerCase().includes(searchCand.toLowerCase())
  )

  const declineReasons = {}
  interests.filter(i => i.decline_reasons?.length).forEach(i => {
    i.decline_reasons.forEach(r => {
      declineReasons[r] = (declineReasons[r] || 0) + 1
    })
  })
  const sortedDeclines = Object.entries(declineReasons).sort((a, b) => b[1] - a[1])

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ background: '#0A3D35', color: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>StealthSideUp Admin</div>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>StorySideUp Internal</div>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={loadAll} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 6, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔄 Refresh
          </button>
          <button onClick={() => setAuthed(false)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 6, padding: '6px 12px', color: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', display: 'flex', gap: 0 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 14, fontWeight: activeTab === tab ? 700 : 400,
            color: activeTab === tab ? '#0A3D35' : '#6b7280',
            borderBottom: activeTab === tab ? '2px solid #0A3D35' : '2px solid transparent',
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
        {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</div>}

        {/* OVERVIEW */}
        {!loading && activeTab === 'Overview' && stats && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
              {[
                { label: 'Total Candidates', value: stats.candidates, sub: `${stats.activeCandidates} active`, color: '#0A3D35' },
                { label: 'Total Corporates', value: stats.corporates, color: '#165D7B' },
                { label: 'Active Mandates', value: stats.mandates, color: '#7c3aed' },
                { label: 'Interests Expressed', value: stats.interests, color: '#FF9D52' },
                { label: 'CVs Sent', value: stats.cvSent, color: '#059669' },
                { label: 'Tokens Used', value: stats.totalTokensUsed, color: '#dc2626' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: 'white', borderRadius: 12, padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 4 }}>{label}</div>
                  {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
                </div>
              ))}
            </div>

            {/* Recent registrations */}
            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', marginBottom: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Recent Candidate Registrations</div>
              {candidates.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{c.primary_function || '—'}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 8 }}>{c.current_industry || '—'} · {c.years_experience || '—'} yrs</span>
                  </div>
                  <div style={{ color: '#9ca3af' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Recent Corporate Registrations</div>
              {corporates.slice(0, 5).map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6', fontSize: 13 }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#374151' }}>{c.company_name}</span>
                    <span style={{ color: '#9ca3af', marginLeft: 8 }}>{c.work_email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: '#EBF4F8', color: '#165D7B', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>{c.tokens || 0} tokens</span>
                    <span style={{ color: '#9ca3af' }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CORPORATES */}
        {!loading && activeTab === 'Corporates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>{filteredCorps.length} Corporates</div>
              <input placeholder="Search by company or email..." value={searchCorp} onChange={e => setSearchCorp(e.target.value)}
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 280 }} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['Company', 'Contact', 'Email', 'Tokens', 'Expiry', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCorps.map(corp => (
                    <tr key={corp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#374151' }}>{corp.company_name}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{corp.contact_person}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{corp.work_email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: (corp.tokens || 0) <= 2 ? '#fee2e2' : '#EBF4F8', color: (corp.tokens || 0) <= 2 ? '#dc2626' : '#165D7B', padding: '3px 10px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>
                          {corp.tokens || 0}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 12 }}>
                        {corp.token_expiry ? new Date(corp.token_expiry).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: corp.is_active ? '#d1fae5' : '#fee2e2', color: corp.is_active ? '#065f46' : '#991b1b', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                          {corp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setTokenModal(corp); setTokenAmount('') }}
                            style={{ background: '#0A3D35', color: 'white', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                            + Tokens
                          </button>
                          <button onClick={() => handleToggleCorpActive(corp)}
                            style={{ background: corp.is_active ? '#fee2e2' : '#d1fae5', color: corp.is_active ? '#dc2626' : '#065f46', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                            {corp.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CANDIDATES */}
        {!loading && activeTab === 'Candidates' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>{filteredCands.length} Candidates</div>
              <input placeholder="Search by function, industry or headline..." value={searchCand} onChange={e => setSearchCand(e.target.value)}
                style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '8px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', width: 320 }} />
            </div>
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {['SSU ID', 'Function', 'Industry', 'Experience', 'CTC', 'Status', 'Registered', 'Active'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredCands.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#165D7B', fontSize: 11 }}>SSU-{String(i + 1001)}</td>
                      <td style={{ padding: '12px 16px', color: '#374151', fontWeight: 600 }}>{c.primary_function || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{c.current_industry || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{c.years_experience || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280' }}>{c.ctc_total ? (parseFloat(c.ctc_total) >= 100 ? `₹${(parseFloat(c.ctc_total)/100).toFixed(1)}Cr` : `₹${c.ctc_total}L`) : '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: 11 }}>{c.job_search_status?.split('(')[0]?.trim() || '—'}</td>
                      <td style={{ padding: '12px 16px', color: '#9ca3af', fontSize: 11 }}>{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleToggleCandActive(c)}
                          style={{ background: c.is_active ? '#d1fae5' : '#fee2e2', color: c.is_active ? '#065f46' : '#991b1b', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700 }}>
                          {c.is_active ? 'Active' : 'Paused'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TOKENS */}
        {!loading && activeTab === 'Tokens' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 16 }}>Token Management</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {corporates.map(corp => (
                <div key={corp.id} style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>{corp.company_name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{corp.work_email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: (corp.tokens || 0) <= 2 ? '#dc2626' : '#0A3D35' }}>{corp.tokens || 0}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af' }}>tokens</div>
                    </div>
                  </div>
                  {corp.token_expiry && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 10 }}>
                      Expires: {new Date(corp.token_expiry).toLocaleDateString('en-IN')}
                    </div>
                  )}
                  <button onClick={() => { setTokenModal(corp); setTokenAmount('') }}
                    style={{ width: '100%', background: '#0A3D35', color: 'white', border: 'none', borderRadius: 7, padding: '9px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    + Add Tokens
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DECLINES */}
        {!loading && activeTab === 'Declines' && (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 6 }}>Decline Analytics</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Why candidates are not taking roles forward — visible only to you.</div>
            {sortedDeclines.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 12, padding: 40, textAlign: 'center', color: '#9ca3af' }}>No decline data yet.</div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb' }}>
                {sortedDeclines.map(([reason, count]) => (
                  <div key={reason} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ fontSize: 13, color: '#374151' }}>{reason}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 120, height: 6, background: '#f3f4f6', borderRadius: 3 }}>
                        <div style={{ width: `${(count / sortedDeclines[0][1]) * 100}%`, height: 6, background: '#FF9D52', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#374151', width: 24 }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Token Modal */}
      {tokenModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 380 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#374151', marginBottom: 4 }}>Add Tokens</div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
              {tokenModal.company_name} · Current balance: <strong>{tokenModal.tokens || 0} tokens</strong>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#4b5563', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tokens to add</label>
              <input type="number" min="1"
                style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 16, fontFamily: 'inherit', outline: 'none' }}
                placeholder="e.g. 25"
                value={tokenAmount}
                onChange={e => setTokenAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTokens()}
              />
              {tokenAmount && !isNaN(tokenAmount) && (
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                  New balance will be: <strong>{(tokenModal.tokens || 0) + parseInt(tokenAmount)} tokens</strong> · Valid 90 days
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[5, 10, 25, 50].map(n => (
                <button key={n} onClick={() => setTokenAmount(String(n))}
                  style={{ flex: 1, background: tokenAmount === String(n) ? '#0A3D35' : '#f3f4f6', color: tokenAmount === String(n) ? 'white' : '#374151', border: 'none', borderRadius: 7, padding: '8px 4px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                  +{n}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button onClick={() => { setTokenModal(null); setTokenAmount('') }}
                style={{ flex: 1, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={handleAddTokens} disabled={addingTokens || !tokenAmount || isNaN(tokenAmount)}
                style={{ flex: 2, background: '#0A3D35', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: !tokenAmount ? 0.5 : 1 }}>
                {addingTokens ? 'Adding...' : 'Confirm & Add Tokens'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
