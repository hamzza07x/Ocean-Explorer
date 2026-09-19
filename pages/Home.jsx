import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import OceanScene from '../scripts/OceanScene.jsx'
import InformationPanel from '../scripts/InformationPanel.jsx'
import OceanZones from '../scripts/OceanZones.jsx'
import Search from '../scripts/Search.jsx'
import MobileControls from '../scripts/MobileControls.jsx'
import TargetSystem from '../scripts/TargetSystem.jsx'
import Scanner from '../scripts/Scanner.jsx'
import Sonar from '../scripts/Sonar.jsx'
import Navigation from '../scripts/Navigation.jsx'
import MiniMap from '../scripts/MiniMap.jsx'
import { isWebGLAvailable } from '../scripts/webgl.js'
import { zones } from '../scripts/data.js'
import { useSettings } from '../scripts/Settings.jsx'
import { useDiscovery } from '../scripts/DiscoverySystem.jsx'

const DEFAULT_SPAWN = [0, -5, 15]
const LOCAL_DEPTH_MIN = 1
const LOCAL_DEPTH_MAX = 55
const TRANSITION_FADE_MS = 500
const SONAR_FADE_MS = 6000
const NOTICE_MS = 3200

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

  const [targetedEntity, setTargetedEntity] = useState(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [sonarResults, setSonarResults] = useState(null)
  const [navigationTargetId, setNavigationTargetId] = useState(null)
  const [navigationTarget, setNavigationTarget] = useState(null)
  const [navUpdate, setNavUpdate] = useState({ distance: 0, angle: 0, arrived: false })
  const [minimapData, setMinimapData] = useState(null)
  const [notice, setNotice] = useState(null)

  const { settings } = useSettings()
  const { markDiscovered, lastDiscoveredName } = useDiscovery()

  // Shared with MobileControls: it writes into these every touch event,
  // Controls.jsx reads them every frame. Plain refs cross the DOM/Canvas
  // boundary cheaply without triggering React re-renders on every touch move.
  const touchInput = useRef({ move: { forward: 0, strafe: 0 }, look: { x: 0, y: 0 }, ascend: 0 })
  const activateSignal = useRef(false)
  const sonarSignal = useRef(false)
  const sonarFadeTimer = useRef(null)
  const noticeTimer = useRef(null)
  const wasArrivedRef = useRef(false)

  const showNotice = useCallback((text) => {
    setNotice(text)
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS)
  }, [])

  const handleDepthChange = useCallback((d) => setLocalDepth(d), [])

  const handleActivate = useCallback((data) => {
    setActiveEntity(data)
    if (document.exitPointerLock) document.exitPointerLock()
  }, [])

  useEffect(() => {
    if (activeEntity) markDiscovered(activeEntity.id, activeEntity.name)
  }, [activeEntity, markDiscovered])

  const handleTargetChange = useCallback((data) => setTargetedEntity(data), [])
  const handleScanProgress = useCallback((p) => setScanProgress(p), [])

  const handleSonarSweep = useCallback(() => {
    sonarSignal.current = true
    if (sonarFadeTimer.current) clearTimeout(sonarFadeTimer.current)
    sonarFadeTimer.current = setTimeout(() => setSonarResults(null), SONAR_FADE_MS)
  }, [])
  const handleSonarResult = useCallback((results) => setSonarResults(results), [])

  const handleNavigate = useCallback((entry) => {
    wasArrivedRef.current = false
    setNavigationTargetId(entry.id)
    setNavigationTarget(entry)
  }, [])
  const handleNavCancel = useCallback(() => {
    setNavigationTargetId(null)
    setNavigationTarget(null)
  }, [])
  const handleNavUpdate = useCallback(
    (update) => {
      setNavUpdate(update)
      if (update.arrived && !wasArrivedRef.current) {
        wasArrivedRef.current = true
        showNotice(`Destination reached: ${navigationTarget?.name || ''}`)
        setNavigationTargetId(null)
        setNavigationTarget(null)
      } else if (!update.arrived) {
        wasArrivedRef.current = false
      }
    },
    [navigationTarget, showNotice]
  )

  const handleMinimapUpdate = useCallback((data) => setMinimapData(data), [])

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
      // A zone swap remounts the whole Canvas (key={activeZoneId} below),
      // so anything mid-flight from the old room — an active navigation
      // target, sonar results, whatever was targeted — no longer refers
      // to anything real. Clear it rather than leave stale state pointing
      // at objects that don't exist anymore.
      setNavigationTargetId(null)
      setNavigationTarget(null)
      setSonarResults(null)
      setTargetedEntity(null)
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
        onTargetChange={handleTargetChange}
        onScanProgress={handleScanProgress}
        sonarSignal={sonarSignal}
        onSonarResult={handleSonarResult}
        navigationTargetId={navigationTargetId}
        onNavigationUpdate={handleNavUpdate}
        onMinimapUpdate={handleMinimapUpdate}
      />

      {!isTouch && (
        <>
          <div className="crosshair" aria-hidden="true" />
          <Scanner progress={scanProgress} />
          <TargetSystem target={targetedEntity} isTouch={false} scanning={scanProgress > 0} />
        </>
      )}
      {isTouch && (
        <>
          <MobileControls touchInput={touchInput} activateSignal={activateSignal} />
          <TargetSystem target={targetedEntity} isTouch />
        </>
      )}

      {settings.showHUD && (
        <>
          <OceanZones activeZoneId={activeZoneId} onSelectZone={changeZone} disabled={transitioning} />
          <MiniMap data={minimapData} />

          <div className="top-right-controls">
            <Sonar onSweep={handleSonarSweep} results={sonarResults} />
            <button type="button" className="search-toggle glass-panel" onClick={() => setShowSearch((v) => !v)}>
              Search
            </button>
          </div>
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
              Look at something, then {isTouch ? 'tap Interact' : 'hold E'} to scan it.
            </div>
          </div>

          <Navigation
            target={navigationTarget}
            distance={navUpdate.distance}
            angle={navUpdate.angle}
            arrived={navUpdate.arrived}
            onCancel={handleNavCancel}
          />
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
      {notice && (
        <div className="discovery-toast notice-toast glass-panel" role="status">
          <span className="discovery-toast-name">{notice}</span>
        </div>
      )}

      <InformationPanel data={activeEntity} onClose={() => setActiveEntity(null)} onNavigate={handleNavigate} />

      <div className={`zone-transition-overlay ${transitioning ? 'active' : ''}`} aria-hidden="true" />
      {transitioning && (
        <div className="zone-title-card" aria-hidden="true">
          <span>{transitionZoneName}</span>
        </div>
      )}
    </div>
  )
}
