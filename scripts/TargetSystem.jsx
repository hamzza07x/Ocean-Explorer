export default function TargetSystem({ target, isTouch, scanning }) {
  if (!target) return null

  return (
    <div className="target-lock">
      <div className="target-lock-name">{target.name}</div>
      <div className="target-lock-hint">
        {scanning ? 'Scanning...' : isTouch ? 'Tap Scan to inspect' : 'Hold E to scan, or click'}
      </div>
    </div>
  )
}
