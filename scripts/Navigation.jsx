export default function Navigation({ target, distance, angle, arrived, onCancel }) {
  if (!target) return null

  return (
    <div className="nav-hud glass-panel">
      <div className="nav-arrow" style={{ transform: `rotate(${angle}rad)` }} aria-hidden="true">
        {'\u25B2'}
      </div>
      <div className="nav-info">
        <div className="nav-target-name">{target.name}</div>
        <div className="nav-distance">{arrived ? 'Arrived' : `${distance}m`}</div>
      </div>
      <button type="button" className="nav-cancel" onClick={onCancel} aria-label="Cancel navigation">
        {'\u2715'}
      </button>
    </div>
  )
}
