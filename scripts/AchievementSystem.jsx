import { achievements } from './data.js'

export default function AchievementSystem({ stats }) {
  return (
    <div className="achievement-grid">
      {achievements.map((a) => {
        const unlocked = a.check(stats)
        return (
          <div key={a.id} className={`achievement-badge glass-panel ${unlocked ? 'unlocked' : ''}`}>
            <div className="achievement-icon" aria-hidden="true">
              {a.icon}
            </div>
            <div className="achievement-title">{a.title}</div>
            <div className="achievement-description">{a.description}</div>
          </div>
        )
      })}
    </div>
  )
}
