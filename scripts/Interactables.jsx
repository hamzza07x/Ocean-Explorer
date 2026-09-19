import { createContext, useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const RegistryContext = createContext(null)
const TargetContext = createContext(null)

const MAX_INTERACT_DISTANCE = 45
const SONAR_RANGE = 150
const MINIMAP_RANGE = 70
const SCAN_HOLD_SECONDS = 1.4

// PointerLockControls captures the mouse, so its on-screen position stays
// frozen the moment lock engages — the usual onPointerOver/onClick mesh
// props raycast from that frozen point, not from where the camera is
// actually looking. The fix used by every pointer-locked 3D app is to
// raycast from the camera's forward direction instead (i.e. the crosshair
// at screen center) rather than from the cursor at all.
//
// This component is also the shared home for everything else that needs
// live camera position + the registry of interactive objects: sonar,
// mini-map, and point-of-interest navigation all reuse the same registry
// rather than each maintaining their own copy of "where is everything."
export function InteractionProvider({
  children,
  onActivate,
  activateSignal,
  onTargetChange,
  onScanProgress,
  sonarSignal,
  onSonarResult,
  navigationTargetId,
  onNavigationUpdate,
  onMinimapUpdate
}) {
  const registry = useRef(new Map())
  const [targetId, setTargetId] = useState(null)
  const lastTargetRef = useRef(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const tempDirection = useMemo(() => new THREE.Vector3(), [])
  const tempToTarget = useMemo(() => new THREE.Vector3(), [])
  const tempForwardFlat = useMemo(() => new THREE.Vector3(), [])
  const { camera } = useThree()
  const scanProgress = useRef(0)
  const scanKeyHeld = useRef(false)
  const minimapTimer = useRef(0)

  const register = useCallback((id, ref, data) => {
    registry.current.set(id, { ref, data })
  }, [])
  const unregister = useCallback((id) => {
    registry.current.delete(id)
  }, [])

  // E is "scan" on desktop, held rather than tapped, so the scan animation
  // has time to play. Touch keeps its own instant tap-to-interact button
  // (in MobileControls) rather than a hold-timer, which would be one more
  // thing to get right with no way to test it on an actual touchscreen.
  useEffect(() => {
    const handleDown = (e) => {
      if (e.code === 'KeyE') scanKeyHeld.current = true
    }
    const handleUp = (e) => {
      if (e.code === 'KeyE') scanKeyHeld.current = false
    }
    const handleBlur = () => {
      scanKeyHeld.current = false
    }
    document.addEventListener('keydown', handleDown)
    document.addEventListener('keyup', handleUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      document.removeEventListener('keydown', handleDown)
      document.removeEventListener('keyup', handleUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useFrame((state, delta) => {
    // --- targeting: same crosshair raycast as before ---
    camera.getWorldDirection(tempDirection)
    raycaster.far = MAX_INTERACT_DISTANCE
    raycaster.set(camera.position, tempDirection)

    let closestId = null
    let closestDistance = Infinity
    registry.current.forEach(({ ref }, id) => {
      if (!ref.current) return
      const hits = raycaster.intersectObject(ref.current, true)
      if (hits.length && hits[0].distance < closestDistance) {
        closestDistance = hits[0].distance
        closestId = id
      }
    })

    // Side effects (setState, callbacks) live here as plain statements in
    // useFrame's callback, not inside a setState updater function — an
    // updater can run twice under StrictMode, and this app renders in
    // StrictMode, so anything with a side effect has to stay out of one.
    if (closestId !== lastTargetRef.current) {
      lastTargetRef.current = closestId
      setTargetId(closestId)
      scanProgress.current = 0
      if (onScanProgress) onScanProgress(0)
      if (onTargetChange) {
        const entry = closestId ? registry.current.get(closestId) : null
        onTargetChange(entry ? entry.data : null)
      }
    }

    // --- activation: touch's instant tap ---
    if (activateSignal?.current) {
      activateSignal.current = false
      if (closestId) {
        const entry = registry.current.get(closestId)
        if (entry && onActivate) onActivate(entry.data)
      }
    }

    // --- activation: desktop's held scan, same onActivate as a click ---
    if (closestId && scanKeyHeld.current) {
      scanProgress.current = Math.min(1, scanProgress.current + delta / SCAN_HOLD_SECONDS)
      if (onScanProgress) onScanProgress(scanProgress.current)
      if (scanProgress.current >= 1) {
        scanProgress.current = 0
        if (onScanProgress) onScanProgress(0)
        const entry = registry.current.get(closestId)
        if (entry && onActivate) onActivate(entry.data)
      }
    } else if (scanProgress.current > 0) {
      scanProgress.current = 0
      if (onScanProgress) onScanProgress(0)
    }

    // --- sonar: a one-shot sweep computed on request, not every frame ---
    if (sonarSignal?.current) {
      sonarSignal.current = false
      const results = []
      registry.current.forEach(({ ref, data }) => {
        if (!ref.current) return
        const distance = ref.current.position.distanceTo(camera.position)
        if (distance <= SONAR_RANGE) {
          results.push({
            id: data.id,
            name: data.name,
            category: data.category,
            distance: Math.round(distance)
          })
        }
      })
      results.sort((a, b) => a.distance - b.distance)
      if (onSonarResult) onSonarResult(results)
    }

    // --- POI navigation: live distance + a rough left/right/ahead bearing ---
    if (navigationTargetId) {
      const entry = registry.current.get(navigationTargetId)
      if (entry && entry.ref.current) {
        const targetPos = entry.ref.current.position
        const distance = targetPos.distanceTo(camera.position)
        tempToTarget.subVectors(targetPos, camera.position)
        tempToTarget.y = 0
        tempToTarget.normalize()
        tempForwardFlat.copy(tempDirection)
        tempForwardFlat.y = 0
        tempForwardFlat.normalize()
        const angle = Math.atan2(
          tempForwardFlat.x * tempToTarget.z - tempForwardFlat.z * tempToTarget.x,
          tempForwardFlat.x * tempToTarget.x + tempForwardFlat.z * tempToTarget.z
        )
        if (onNavigationUpdate) {
          onNavigationUpdate({ distance: Math.round(distance), angle, arrived: distance < 8 })
        }
      }
    }

    // --- mini-map: throttled to ~5 updates/second, a radar doesn't need 60fps ---
    minimapTimer.current += delta
    if (onMinimapUpdate && minimapTimer.current > 0.2) {
      minimapTimer.current = 0
      const heading = Math.atan2(tempDirection.x, tempDirection.z)
      const nearby = []
      registry.current.forEach(({ ref, data }) => {
        if (!ref.current) return
        const dx = ref.current.position.x - camera.position.x
        const dz = ref.current.position.z - camera.position.z
        if (Math.hypot(dx, dz) <= MINIMAP_RANGE) {
          nearby.push({ id: data.id, category: data.category, dx, dz })
        }
      })
      onMinimapUpdate({ heading, nearby })
    }
  })

  useEffect(() => {
    const handleClick = () => {
      if (!document.pointerLockElement || !targetId) return
      const entry = registry.current.get(targetId)
      if (entry && onActivate) onActivate(entry.data)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [targetId, onActivate])

  return (
    <RegistryContext.Provider value={{ register, unregister }}>
      <TargetContext.Provider value={targetId}>{children}</TargetContext.Provider>
    </RegistryContext.Provider>
  )
}

// Any interactive mesh/group calls this with a unique id and its data
// object, attaches the returned ref to itself, and is automatically
// raycast-tested every frame without writing any raycasting code itself.
export function useRegisterInteractable(id, data) {
  const ref = useRef()
  const ctx = useContext(RegistryContext)

  useEffect(() => {
    if (!ctx) return
    ctx.register(id, ref, data)
    return () => ctx.unregister(id)
  }, [ctx, id, data])

  return ref
}

export function useIsTargeted(id) {
  const targetId = useContext(TargetContext)
  return targetId === id
}

export function useTargetId() {
  return useContext(TargetContext)
}
