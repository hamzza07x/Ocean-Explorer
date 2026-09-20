import { marineLife, worldObjects, zones } from './data.js'

function StatRow({ label, value }) {
  return (
    <div className="stat-row">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}

export default function Statistics({ stats }) {
  const totalEntries = stats.totalAnimals + stats.totalObjects
  const overallPct = totalEntries > 0 ? Math.round((stats.discoveredTotal / totalEntries) * 100) : 0
  const allEntries = [...marineLife, ...worldObjects]

  return (
    <div className="stats-panel">
      <div className="stats-grid">
        <StatRow label="Creatures discovered" value={`${stats.animalCount} / ${stats.totalAnimals}`} />
        <StatRow label="Objects discovered" value={`${stats.objectCount} / ${stats.totalObjects}`} />
        <StatRow label="Zones visited" value={`${stats.visitedZones.length} / ${zones.length}`} />
        <StatRow label="Journal entries" value={stats.journalCount} />
        <StatRow label="Maximum depth" value={`${stats.maxDepthReached}m`} />
      </div>

      <div className="stats-progress-label">
        Exploration Progress
        <span>{overallPct}%</span>
      </div>
      <div className="zone-completion-bar">
        <div className="zone-completion-fill" style={{ width: `${overallPct}%` }} />
      </div>

      <div className="stats-zones-title">Zone Completion</div>
      <div className="zone-completion-list">
        {zones.map((z) => {
          const zoneEntries = allEntries.filter((e) => e.zone === z.id)
          const zoneDiscovered = zoneEntries.filter((e) => stats.discovered[e.id]).length
          const pct = zoneEntries.length > 0 ? Math.round((zoneDiscovered / zoneEntries.length) * 100) : 0
          return (
            <div key={z.id} className="zone-completion-row">
              <div className="zone-completion-header">
                <span>{z.name}</span>
                <span>
                  {zoneDiscovered} / {zoneEntries.length}
                </span>
              </div>
              <div className="zone-completion-bar">
                <div className="zone-completion-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
