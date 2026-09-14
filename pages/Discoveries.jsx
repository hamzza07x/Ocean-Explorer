import { marineLife } from '../scripts/data.js'

export default function Discoveries() {
  return (
    <div className="page-container">
      <div className="page-header glass-panel">
        <h1>Discovery Log</h1>
        <p>0 / {marineLife.length} discovered</p>
      </div>
      <div className="discovery-grid">
        {marineLife.map((creature) => (
          <div key={creature.id} className="discovery-card glass-panel">
            <span className="discovery-name">{creature.name}</span>
            <span aria-hidden="true">🔒</span>
          </div>
        ))}
      </div>
    </div>
  )
}
