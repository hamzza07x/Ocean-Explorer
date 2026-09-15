import { zones } from './data.js'

export default function OceanZones({ activeZoneId, onSelectZone, disabled }) {
  return (
    <div className="zone-list glass-panel">
      <div className="zone-list-label">ZONES</div>
      {zones.map((z) => (
        <button
          key={z.id}
          type="button"
          className={`zone-item ${z.id === activeZoneId ? 'active' : ''}`}
          onClick={() => onSelectZone(z.id)}
          disabled={disabled}
        >
          {z.name.replace(' Zone', '')}
        </button>
      ))}
    </div>
  )
}
