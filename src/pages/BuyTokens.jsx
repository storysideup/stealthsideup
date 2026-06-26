import { useState } from 'react'
import { supabase } from '../lib/supabase'

const TOKEN_PACKS = [
  { id: 'starter', tokens: 10, price: 3000, perToken: 300, label: 'Starter', popular: false },
  { id: 'growth', tokens: 25, price: 6500, perToken: 260, label: 'Growth', popular: true },
  { id: 'pro', tokens: 50, price: 11000, perToken: 220, label: 'Pro', popular: false },
  { id: 'scale', tokens: 100, price: 18000, perToken: 180, label: 'Scale', popular: false },
]

export default function BuyTokens({ corporate, onNavigate, onCorporateUpdate }) {
  const [selected, setSelected] = useState('growth')
  const [invoiceMode, setInvoiceMode] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({ company: corporate?.company_name || '', gst: '', email: corporate?.work_email || '', po: '' })
  const [invoiceSent, setInvoiceSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const selectedPack = TOKEN_PACKS.find(p => p.id === selected)

  // Demo payment — add tokens directly (replace with Razorpay later)
  const handleDemoPay = async () => {
    setLoading(true)
    const newTokens = (corporate.tokens || 0) + selectedPack.tokens
    const expiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    await supabase.from('corporates').update({
      tokens: newTokens,
      token_expiry: expiry
    }).eq('id', corporate.id)
    onCorporateUpdate({ ...corporate, tokens: newTokens, token_expiry: expiry })
    setLoading(false)
    onNavigate('corporate-dashboard')
  }

  const handleInvoiceRequest = async () => {
    setLoading(true)
    // Send email to Dora via Resend
    try {
      await fetch('/api/send-invoice-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: invoiceForm.company,
          gst: invoiceForm.gst,
          email: invoiceForm.email,
          po: invoiceForm.po,
          pack: selectedPack,
          corporateId: corporate.id
        })
      })
    } catch {}
    setInvoiceSent(true)
    setLoading(false)
  }

  if (invoiceSent) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
      <div className="success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="#165D7B" strokeWidth="2.5" width="32" height="32">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--teal)', marginBottom: 10 }}>Invoice Request Sent</h2>
      <p style={{ fontSize: 13, color: 'var(--grey-600)', lineHeight: 1.7, marginBottom: 24 }}>
        We will send you a formal invoice within 24 hours. Once payment is confirmed, your tokens will be added to your account immediately.
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
          Tokens are valid for <strong>90 days</strong> from purchase. Buy as many or as few as you need — no monthly commitment.
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
            With <strong>{selectedPack.tokens} tokens</strong> you can express interest in up to <strong>{selectedPack.tokens} candidate profiles</strong>. Valid for 90 days from purchase. Your balance after purchase: <strong>{(corporate?.tokens || 0) + selectedPack.tokens} tokens</strong>.
          </div>
        </div>
      )}

      {!invoiceMode ? (
        <>
          {/* Pay now — demo mode */}
          <div style={{ background: '#fff8f0', border: '1px solid var(--orange-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--orange)' }}>Beta mode:</strong> Payment gateway coming soon. Click below to add tokens to your account for testing.
            </div>
          </div>
          <button className="btn-primary" onClick={handleDemoPay} disabled={loading}>
            {loading ? 'Adding tokens...' : `Add ${selectedPack?.tokens} Tokens — ₹${selectedPack?.price.toLocaleString('en-IN')} + GST`}
          </button>
          <div className="mt-4">
            <button type="button" onClick={() => setInvoiceMode(true)}
              style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              Need an invoice for your finance team? Click here →
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 16 }}>Invoice Details</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company / Legal Entity Name</label>
              <input className="form-input" value={invoiceForm.company} onChange={e => setInvoiceForm(f => ({ ...f, company: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">GSTIN</label>
              <input className="form-input" placeholder="22AAAAA0000A1Z5" value={invoiceForm.gst} onChange={e => setInvoiceForm(f => ({ ...f, gst: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Billing Email</label>
              <input className="form-input" type="email" value={invoiceForm.email} onChange={e => setInvoiceForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">PO Number (optional)</label>
              <input className="form-input" placeholder="If your finance team has raised a PO" value={invoiceForm.po} onChange={e => setInvoiceForm(f => ({ ...f, po: e.target.value }))} />
            </div>
          </div>
          <button className="btn-primary" onClick={handleInvoiceRequest} disabled={loading || !invoiceForm.company || !invoiceForm.email}>
            {loading ? 'Sending...' : 'Request Invoice'}
          </button>
          <div className="mt-4">
            <button type="button" onClick={() => setInvoiceMode(false)}
              style={{ background: 'none', border: 'none', color: 'var(--grey-400)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back to pay now
            </button>
          </div>
        </>
      )}
    </div>
  )
}
