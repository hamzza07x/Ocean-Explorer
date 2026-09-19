export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-title">Ocean Explorer</div>
      <div className="loading-subtitle">Initializing dive systems...</div>
      <div className="loading-bar">
        <div className="loading-bar-fill" />
      </div>
    </div>
  )
}
