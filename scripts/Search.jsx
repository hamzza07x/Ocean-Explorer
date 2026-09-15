import { useState, useMemo } from 'react'
import { marineLife, worldObjects, zones } from './data.js'

const ALL_ENTRIES = [
  ...marineLife.map((e) => ({ ...e, kind: 'animal' })),
  ...worldObjects.map((e) => ({ ...e, kind: 'object' }))
]

export default function Search({ onSelect, onClose }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [zoneFilter, setZoneFilter] = useState('all')

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_ENTRIES.filter((entry) => {
      if (category !== 'all' && entry.kind !== category) return false
      if (zoneFilter !== 'all' && entry.zone !== zoneFilter) return false
      if (!q) return true
      return (
        entry.name.toLowerCase().includes(q) ||
        (entry.scientificName && entry.scientificName.toLowerCase().includes(q))
      )
    })
  }, [query, category, zoneFilter])

  return (
    <div className="search-panel glass-panel">
      <div className="search-panel-header">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search marine life and objects"
          className="search-input"
          autoFocus
        />
        <button type="button" className="search-close" onClick={onClose} aria-label="Close search">
          ✕
        </button>
      </div>
      <div className="search-filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
          <option value="all">All categories</option>
          <option value="animal">Animals</option>
          <option value="object">Objects</option>
        </select>
        <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} aria-label="Filter by zone">
          <option value="all">All zones</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name}
            </option>
          ))}
        </select>
      </div>
      <div className="search-results">
        {results.length === 0 && <p className="search-empty">No matches.</p>}
        {results.map((entry) => (
          <button key={entry.id} type="button" className="search-result" onClick={() => onSelect(entry)}>
            <span>{entry.name}</span>
            <span className="search-result-zone">
              {zones.find((z) => z.id === entry.zone)?.name.replace(' Zone', '')}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
