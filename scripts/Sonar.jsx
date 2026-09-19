export default function Sonar({ onSweep, results }) {
  return (
    <>
      <button type="button" className="sonar-toggle glass-panel" onClick={onSweep}>
        Sonar
      </button>
      {results && (
        <div className="sonar-panel glass-panel">
          <div className="sonar-panel-title">Sonar Pulse</div>
          {results.length === 0 && <p className="sonar-empty">Nothing in range.</p>}
          {results.map((r) => (
            <div key={r.id} className="sonar-result">
              <span>{r.name}</span>
              <span className="sonar-result-distance">{r.distance}m</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
