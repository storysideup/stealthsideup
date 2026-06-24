import { useState } from 'react'
import { SKILL_TREE } from '../data/skillTree'

export default function CVUploadSection({ onExtracted }) {
  const [uploading, setUploading] = useState(false)
  const [extracted, setExtracted] = useState(false)
  const [error, setError] = useState('')
  const [showSection, setShowSection] = useState(true)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
      setError('Please upload a PDF, Word document, or text file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Get all skill options across all functions for the prompt
      const allSubFunctions = Object.entries(SKILL_TREE).map(([func, subs]) => ({
        function: func,
        subFunctions: Object.keys(subs)
      }))

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: file.type === 'application/pdf' ? 'document' : 'text',
                ...(file.type === 'application/pdf'
                  ? { source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
                  : { text: atob(base64) }
                )
              },
              {
                type: 'text',
                text: `Read this CV carefully. Extract the candidate's skills and for each skill provide a one-line proof point from their actual work experience.

Return ONLY a JSON array — no markdown, no explanation:
[
  {
    "subFunction": "exact sub-function name from this list only: ${allSubFunctions.flatMap(f => f.subFunctions).slice(0, 30).join(', ')}",
    "proficiency": "familiar or proficient or expert",
    "specialisation": "most relevant specialisation if clear from CV",
    "proofPoint": "one specific achievement that proves this skill — under 150 chars, no company names, use numbers where possible",
    "customDepth": "any specific tool or platform not in standard lists"
  }
]

Maximum 8 skill entries. Only include skills with clear evidence in the CV. Do not invent or assume skills.`
              }
            ]
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      if (Array.isArray(parsed) && parsed.length > 0) {
        onExtracted({ skill_tree: parsed })
        setExtracted(true)
        setShowSection(false)
      } else {
        setError('Could not extract skills from this CV. You can fill them in manually below.')
      }
    } catch (e) {
      console.error(e)
      setError('Something went wrong reading your CV. Please fill skills manually or try a different file format.')
    }

    setUploading(false)
  }

  if (!showSection) return (
    <div style={{ background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 600 }}>
        ✓ Skills extracted from your CV — review and edit below
      </div>
      <button type="button" onClick={() => { setShowSection(true); setExtracted(false) }}
        style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit' }}>
        Upload again
      </button>
    </div>
  )

  return (
    <div style={{ background: '#f9fafb', border: '1.5px solid var(--grey-200)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-800)', marginBottom: 4 }}>
        ⚡ Upload your CV — AI fills your skills instantly
      </div>
      <div style={{ fontSize: 12, color: 'var(--grey-600)', lineHeight: 1.65, marginBottom: 14 }}>
        Upload your CV and our AI will extract your skills and generate proof points from your actual experience. <strong>Your CV is never stored or shared with anyone</strong> — it is processed once and discarded.
      </div>

      {error && <div className="error-msg" style={{ marginBottom: 10 }}>{error}</div>}

      <label style={{
        display: 'block', border: '1.5px dashed var(--grey-300)', borderRadius: 8,
        padding: '16px', textAlign: 'center', cursor: 'pointer',
        background: uploading ? 'var(--grey-100)' : 'white'
      }}>
        <input type="file" accept=".pdf,.doc,.docx,.txt" onChange={handleFileUpload}
          style={{ display: 'none' }} disabled={uploading} />
        {uploading ? (
          <div>
            <div className="spinner" style={{ margin: '0 auto 8px', width: 24, height: 24, borderWidth: 2 }} />
            <div style={{ fontSize: 13, color: 'var(--grey-600)' }}>Reading your CV...</div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--teal)', marginBottom: 4 }}>
              Tap to upload CV
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey-400)' }}>PDF, Word or text file · Max 5MB</div>
          </div>
        )}
      </label>

      <button type="button" onClick={() => setShowSection(false)}
        style={{ background: 'none', border: 'none', fontSize: 12, color: 'var(--grey-400)', cursor: 'pointer', fontFamily: 'inherit', marginTop: 10, textDecoration: 'underline' }}>
        Skip — I'll fill skills manually
      </button>
    </div>
  )
}
