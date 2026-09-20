import { missions } from './data.js'

export default function MissionSystem({ stats }) {
  return (
    <div className="mission-list">
      {missions.map((m) => {
        const complete = m.check(stats)
        return (
          <div key={m.id} className={`mission-card glass-panel ${complete ? 'complete' : ''}`}>
            <span className="mission-status" aria-hidden="true">
              {complete ? '\u2713' : '\u25CB'}
            </span>
            <div className="mission-body">
              <div className="mission-title">{m.title}</div>
              <div className="mission-description">{m.description}</div>
              {m.progressLabel && <div className="mission-progress">{m.progressLabel(stats)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
