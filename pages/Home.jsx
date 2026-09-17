import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import OceanScene from '../scripts/OceanScene.jsx'
import InformationPanel from '../scripts/InformationPanel.jsx'
import OceanZones from '../scripts/OceanZones.jsx'
import Search from '../scripts/Search.jsx'
import MobileControls from '../scripts/MobileControls.jsx'
import { isWebGLAvailable } from '../scripts/webgl.js'
import { zones } from '../scripts/data.js'
import { useSettings } from '../scripts/Settings.jsx'
import { useDiscovery } from '../scripts/DiscoverySystem.jsx'

const DEFAULT_SPAWN = [0, -5, 15]
const LOCAL_DEPTH_MIN = 1
const LOCAL_DEPTH_MAX = 55
const TRANSITION_FADE_MS = 500

function detectTouch() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || window.matchMedia('(max-width: 768px)').matches
}

export default function Home() {
  const [webglOk] = useState(() => isWebGLAvailable())
  const [isTouch] = useState(detectTouch)
  const [localDepth, setLocalDepth] = useState(5)
  const [activeEntity, setActiveEntity] = useState(null)
  const [activeZoneId, setActiveZoneId] = useState('sunlit')
  const [spawnPosition, setSpawnPosition] = useState(DEFAULT_SPAWN)
  const [transitioning, setTransitioning] = useState(false)
  const [pendingZone, setPendingZone] = useState(null)
  const [showSearch, setShowSearch] = useState(false)

  const { settings } = useSettings()
  const { markDiscovered, lastDiscoveredName } = useDiscovery()

  // Shared with MobileControls: it writes into these every touch event,
  // Controls.jsx reads them every frame. Plain refs cross the DOM/Canvas
  // boundary cheaply without triggering React re-renders on every touch move.
  const touchInput = useRef({ move: { forward: 0, strafe: 0 }, look: { x: 0, y: 0 }, ascend: 0 })
  const activateSignal = useRef(false)

  const handleDepthChange = useCallback((d) => setLocalDepth(d), [])

  const handleActivate = useCallback((data) => {
    setActiveEntity(data)
    if (document.exitPointerLock) document.exitPointerLock()
  }, [])

  useEffect(() => {
    if (activeEntity) markDiscovered(activeEntity.id, activeEntity.name)
  }, [activeEntity, markDiscovered])

  // Zones are separate "rooms" rather than one continuous 6000m-deep space,
  // so switching one is a teleport-with-transition (per the brief's own
  // zone-transition section) rather than organic descent. spawnNear lets
  // search results land you close to what you searched for; openEntity
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
    const progress = Math.min(1, Math.max(0, (localDepth - LOCAL_DEPTH_MIN) / (LOCAL_DEPTH_MAX - LOCAL_DEPTH_MIN)))
    return Math.round(activeZone.minDepth + progress * (activeZone.maxDepth - activeZone.minDepth))
  }, [localDepth, activeZone])

  const transitionZoneName = pendingZone ? zones.find((z) => z.id === pendingZone.id)?.name : ''

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
        isTouch={isTouch}
        touchInput={touchInput}
        activateSignal={activateSignal}
      />

      {!isTouch && <div className="crosshair" aria-hidden="true" />}
      {isTouch && <MobileControls touchInput={touchInput} activateSignal={activateSignal} />}

      {settings.showHUD && (
        <>
          <OceanZones activeZoneId={activeZoneId} onSelectZone={changeZone} disabled={transitioning} />

          <button type="button" className="search-toggle glass-panel" onClick={() => setShowSearch((v) => !v)}>
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
              {isTouch
                ? 'Drag to look around, use the joystick to swim, the arrows to rise and dive.'
                : 'Click to look around, WASD to swim, Space or Shift to rise and dive.'}{' '}
              Look at something, then {isTouch ? 'tap Interact' : 'click'} to inspect it.
            </div>
          </div>
        </>
      )}

      {lastDiscoveredName && (
        <div className="discovery-toast glass-panel" role="status">
          <span className="discovery-toast-icon" aria-hidden="true">
            {'\u2713'}
          </span>
          <div>
            <div className="discovery-toast-label">Discovered</div>
            <div className="discovery-toast-name">{lastDiscoveredName}</div>
          </div>
        </div>
      )}

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
