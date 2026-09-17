import { createContext, useContext, useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const RegistryContext = createContext(null)
const TargetContext = createContext(null)

const MAX_INTERACT_DISTANCE = 45

// PointerLockControls captures the mouse, so its on-screen position stays
// frozen the moment lock engages — the usual onPointerOver/onClick mesh
// props raycast from that frozen point, not from where the camera is
// actually looking. The fix used by every pointer-locked 3D app is to
// raycast from the camera's forward direction instead (i.e. the crosshair
// at screen center) rather than from the cursor at all.
export function InteractionProvider({ children, onActivate, activateSignal }) {
  const registry = useRef(new Map())
  const [targetId, setTargetId] = useState(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const tempDirection = useMemo(() => new THREE.Vector3(), [])
  const { camera } = useThree()

  const register = useCallback((id, ref, data) => {
    registry.current.set(id, { ref, data })
  }, [])
  const unregister = useCallback((id) => {
    registry.current.delete(id)
  }, [])

  useFrame(() => {
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

    setTargetId((prev) => (prev === closestId ? prev : closestId))

    // Touch devices have no pointer lock to gate a document click on, so
    // they signal "activate" through this ref instead (set by the mobile
    // Interact button). Checked against closestId computed just above,
    // not the targetId state, since state updates are async and this
    // avoids a one-frame lag between "what you're looking at" and "what
    // gets activated."
    if (activateSignal?.current) {
      activateSignal.current = false
      if (closestId) {
        const entry = registry.current.get(closestId)
        if (entry && onActivate) onActivate(entry.data)
      }
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
