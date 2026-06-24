import { useState } from 'react'
import { CITIES_BY_ZONE, SPECIAL_LOCATIONS, NCR_CITIES } from '../data/formData'

// Corporate side — single city picker (specific)
export function CityPicker({ value, onChange }) {
  return (
    <div>
      <select className="form-select" value={value || ''} onChange={e => onChange(e.target.value)}>
        <option value="">Select city...</option>
        {Object.entries(CITIES_BY_ZONE).map(([zone, cities]) => (
          <optgroup key={zone} label={zone}>
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </optgroup>
        ))}
        <optgroup label="Other">
          {SPECIAL_LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </optgroup>
      </select>
      {value && NCR_CITIES.includes(value) && (
        <div className="form-hint" style={{ marginTop: 6 }}>
          NCR city selected — candidates open to nearby NCR cities will also be matched.
        </div>
      )}
    </div>
  )
}

// Candidate side — zone + city multi-select with nearby toggle
export function CandidateLocationPicker({ value = { cities: [], openToNearby: true }, onChange }) {
  const [showCities, setShowCities] = useState(false)

  const toggleCity = (city) => {
    const current = value.cities || []
    const updated = current.includes(city)
      ? current.filter(c => c !== city)
      : [...current, city]
    onChange({ ...value, cities: updated })
  }

  const toggleSpecial = (loc) => {
    const current = value.cities || []
    const updated = current.includes(loc)
      ? current.filter(c => c !== loc)
      : [...current, loc]
    onChange({ ...value, cities: updated })
  }

  const selectedCities = value.cities || []

  return (
    <div>
      {/* Selected summary */}
      {selectedCities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {selectedCities.map(city => (
            <button key={city} type="button"
              onClick={() => toggleCity(city)}
              style={{
                padding: '5px 10px', borderRadius: 6, border: '1.5px solid var(--teal)',
                background: 'var(--teal-light)', color: 'var(--teal)', fontSize: 12,
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', gap: 4
              }}>
              {city} <span style={{ fontSize: 14, lineHeight: 1 }}>×</span>
            </button>
          ))}
        </div>
      )}

      {/* City picker toggle */}
      <button type="button"
        onClick={() => setShowCities(s => !s)}
        style={{
          width: '100%', padding: '11px 13px', border: '1.5px solid var(--grey-200)',
          borderRadius: 8, background: 'white', cursor: 'pointer',
          fontFamily: 'inherit', fontSize: 14, color: 'var(--grey-600)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
        <span>{selectedCities.length === 0 ? 'Select preferred cities...' : `${selectedCities.length} city/cities selected`}</span>
        <span style={{ fontSize: 16, color: 'var(--grey-400)' }}>{showCities ? '−' : '+'}</span>
      </button>

      {showCities && (
        <div style={{ border: '1.5px solid var(--grey-200)', borderRadius: 8, padding: 14, marginTop: 8, background: 'var(--grey-50)' }}>
          {/* Special locations first */}
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Special</div>
          <div className="tag-cloud" style={{ marginBottom: 14 }}>
            {SPECIAL_LOCATIONS.map(loc => (
              <button key={loc} type="button"
                className={`tag ${selectedCities.includes(loc) ? 'selected' : ''}`}
                onClick={() => toggleSpecial(loc)}>{loc}</button>
            ))}
          </div>

          {/* Cities by zone */}
          {Object.entries(CITIES_BY_ZONE).map(([zone, cities]) => (
            <div key={zone} style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--grey-400)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>{zone}</div>
              <div className="tag-cloud">
                {cities.map(city => (
                  <button key={city} type="button"
                    className={`tag ${selectedCities.includes(city) ? 'selected' : ''}`}
                    onClick={() => toggleCity(city)}>{city}</button>
                ))}
              </div>
            </div>
          ))}

          <button type="button" className="btn-secondary btn-sm" style={{ marginTop: 4 }} onClick={() => setShowCities(false)}>Done</button>
        </div>
      )}

      {/* Open to nearby toggle — only if NCR or Mumbai region cities selected */}
      {selectedCities.some(c => ['Delhi', 'Noida', 'Gurgaon', 'Faridabad', 'Ghaziabad'].includes(c)) && (
        <div style={{ marginTop: 10, background: 'var(--teal-light)', border: '1px solid var(--teal-border)', borderRadius: 8, padding: '10px 13px' }}>
          <div style={{ fontSize: 12, color: 'var(--grey-600)', marginBottom: 8 }}>
            You have selected an NCR city. Are you open to roles anywhere in NCR (Delhi / Noida / Gurgaon / Faridabad / Ghaziabad)?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button"
              className={`tag ${value.openToNearby ? 'selected' : ''}`}
              onClick={() => onChange({ ...value, openToNearby: true })}>
              Yes, open to all NCR
            </button>
            <button type="button"
              className={`tag ${!value.openToNearby ? 'selected' : ''}`}
              onClick={() => onChange({ ...value, openToNearby: false })}>
              No, specific city only
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
