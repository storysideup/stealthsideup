import { PRIVACY_POLICY_SECTIONS, TERMS_SECTIONS, LAST_UPDATED } from '../data/legalContent'

// doc is 'privacy' or 'terms'. Renders as an overlay so it never navigates away from
// whatever form the person is filling in — that would otherwise unmount it and lose
// everything they've typed, since this app doesn't persist in-progress form state
// across page navigation.
export default function LegalModal({ doc, onClose }) {
  if (!doc) return null
  const sections = doc === 'privacy' ? PRIVACY_POLICY_SECTIONS : TERMS_SECTIONS
  const title = doc === 'privacy' ? 'Privacy Policy' : 'Terms of Service'

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '16px 16px 0 0', width: '100%', maxWidth: 480,
          maxHeight: '85vh', overflowY: 'auto', padding: '20px 20px 32px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)', margin: 0 }}>{title}</h2>
          <button type="button" onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, color: 'var(--grey-400)', cursor: 'pointer', lineHeight: 1, padding: 4 }}>
            ×
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 20 }}>Last updated: {LAST_UPDATED}</p>

        {sections.map(({ title: sTitle, body }) => (
          <div key={sTitle} style={{ marginBottom: 22 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--teal)', marginBottom: 8 }}>{sTitle}</h3>
            <div style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{body}</div>
          </div>
        ))}

        <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%', marginTop: 4 }}>
          Close
        </button>
      </div>
    </div>
  )
}
