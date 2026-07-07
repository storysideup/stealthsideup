import { INDUSTRIES } from '../data/formData'

// value is always an array. Pass single={true} only for legacy single-select use cases.
export default function IndustrySelect({ value = [], onChange, single = false }) {
  const toggle = (item) => {
    if (single) { onChange(item); return; }
    if (value.includes(item)) onChange(value.filter(v => v !== item))
    else onChange([...value, item])
  }
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
    </div>
  )
}
