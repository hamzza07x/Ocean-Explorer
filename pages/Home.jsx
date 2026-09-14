import { useState, useCallback, useMemo } from 'react'
import OceanScene from '../scripts/OceanScene.jsx'
import InformationPanel from '../scripts/InformationPanel.jsx'
import { isWebGLAvailable } from '../scripts/webgl.js'
import { getZoneForDepth } from '../scripts/data.js'

export default function Home() {
  const [depth, setDepth] = useState(5)
  const [webglOk] = useState(() => isWebGLAvailable())
  const [activeEntity, setActiveEntity] = useState(null)

  const handleDepthChange = useCallback((d) => {
    setDepth(Math.round(d))
  }, [])

  const handleActivate = useCallback((data) => {
    setActiveEntity(data)
    if (document.exitPointerLock) document.exitPointerLock()
  }, [])

  const zone = useMemo(() => getZoneForDepth(depth), [depth])

  if (!webglOk) {
    return (
      <div className="webgl-fallback">
        <h1>3D experience unavailable</h1>
        <p>
          Your browser does not support WebGL, which the Ocean Explorer needs to run. Try a
          recent version of Chrome, Edge, Firefox, or Safari.
        </p>
      </div>
    )
  }

  return (
    <div className="explorer-container">
      <OceanScene onDepthChange={handleDepthChange} onActivate={handleActivate} />
      <div className="crosshair" aria-hidden="true" />
      <div className="hud-overlay">
        <div className="hud-depth glass-panel">
          <div className="depth-label">DEPTH</div>
          <div className="depth-value">{depth}m</div>
          <div className="zone-label">{zone.name}</div>
        </div>
        <div className="hud-hint">
          Click to look around, WASD to swim, Space or Shift to rise and dive. Look at
          something and click to inspect it.
        </div>
      </div>
      <InformationPanel data={activeEntity} onClose={() => setActiveEntity(null)} />
    </div>
  )
}
