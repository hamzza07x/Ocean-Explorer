export default function InformationPanel({ data, onClose, onNavigate }) {
  if (!data) return null

  return (
    <div className="info-panel glass-panel">
      <button type="button" className="info-panel-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <div className="info-panel-category">{data.category}</div>
      <h2>{data.name}</h2>
      {data.scientificName && <p className="info-panel-scientific">{data.scientificName}</p>}
      <p className="info-panel-description">{data.description}</p>
      <dl className="info-panel-stats">
        {data.depthMin !== undefined && (
          <div>
            <dt>Depth</dt>
            <dd>
              {data.depthMin}-{data.depthMax}m
            </dd>
          </div>
        )}
        {data.habitat && (
          <div>
            <dt>Habitat</dt>
            <dd>{data.habitat}</dd>
          </div>
        )}
        {data.diet && (
          <div>
            <dt>Diet</dt>
            <dd>{data.diet}</dd>
          </div>
        )}
        {data.size && (
          <div>
            <dt>Size</dt>
            <dd>{data.size}</dd>
          </div>
        )}
      </dl>
      {data.facts && data.facts.length > 0 && (
        <ul className="info-panel-facts">
          {data.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      )}
      {onNavigate && (
        <button type="button" className="info-panel-navigate" onClick={() => onNavigate(data)}>
          Navigate here
        </button>
      )}
    </div>
  )
}
