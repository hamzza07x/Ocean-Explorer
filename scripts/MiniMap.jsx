const SIZE = 140
const RANGE = 70

const CATEGORY_ICON = {
  animal: '\u25CF',
  object: '\u25A0'
}

export default function MiniMap({ data }) {
  if (!data) return null

  return (
    <div className="minimap glass-panel">
      <div className="minimap-inner" style={{ width: SIZE, height: SIZE }}>
        <div
          className="minimap-player"
          style={{ transform: `translate(-50%, -50%) rotate(${data.heading}rad)` }}
          aria-hidden="true"
        >
          {'\u25B2'}
        </div>
        {data.nearby.map((n) => {
          const left = SIZE / 2 + (n.dx / RANGE) * (SIZE / 2)
          const top = SIZE / 2 + (n.dz / RANGE) * (SIZE / 2)
          return (
            <span
              key={n.id}
              className="minimap-dot"
              style={{ left: `${left}px`, top: `${top}px` }}
              aria-hidden="true"
            >
              {CATEGORY_ICON[n.category] || '\u25CF'}
            </span>
          )
        })}
      </div>
    </div>
  )
}
