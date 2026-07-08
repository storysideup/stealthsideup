import { useState } from 'react'

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

      // Convert to text for API
      const cvText = atob(base64)

      const response = await fetch('/api/ai-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: 'Read this CV. Extract top 8 skills with proof points. Return ONLY a JSON array, no markdown: [{"subFunction":"skill area","proficiency":"familiar or proficient or expert","specialisation":"specific area","proofPoint":"one achievement under 140 chars no company names","customDepth":"specific tool"}]. CV: ' + cvText.slice(0, 4000)
          }]
        })
      })
      if (!response.ok) throw new Error('API error ' + response.status)
      const data = await response.json()
      const rawText = data.content?.[0]?.text || ''
      const clean = rawText.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)

      // Handle both array (skills) and object (skills + profile data)
      const skillTree = Array.isArray(parsed) ? parsed : (parsed.skills || [])
      const profileData = Array.isArray(parsed) ? {} : parsed
      if (skillTree.length > 0 || profileData.current_industry) {
        onExtracted({
          skill_tree: skillTree,
          current_industry: profileData.current_industry || null,
          previous_industries: profileData.previous_industries || [],
          role_type: profileData.role_type || null,
          years_experience: profileData.years_experience || null,
        })
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
