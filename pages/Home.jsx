import { useState, useCallback, useEffect, useMemo } from 'react'
import OceanScene from '../scripts/OceanScene.jsx'
import InformationPanel from '../scripts/InformationPanel.jsx'
import OceanZones from '../scripts/OceanZones.jsx'
import Search from '../scripts/Search.jsx'
import { isWebGLAvailable } from '../scripts/webgl.js'
import { zones } from '../scripts/data.js'

const DEFAULT_SPAWN = [0, -5, 15]
const LOCAL_DEPTH_MIN = 1
const LOCAL_DEPTH_MAX = 55
const TRANSITION_FADE_MS = 500

export default function Home() {
  const [webglOk] = useState(() => isWebGLAvailable())
  const [localDepth, setLocalDepth] = useState(5)
  const [activeEntity, setActiveEntity] = useState(null)
  const [activeZoneId, setActiveZoneId] = useState('sunlit')
  const [spawnPosition, setSpawnPosition] = useState(DEFAULT_SPAWN)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingZone, setPendingZone] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

  const handleDepthChange = useCallback((d) => setLocalDepth(d), [])

  const handleActivate = useCallback((data) => {
    setActiveEntity(data)
    if (document.exitPointerLock) document.exitPointerLock()
  }, [])

  // Zones are separate "rooms" now rather than one continuous 6000m-deep
  // space, so switching one is a teleport-with-transition (per the brief's
  // own zone-transition section) rather than organic descent. spawnNear
  // lets search results land you close to what you searched for; openEntity
  // opens its info panel once the new room has actually mounted.
  const changeZone = useCallback(
    (zoneId, { spawnNear, openEntity } = {}) => {
      if (zoneId === activeZoneId) {
        if (openEntity) {
          setActiveEntity(openEntity)
          if (document.exitPointerLock) document.exitPointerLock()
        }
        return
      }
      const spawn = spawnNear
        ? [spawnNear[0], Math.min(-1, Math.max(spawnNear[1] + 4, -54)), spawnNear[2] + 9]
        : DEFAULT_SPAWN
      setTransitioning(true)
      setPendingZone({ id: zoneId, spawn, openEntity: openEntity || null })
    },
    [activeZoneId]
  )

  useEffect(() => {
    if (!transitioning || !pendingZone) return undefined
    let revealTimer
    const swapTimer = setTimeout(() => {
      setActiveZoneId(pendingZone.id)
      setSpawnPosition(pendingZone.spawn)
      setLocalDepth(Math.abs(pendingZone.spawn[1]))
      revealTimer = setTimeout(() => {
        setTransitioning(false)
        if (pendingZone.openEntity) setActiveEntity(pendingZone.openEntity)
        setPendingZone(null)
      }, 80)
    }, TRANSITION_FADE_MS)
    return () => {
      clearTimeout(swapTimer)
      clearTimeout(revealTimer)
    }
  }, [transitioning, pendingZone])

  const handleSearchSelect = useCallback(
    (entry) => {
      setShowSearch(false)
      changeZone(entry.zone, { spawnNear: entry.position, openEntity: entry })
    },
    [changeZone]
  )

  const activeZone = useMemo(() => zones.find((z) => z.id === activeZoneId) || zones[0], [activeZoneId])

  const displayDepth = useMemo(() => {
    const progress = Math.min(
      1,
      Math.max(0, (localDepth - LOCAL_DEPTH_MIN) / (LOCAL_DEPTH_MAX - LOCAL_DEPTH_MIN))
    )
    return Math.round(activeZone.minDepth + progress * (activeZone.maxDepth - activeZone.minDepth))
  }, [localDepth, activeZone])

  const transitionZoneName = pendingZone
    ? zones.find((z) => z.id === pendingZone.id)?.name
    : ''

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
      <OceanScene
        key={activeZoneId}
        zone={activeZone}
        zoneId={activeZoneId}
        spawnPosition={spawnPosition}
        onDepthChange={handleDepthChange}
        onActivate={handleActivate}
      />
      <div className="crosshair" aria-hidden="true" />

      <OceanZones activeZoneId={activeZoneId} onSelectZone={changeZone} disabled={transitioning} />

      <button
        type="button"
        className="search-toggle glass-panel"
        onClick={() => setShowSearch((v) => !v)}
      >
        Search
      </button>
      {showSearch && <Search onSelect={handleSearchSelect} onClose={() => setShowSearch(false)} />}

      <div className="hud-overlay">
        <div className="hud-depth glass-panel">
          <div className="depth-label">DEPTH</div>
          <div className="depth-value">{displayDepth}m</div>
          <div className="zone-label">{activeZone.name}</div>
        </div>
        <div className="hud-hint">
          Click to look around, WASD to swim, Space or Shift to rise and dive. Look at
          something and click to inspect it.
        </div>
      </div>

      <InformationPanel data={activeEntity} onClose={() => setActiveEntity(null)} />

      <div className={`zone-transition-overlay ${transitioning ? 'active' : ''}`} aria-hidden="true" />
      {transitioning && (
        <div className="zone-title-card" aria-hidden="true">
          <span>{transitionZoneName}</span>
        </div>
      )}
    </div>
  )
}
