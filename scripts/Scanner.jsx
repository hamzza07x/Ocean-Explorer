const RADIUS = 26
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function Scanner({ progress }) {
  if (!progress || progress <= 0) return null

  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <div className="scanner-ring" aria-hidden="true">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={RADIUS} className="scanner-ring-track" />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          className="scanner-ring-progress"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="scanner-ring-label">{Math.round(progress * 100)}%</div>
    </div>
  )
}
