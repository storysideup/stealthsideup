import { INDUSTRIES } from '../data/formData'

// value is always an array. Pass single={true} only for legacy single-select use cases.
// otherValue/onOtherChange are optional — pass them to enable the free-text field that appears
// when "Other (please specify)" is selected.
export default function IndustrySelect({ value = [], onChange, single = false, otherValue = '', onOtherChange = null }) {
  const toggle = (item) => {
    if (single) { onChange(item); return; }
    if (value.includes(item)) onChange(value.filter(v => v !== item))
    else onChange([...value, item])
  }
  const showOtherInput = onOtherChange && (single ? value === 'Other (please specify)' : value.includes('Other (please specify)'))
  return (
    <div>
      {INDUSTRIES.map(group => (
        <div key={group.sector} className="industry-group">
          <div className="industry-group-label">{group.sector}</div>
          <div className="tag-cloud">
            {group.items.map(item => (
              <button key={item} type="button"
                className={`tag ${(single ? value === item : value.includes(item)) ? 'selected' : ''}`}
                onClick={() => toggle(item)}>{item}</button>
            ))}
          </div>
        </div>
      ))}
      {showOtherInput && (
        <input className="form-input" style={{ marginTop: 8 }} placeholder="Please specify your industry"
          value={otherValue} onChange={e => onOtherChange(e.target.value)} />
      )}
    </div>
  )
}
