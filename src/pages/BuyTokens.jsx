import { useState } from 'react'

const TOKEN_PACKS = [
  { id: 'starter', tokens: 10, price: 3000, perToken: 300, label: 'Starter', popular: false },
  { id: 'growth', tokens: 25, price: 6500, perToken: 260, label: 'Growth', popular: true },
  { id: 'pro', tokens: 50, price: 11000, perToken: 220, label: 'Pro', popular: false },
  { id: 'scale', tokens: 100, price: 18000, perToken: 180, label: 'Scale', popular: false },
]

export default function BuyTokens({ corporate, onNavigate, onCorporateUpdate }) {
  const [selected, setSelected] = useState('growth')
  const [needsInvoice, setNeedsInvoice] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ company: corporate?.company_name || '', gst: '', email: corporate?.work_email || '', po: '' })
  const [requestSent, setRequestSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedPack = TOKEN_PACKS.find(p => p.id === selected)

  const handleRequestPurchase = async () => {
    if (!invoiceForm.company.trim() || !invoiceForm.email.trim()) {
      setError('Company name and billing email are required'); return
    }
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/send-invoice-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: invoiceForm.company,
          gst: invoiceForm.gst,
          email: invoiceForm.email,
          po: invoiceForm.po,
          pack: selectedPack,
          corporateId: corporate.id,
          needsInvoice
        })
      })
      if (!response.ok) throw new Error('Request failed')
      setRequestSent(true)
    } catch (e) {
      setError('Could not send your request. Please try again, or reach out to us directly.')
    }
    setLoading(false)
  }

  if (requestSent) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>Request Sent</h2>
      <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.7, marginBottom: 24 }}>
        We've received your request for <strong>{selectedPack?.tokens} tokens</strong>. We'll follow up shortly by email with payment details{needsInvoice ? ' and your formal invoice' : ''}. Tokens are added to your account as soon as payment is confirmed.
      </p>
      <button className="btn-secondary" onClick={() => onNavigate('corporate-dashboard')}>Back to Dashboard</button>
    </div>
  )

  return (
    <div className="page">
      <button type="button" onClick={() => onNavigate('corporate-dashboard')}
        style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16, padding: 0 }}>
        ← Back
      </button>

      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 6 }}>Buy Tokens</h2>

      {/* What is a token */}
      <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 12, padding: '14px 16px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>💡 How tokens work</div>
        <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.75 }}>
          A token is a credit you use when you want to reach out to a matched candidate.
          <br /><br />
          When you browse matched profiles and find someone you like, clicking <strong>"Express Interest"</strong> uses 1 token. This sends a notification to the candidate — they decide whether to share their CV and contact details with you.
          <br /><br />
          <strong>You only spend a token when you actively choose to reach out.</strong> Browsing profiles, shortlisting, and marking "Not a fit" are all free.
          <br /><br />
          Buy as many or as few as you need — no monthly commitment.
        </div>
      </div>

      {/* Current balance */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, padding: '10px 14px', background: 'var(--grey-50)', borderRadius: 8, border: '1px solid var(--grey-200)' }}>
        <span style={{ fontSize: 13, color: 'var(--grey-600)' }}>Current balance</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--teal)' }}>{corporate?.tokens || 0} tokens</span>
      </div>

      {/* Pack selection */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Select a pack</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {TOKEN_PACKS.map(pack => (
          <button key={pack.id} type="button"
            onClick={() => setSelected(pack.id)}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', border: selected === pack.id ? '2px solid var(--teal)' : '1.5px solid var(--grey-200)',
              borderRadius: 12, background: selected === pack.id ? 'var(--teal-light)' : 'white',
              cursor: 'pointer', fontFamily: 'inherit', position: 'relative'
            }}>
            {pack.popular && (
              <div style={{
                position: 'absolute', top: -10, right: 14, background: 'var(--orange)',
                color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 8px',
                borderRadius: 10, letterSpacing: 0.5
              }}>MOST POPULAR</div>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: selected === pack.id ? 'var(--teal)' : 'var(--grey-800)' }}>
                {pack.tokens} tokens
              </div>
              <div style={{ fontSize: 12, color: 'var(--grey-400)', marginTop: 2 }}>₹{pack.perToken} per token · {pack.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: selected === pack.id ? 'var(--teal)' : 'var(--grey-800)' }}>
                ₹{pack.price.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>+ GST</div>
            </div>
          </button>
        ))}
      </div>

      {/* After purchase — what you can do */}
      {selectedPack && (
        <div style={{ background: '#f9fafb', border: '1px solid var(--grey-200)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.7 }}>
            With <strong>{selectedPack.tokens} tokens</strong> you can express interest in up to <strong>{selectedPack.tokens} candidate profiles</strong>. Your balance after purchase: <strong>{(corporate?.tokens || 0) + selectedPack.tokens} tokens</strong>.
          </div>
        </div>
      )}

      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 16 }}>Your Details</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Company / Legal Entity Name <span className="required">*</span></label>
          <input className="form-input" value={invoiceForm.company} onChange={e => setInvoiceForm(f => ({ ...f, company: e.target.value }))} />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Billing Email <span className="required">*</span></label>
          <input className="form-input" type="email" value={invoiceForm.email} onChange={e => setInvoiceForm(f => ({ ...f, email: e.target.value }))} />
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
        <input type="checkbox" checked={needsInvoice} onChange={e => setNeedsInvoice(e.target.checked)} style={{ width: 16, height: 16 }} />
        <span style={{ fontSize: 13, color: 'var(--grey-800)' }}>I need a formal invoice for my finance team</span>
      </label>

      {needsInvoice && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, paddingLeft: 4, borderLeft: '2px solid var(--teal-border)', paddingTop: 2, paddingBottom: 2 }}>
          <div className="form-group" style={{ marginBottom: 0, paddingLeft: 12 }}>
            <label className="form-label">GSTIN</label>
            <input className="form-input" placeholder="22AAAAA0000A1Z5" value={invoiceForm.gst} onChange={e => setInvoiceForm(f => ({ ...f, gst: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0, paddingLeft: 12 }}>
            <label className="form-label">PO Number (optional)</label>
            <input className="form-input" placeholder="If your finance team has raised a PO" value={invoiceForm.po} onChange={e => setInvoiceForm(f => ({ ...f, po: e.target.value }))} />
          </div>
        </div>
      )}

      <div style={{ background: '#f9fafb', border: '1px solid var(--grey-200)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
          We'll follow up by email with payment details{needsInvoice ? ' and your invoice' : ''}. Tokens are added to your account as soon as payment is confirmed — no card details needed here.
        </div>
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 12 }}>{error}</div>}

      <button className="btn-primary" onClick={handleRequestPurchase} disabled={loading}>
        {loading ? 'Sending request...' : `Request ${selectedPack?.tokens} Tokens — ₹${selectedPack?.price.toLocaleString('en-IN')} + GST`}
      </button>
    </div>
  )
}
