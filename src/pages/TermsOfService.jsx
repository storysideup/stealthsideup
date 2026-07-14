import { TERMS_SECTIONS, LAST_UPDATED } from '../data/legalContent'

export default function TermsOfService({ onNavigate }) {
  return (
    <div className="page" style={{ paddingBottom: 60 }}>
      <button type="button" onClick={() => onNavigate('home')}
        style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, padding: 0 }}>
        ← Back
      </button>

      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>Terms of Service</h1>
      <p style={{ fontSize: 12, color: 'var(--grey-400)', marginBottom: 28 }}>Last updated: {LAST_UPDATED}</p>

      {TERMS_SECTIONS.map(({ title, body }) => (
        <div key={title} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--teal)', marginBottom: 10 }}>{title}</h2>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{body}</div>
        </div>
      ))}
    </div>
  )
}
